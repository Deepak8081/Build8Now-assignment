import { describe, it, expect } from 'vitest';
import prisma from '../src/common/database/prisma.js';
import { LoyaltyLedgerService } from '../src/modules/loyalty/loyalty-ledger.service.js';

describe('Task 2: Append-Only Ledger & Reversals Suite (Refunds, Cancellations & Redemption Debt)', () => {
  it('handles 100% full cancellation reversal correctly', async () => {
    const timestamp = Date.now();

    const user = await prisma.user.create({
      data: {
        email: `cancel_user_${timestamp}@test.com`,
        passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        name: 'Cancellation User',
        role: 'INFLUENCER',
      },
    });

    const influencer = await prisma.influencer.create({
      data: {
        userId: user.id,
        type: 'ARCHITECT',
        referralCode: `CANCEL-${timestamp}`,
        pointsBalance: 500.0,
        lifetimePoints: 500.0,
      },
    });

    const custUser = await prisma.user.create({
      data: {
        email: `cancel_cust_${timestamp}@test.com`,
        passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        name: 'Cancellation Customer',
        role: 'CUSTOMER',
      },
    });

    const customer = await prisma.customer.create({
      data: {
        userId: custUser.id,
        referredById: influencer.id,
      },
    });

    const product = await prisma.product.findFirst();

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-CANCEL-${timestamp}`,
        customerId: customer.id,
        influencerId: influencer.id,
        status: 'COMPLETED',
        subtotal: 3800,
        totalAmount: 3800,
        items: {
          create: [{ productId: product.id, quantity: 10, unitPrice: 380, subtotal: 3800 }],
        },
      },
    });

    // 1. Accrue points
    const accrual = await LoyaltyLedgerService.processOrderAccrual(order.id, `accrual_${order.id}`);
    const originalPoints = accrual.ledgerEntry.pointsChange;

    // 2. Full Order Cancellation Reversal (100% refund)
    const refundResult = await LoyaltyLedgerService.processRefundReversal({
      orderId: order.id,
      refundAmount: 3800, // 100% full refund
      reason: 'Full order cancellation by client',
      idempotencyKey: `cancel_rev_${order.id}`,
    });

    expect(refundResult.pointsDeducted).toBe(originalPoints);
    expect(refundResult.newBalance).toBe(500.0); // restored back to initial
    expect(refundResult.ledgerEntry.eventType).toBe('ORDER_CANCEL_REVERSAL');
    expect(refundResult.ledgerEntry.pointsChange).toBe(-originalPoints);

    // Order status should be REFUNDED
    const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });
    expect(updatedOrder.status).toBe('REFUNDED');
    expect(updatedOrder.refundedAmount).toBe(3800);
  });

  it('handles proportional 50% partial refund reversal', async () => {
    const timestamp = Date.now();

    const user = await prisma.user.create({
      data: {
        email: `part_user_${timestamp}@test.com`,
        passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        name: 'Partial Refund User',
        role: 'CONTRACTOR',
      },
    });

    const influencer = await prisma.influencer.create({
      data: {
        userId: user.id,
        type: 'CONTRACTOR',
        referralCode: `PART-${timestamp}`,
        pointsBalance: 300.0,
        lifetimePoints: 300.0,
      },
    });

    const custUser = await prisma.user.create({
      data: {
        email: `part_cust_${timestamp}@test.com`,
        passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        name: 'Partial Customer',
        role: 'CUSTOMER',
      },
    });

    const customer = await prisma.customer.create({
      data: {
        userId: custUser.id,
        referredById: influencer.id,
      },
    });

    const product = await prisma.product.findFirst();

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-PART-${timestamp}`,
        customerId: customer.id,
        influencerId: influencer.id,
        status: 'COMPLETED',
        subtotal: 5000,
        totalAmount: 5000,
        items: {
          create: [{ productId: product.id, quantity: 5, unitPrice: 1000, subtotal: 5000 }],
        },
      },
    });

    const accrual = await LoyaltyLedgerService.processOrderAccrual(order.id, `accrual_${order.id}`);
    const originalPoints = accrual.ledgerEntry.pointsChange;

    // 50% partial refund
    const refundResult = await LoyaltyLedgerService.processRefundReversal({
      orderId: order.id,
      refundAmount: 2500,
      reason: 'Returned 2 out of 5 items',
      idempotencyKey: `part_refund_${order.id}`,
    });

    expect(refundResult.pointsDeducted).toBe(originalPoints * 0.5);
    expect(refundResult.ledgerEntry.eventType).toBe('ORDER_REFUND_REVERSAL');

    const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });
    expect(updatedOrder.status).toBe('PARTIALLY_REFUNDED');
    expect(updatedOrder.refundedAmount).toBe(2500);
  });

  it('creates Redemption Debt (negative balance) when points were spent before refund', async () => {
    const timestamp = Date.now();

    const user = await prisma.user.create({
      data: {
        email: `debt_user_${timestamp}@test.com`,
        passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        name: 'Debt User',
        role: 'INFLUENCER',
      },
    });

    // Influencer starts with 0 points
    const influencer = await prisma.influencer.create({
      data: {
        userId: user.id,
        type: 'BUILDER',
        referralCode: `DEBT-${timestamp}`,
        pointsBalance: 0.0,
        lifetimePoints: 0.0,
      },
    });

    const custUser = await prisma.user.create({
      data: {
        email: `debt_cust_${timestamp}@test.com`,
        passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        name: 'Debt Customer',
        role: 'CUSTOMER',
      },
    });

    const customer = await prisma.customer.create({
      data: {
        userId: custUser.id,
        referredById: influencer.id,
      },
    });

    const product = await prisma.product.findFirst();

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-DEBT-${timestamp}`,
        customerId: customer.id,
        influencerId: influencer.id,
        status: 'COMPLETED',
        subtotal: 2000,
        totalAmount: 2000,
        items: {
          create: [{ productId: product.id, quantity: 2, unitPrice: 1000, subtotal: 2000 }],
        },
      },
    });

    // 1. Accrue points (e.g. 100 points)
    const accrual = await LoyaltyLedgerService.processOrderAccrual(order.id, `accrual_${order.id}`);
    const pointsAwarded = accrual.ledgerEntry.pointsChange;

    // 2. Simulate influencer spending/redeeming points outside (balance set back to 0)
    await prisma.influencer.update({
      where: { id: influencer.id },
      data: { pointsBalance: 0.0 },
    });

    // 3. Customer now returns the order -> Points must be reversed!
    const refundResult = await LoyaltyLedgerService.processRefundReversal({
      orderId: order.id,
      refundAmount: 2000,
      reason: 'Customer returned items after points were redeemed',
      idempotencyKey: `debt_refund_${order.id}`,
    });

    // Balance should become negative (-pointsAwarded) representing redemption debt
    expect(refundResult.newBalance).toBe(-pointsAwarded);
    expect(refundResult.redemptionDebtWarning).toBeDefined();
    expect(refundResult.ledgerEntry.runningBalance).toBe(-pointsAwarded);
  });
});
