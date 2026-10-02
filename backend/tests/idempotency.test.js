import { describe, it, expect } from 'vitest';
import prisma from '../src/common/database/prisma.js';
import { LoyaltyLedgerService } from '../src/modules/loyalty/loyalty-ledger.service.js';

describe('Task 2: DB-Level Idempotency & Replay Protection Suite', () => {
  it('awards points on first invocation and records in immutable ledger', async () => {
    const timestamp = Date.now();

    const user = await prisma.user.create({
      data: {
        email: `idemp_user1_${timestamp}@test.com`,
        passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        name: 'Idempotency User 1',
        role: 'INFLUENCER',
      },
    });

    const influencer = await prisma.influencer.create({
      data: {
        userId: user.id,
        type: 'ARCHITECT',
        referralCode: `IDEMP1-${timestamp}`,
        pointsBalance: 100.0,
        lifetimePoints: 100.0,
      },
    });

    const custUser = await prisma.user.create({
      data: {
        email: `idemp_cust1_${timestamp}@test.com`,
        passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        name: 'Idempotency Customer 1',
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
        orderNumber: `ORD-IDEMP1-${timestamp}`,
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

    const idempotencyKey = `key_${order.id}_first`;

    // 1. First Execution
    const firstCall = await LoyaltyLedgerService.processOrderAccrual(order.id, idempotencyKey);
    expect(firstCall.idempotent).toBe(false);
    expect(firstCall.ledgerEntry).toBeDefined();
    expect(firstCall.ledgerEntry.eventType).toBe('ORDER_ACCRUAL');
    const pointsAwarded = firstCall.ledgerEntry.pointsChange;

    const infAfterFirst = await prisma.influencer.findUnique({ where: { id: influencer.id } });
    expect(infAfterFirst.pointsBalance).toBe(100.0 + pointsAwarded);

    // 2. Exact Duplicate Webhook Replay
    const secondCall = await LoyaltyLedgerService.processOrderAccrual(order.id, idempotencyKey);
    expect(secondCall.idempotent).toBe(true);
    expect(secondCall.message).toContain('Idempotent replay detected');
    expect(secondCall.ledgerEntry.id).toBe(firstCall.ledgerEntry.id);

    // Balance must NOT increase on duplicate replay
    const infAfterSecond = await prisma.influencer.findUnique({ where: { id: influencer.id } });
    expect(infAfterSecond.pointsBalance).toBe(100.0 + pointsAwarded);

    // 3. Third Duplicate Webhook Replay with different key but same Order (Order already processed)
    const thirdCall = await LoyaltyLedgerService.processOrderAccrual(order.id, `different_key_${timestamp}`);
    expect(thirdCall.idempotent).toBe(true);
    expect(thirdCall.message).toContain('already been processed');

    // Total ledger entries for this order must remain exactly 1
    const ledgerCount = await prisma.loyaltyLedger.count({
      where: { orderId: order.id, eventType: 'ORDER_ACCRUAL' },
    });
    expect(ledgerCount).toBe(1);
  });
});
