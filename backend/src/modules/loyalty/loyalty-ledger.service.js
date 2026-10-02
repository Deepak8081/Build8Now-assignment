import prisma from '../../common/database/prisma.js';
import { MathHelper } from '../../common/helpers/math.helper.js';
import { LoyaltyEngine } from './loyalty.engine.js';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from '../../common/errors/index.js';
import { PaginationHelper } from '../../common/helpers/pagination.helper.js';

export class LoyaltyLedgerService {
  /**
   * Process and award loyalty points for a completed order (IDEMPOTENT)
   */
  static async processOrderAccrual(orderId, idempotencyKey) {
    // 1. Check DB-level idempotency key first
    const existingLedger = await prisma.loyaltyLedger.findFirst({
      where: {
        OR: [
          { idempotencyKey },
          { orderId, eventType: 'ORDER_ACCRUAL' },
        ],
      },
    });

    if (existingLedger) {
      return {
        idempotent: true,
        message: 'Order points have already been processed (Idempotent replay detected). No duplicate points awarded.',
        ledgerEntry: existingLedger,
      };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        influencer: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundError(`Order with ID '${orderId}' not found`);
    }

    if (!order.influencerId) {
      throw new BadRequestError('Cannot process loyalty points: No influencer is linked to this order.');
    }

    // Load active loyalty rules
    const activeRules = await prisma.loyaltyRule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    });

    const calculation = LoyaltyEngine.calculatePoints(order, activeRules);

    if (calculation.totalPointsEarned <= 0) {
      return {
        idempotent: false,
        message: 'Order does not qualify for any loyalty points.',
        calculation,
      };
    }

    const pointsToAward = calculation.totalPointsEarned;

    // Execute atomic transaction for append-only ledger and balance update
    const result = await prisma.$transaction(async (tx) => {
      // Re-verify inside transaction
      const doubleCheck = await tx.loyaltyLedger.findFirst({
        where: {
          OR: [
            { idempotencyKey },
            { orderId, eventType: 'ORDER_ACCRUAL' },
          ],
        },
      });

      if (doubleCheck) {
        return { idempotent: true, ledgerEntry: doubleCheck };
      }

      const influencer = await tx.influencer.findUnique({
        where: { id: order.influencerId },
      });

      if (!influencer) {
        throw new NotFoundError(`Influencer '${order.influencerId}' not found`);
      }

      const newBalance = MathHelper.round2(influencer.pointsBalance + pointsToAward);
      const newLifetime = MathHelper.round2(influencer.lifetimePoints + pointsToAward);

      // 1. Update influencer balance
      await tx.influencer.update({
        where: { id: order.influencerId },
        data: {
          pointsBalance: newBalance,
          lifetimePoints: newLifetime,
        },
      });

      // 2. Append entry to immutable ledger
      const ledger = await tx.loyaltyLedger.create({
        data: {
          influencerId: order.influencerId,
          orderId: order.id,
          eventType: 'ORDER_ACCRUAL',
          pointsChange: pointsToAward,
          runningBalance: newBalance,
          idempotencyKey,
          reason: `Loyalty points awarded for qualifying order ${order.orderNumber}`,
          metadataJson: JSON.stringify(calculation),
        },
      });

      return {
        idempotent: false,
        message: `Successfully awarded ${pointsToAward} points to influencer ${influencer.referralCode}`,
        ledgerEntry: ledger,
        calculation,
      };
    });

    return result;
  }

  /**
   * Process reversal for order cancellation or full/partial refund (IDEMPOTENT)
   */
  static async processRefundReversal({ orderId, refundAmount, reason, idempotencyKey }) {
    const key = idempotencyKey || `refund_${orderId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Check idempotency
    const existing = await prisma.loyaltyLedger.findUnique({
      where: { idempotencyKey: key },
    });

    if (existing) {
      return {
        idempotent: true,
        message: 'Refund reversal has already been processed with this idempotency key.',
        ledgerEntry: existing,
      };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        influencer: true,
        ledgerEntries: true,
      },
    });

    if (!order) {
      throw new NotFoundError(`Order with ID '${orderId}' not found`);
    }

    if (!order.influencerId) {
      throw new BadRequestError('This order was not linked to an influencer.');
    }

    // Find original accrual ledger entry
    const originalAccrual = order.ledgerEntries.find((e) => e.eventType === 'ORDER_ACCRUAL');
    if (!originalAccrual) {
      throw new BadRequestError('No points accrual record found for this order to reverse.');
    }

    const originalPoints = originalAccrual.pointsChange;
    const orderSubtotal = order.subtotal;

    // Calculate proportional reversal points
    // Reversal = (refundAmount / orderSubtotal) * originalPoints
    const refundRatio = Math.min(1.0, refundAmount / orderSubtotal);
    const pointsToDeduct = MathHelper.round2(originalPoints * refundRatio);

    if (pointsToDeduct <= 0) {
      throw new BadRequestError('Calculated reversal points must be greater than 0.');
    }

    const eventType =
      refundAmount >= order.subtotal ? 'ORDER_CANCEL_REVERSAL' : 'ORDER_REFUND_REVERSAL';

    // Execute atomic reversal transaction
    const result = await prisma.$transaction(async (tx) => {
      const influencer = await tx.influencer.findUnique({
        where: { id: order.influencerId },
      });

      // Calculate new balance (can become negative if points were already spent/redeemed)
      const newBalance = MathHelper.round2(influencer.pointsBalance - pointsToDeduct);
      const isNegative = newBalance < 0;

      // 1. Update influencer balance
      await tx.influencer.update({
        where: { id: order.influencerId },
        data: {
          pointsBalance: newBalance,
        },
      });

      // 2. Update Order refund details
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: refundAmount >= order.subtotal ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
          refundedAmount: MathHelper.round2((order.refundedAmount || 0) + refundAmount),
        },
      });

      // 3. Append debit record in ledger
      const ledger = await tx.loyaltyLedger.create({
        data: {
          influencerId: order.influencerId,
          orderId: order.id,
          eventType,
          pointsChange: -pointsToDeduct, // negative change
          runningBalance: newBalance,
          idempotencyKey: key,
          reason: `${reason} (Reversed ${pointsToDeduct} pts for ₹${refundAmount} refund)`,
          metadataJson: JSON.stringify({
            originalPoints,
            orderSubtotal,
            refundAmount,
            refundRatio,
            pointsToDeduct,
            redemptionDebtCreated: isNegative,
          }),
        },
      });

      return {
        idempotent: false,
        message: `Reversed ${pointsToDeduct} points for order ${order.orderNumber}.`,
        pointsDeducted: pointsToDeduct,
        newBalance,
        redemptionDebtWarning: isNegative
          ? 'Points were already redeemed prior to refund. Influencer balance is now negative (Redemption Debt).'
          : null,
        ledgerEntry: ledger,
      };
    });

    return result;
  }

  /**
   * Get ledger history for an influencer with pagination
   */
  static async getInfluencerLedger(influencerId, query = {}) {
    const { skip, take, page, limit } = PaginationHelper.parse(query);

    const [total, items] = await Promise.all([
      prisma.loyaltyLedger.count({ where: { influencerId } }),
      prisma.loyaltyLedger.findMany({
        where: { influencerId },
        skip,
        take,
        include: {
          order: {
            select: {
              orderNumber: true,
              totalAmount: true,
              status: true,
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
   * List or create loyalty rules
   */
  static async listRules() {
    return prisma.loyaltyRule.findMany({
      orderBy: { priority: 'desc' },
    });
  }

  static async createRule(data) {
    return prisma.loyaltyRule.create({
      data,
    });
  }

  static async updateRule(id, data) {
    const existing = await prisma.loyaltyRule.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Loyalty rule with ID '${id}' not found`);
    }
    return prisma.loyaltyRule.update({
      where: { id },
      data,
    });
  }

  static async deactivateRule(id) {
    const existing = await prisma.loyaltyRule.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Loyalty rule with ID '${id}' not found`);
    }
    return prisma.loyaltyRule.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
