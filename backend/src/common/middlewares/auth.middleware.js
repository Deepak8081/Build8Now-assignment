import jwt from 'jsonwebtoken';
import { env } from '../../config/env.config.js';
import { UnauthorizedError } from '../errors/index.js';
import prisma from '../database/prisma.js';

/**
 * Authentication Middleware
 * Extracts Bearer token, verifies JWT, and attaches authenticated user context to req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing. Please provide Authorization: Bearer <token>');
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Authentication token has expired. Please login again');
      }
      throw new UnauthorizedError('Invalid authentication token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        customer: true,
        influencer: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User account not found or deactivated');
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      customerId: user.customer?.id || null,
      influencerId: user.influencer?.id || null,
    };

    next();
  } catch (error) {
    next(error);
  }
};
