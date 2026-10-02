import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../common/database/prisma.js';
import { env } from '../../config/env.config.js';
import { ConflictError, UnauthorizedError, NotFoundError, BadRequestError } from '../../common/errors/index.js';
import { EmailValidator } from '../../common/helpers/email-validator.helper.js';

export class AuthService {
  /**
   * Register a new user (ADMIN, CUSTOMER, or INFLUENCER)
   */
  static async register(data) {
    // 1. Verify email format and DNS MX server records
    await EmailValidator.validateEmailWithMx(data.email);

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    let createdUser;

    // Use transaction to ensure user + profile atomicity
    await prisma.$transaction(async (tx) => {
      createdUser = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          name: data.name,
          role: data.role,
        },
      });

      if (data.role === 'INFLUENCER') {
        const referralCode =
          data.customReferralCode?.toUpperCase() ||
          `INF-${data.name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

        await tx.influencer.create({
          data: {
            userId: createdUser.id,
            type: data.influencerType || 'ARCHITECT',
            referralCode,
          },
        });
      } else if (data.role === 'CUSTOMER') {
        let referredById = null;

        if (data.referralCode) {
          const influencer = await tx.influencer.findUnique({
            where: { referralCode: data.referralCode.toUpperCase() },
          });
          if (influencer) {
            referredById = influencer.id;
          }
        }

        const customer = await tx.customer.create({
          data: {
            userId: createdUser.id,
            phone: data.phone || null,
            address: data.address || null,
            referredById,
          },
        });

        if (referredById) {
          await tx.referral.create({
            data: {
              influencerId: referredById,
              customerId: customer.id,
            },
          });
        }
      }
    });

    const userWithProfile = await prisma.user.findUnique({
      where: { id: createdUser.id },
      include: {
        customer: true,
        influencer: true,
      },
    });

    const token = this.generateToken(userWithProfile);

    return {
      user: this.sanitizeUser(userWithProfile),
      token,
    };
  }

  /**
   * Login user with email & password
   */
  static async login({ email, password }) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        customer: true,
        influencer: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Get authenticated user profile
   */
  static async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customer: {
          include: { referredBy: true },
        },
        influencer: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    return this.sanitizeUser(user);
  }

  static generateToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        customerId: user.customer?.id || null,
        influencerId: user.influencer?.id || null,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  }

  static sanitizeUser(user) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
