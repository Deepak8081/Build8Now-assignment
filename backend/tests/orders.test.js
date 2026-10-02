import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/common/database/prisma.js';

describe('Orders & Procurement Lifecycle Test Suite', () => {
  let customerToken = '';
  let customerId = '';
  let influencerId = '';
  let product1 = null;
  let product2 = null;

  const timestamp = Date.now();

  beforeAll(async () => {
    // 1. Create Influencer (Architect)
    const infUser = await prisma.user.create({
      data: {
        email: `orders_inf_${timestamp}@build8now.com`,
        passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        name: 'Order Test Architect',
        role: 'INFLUENCER',
      },
    });

    const influencer = await prisma.influencer.create({
      data: {
        userId: infUser.id,
        type: 'ARCHITECT',
        referralCode: `REF-ORD-${timestamp}`,
        pointsBalance: 0,
        lifetimePoints: 0,
      },
    });
    influencerId = influencer.id;

    // 2. Register Customer linked to Influencer
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `orders_cust_${timestamp}@gmail.com`,
        password: 'Password123!',
        name: 'Procurement Customer',
        role: 'CUSTOMER',
        referralCode: `REF-ORD-${timestamp}`,
      });

    customerToken = regRes.body.data.token;
    customerId = regRes.body.data.user.customer.id;

    // 3. Fetch sample products
    const products = await prisma.product.findMany({ take: 2 });
    product1 = products[0];
    product2 = products[1];
  });

  it('places a multi-item order with automated freight calculation and referral attribution', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [
          { productId: product1.id, quantity: 5 },
          { productId: product2.id, quantity: 2 },
        ],
        distanceKm: 25,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toBeDefined();
    expect(res.body.data.customerId).toBe(customerId);
    expect(res.body.data.influencerId).toBe(influencerId); // Automatically linked!
    expect(res.body.data.status).toBe('PENDING');
    expect(res.body.data.items.length).toBe(2);
    expect(res.body.data.shippingCost).toBeGreaterThan(0);
    expect(res.body.data.totalAmount).toBe(res.body.data.subtotal + res.body.data.shippingCost);
  });

  it('lists orders isolated strictly to the authenticated customer', async () => {
    const res = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    // Every order in list must belong to this customer
    res.body.data.forEach((ord) => {
      expect(ord.customerId).toBe(customerId);
    });
  });
});
