import prisma from '../../common/database/prisma.js';
import { NotFoundError, BadRequestError } from '../../common/errors/index.js';
import { PaginationHelper } from '../../common/helpers/pagination.helper.js';

export class InfluencerService {
  /**
   * List influencers (Admin only)
   */
  static async listInfluencers(query = {}) {
    const { skip, take, page, limit } = PaginationHelper.parse(query);
    const where = {};

    if (query.type) {
      where.type = query.type;
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true' || query.isActive === true;
    }

    const [total, items] = await Promise.all([
      prisma.influencer.count({ where }),
      prisma.influencer.findMany({
        where,
        skip,
        take,
        include: {
          user: { select: { name: true, email: true } },
          _count: {
            select: {
              referredCustomers: true,
              attributedOrders: true,
              ledgerEntries: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      items,
      pagination: PaginationHelper.formatMeta(total, page, limit),
    };
  }

  /**
   * Get single influencer profile by ID (with balance, referrals and stats)
   */
  static async getInfluencerById(id) {
    const influencer = await prisma.influencer.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        referredCustomers: {
          include: { user: { select: { name: true, email: true } } },
        },
        _count: {
          select: {
            attributedOrders: true,
            ledgerEntries: true,
          },
        },
      },
    });

    if (!influencer) {
      throw new NotFoundError(`Influencer with ID '${id}' not found`);
    }

    return influencer;
  }

  /**
   * Link a customer to an influencer via referral code
   */
  static async linkCustomerToInfluencer(customerId, referralCode) {
    const influencer = await prisma.influencer.findUnique({
      where: { referralCode: referralCode.toUpperCase() },
    });

    if (!influencer) {
      throw new NotFoundError(`Influencer with referral code '${referralCode}' not found`);
    }

    if (!influencer.isActive) {
      throw new BadRequestError('This influencer account is currently inactive.');
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundError(`Customer with ID '${customerId}' not found`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedCustomer = await tx.customer.update({
        where: { id: customerId },
        data: { referredById: influencer.id },
      });

      // Upsert referral relation
      await tx.referral.upsert({
        where: {
          influencerId_customerId: {
            influencerId: influencer.id,
            customerId: customer.id,
          },
        },
        update: {},
        create: {
          influencerId: influencer.id,
          customerId: customer.id,
        },
      });

      return updatedCustomer;
    });

    return {
      message: `Customer successfully linked to influencer ${influencer.referralCode}`,
      customer: updated,
      influencer: {
        id: influencer.id,
        type: influencer.type,
        referralCode: influencer.referralCode,
      },
    };
  }
}
