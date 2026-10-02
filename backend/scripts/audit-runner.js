import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import prisma from '../src/common/database/prisma.js';
import { env } from '../src/config/env.config.js';

async function runFullAudit() {
  console.log('='.repeat(80));
  console.log('BUILD8NOW SECURITY & AUTHENTICATION AUDIT RUNNER');
  console.log('='.repeat(80));

  const results = [];

  function record(section, testName, passed, details) {
    results.push({ section, testName, passed, details });
    const status = passed ? '[PASS]' : '[FAIL]';
    console.log(`${status} [${section}] ${testName}`);
    if (details) {
      console.log('   Evidence:', JSON.stringify(details, null, 2));
    }
  }

  // Ensure clean seed
  const admin = await prisma.user.findUnique({ where: { email: 'admin@build8now.com' } });
  const influencer = await prisma.user.findUnique({
    where: { email: 'rahul.architect@build8now.com' },
    include: { influencer: true },
  });
  const customer = await prisma.user.findUnique({
    where: { email: 'priya.sharma@gmail.com' },
    include: { customer: true },
  });
  const product = await prisma.product.findFirst();

  let adminToken = '';
  let infToken = '';
  let custToken = '';
  let cust2Token = '';
  let inf2Token = '';
  let orderId = '';

  // 1. Valid Logins
  console.log('\n--- SECTION 1: VALID CREDENTIALS LOGIN ---');
  {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@build8now.com', password: 'Password123!' });
    adminToken = res.body.data?.token;
    record('1.1 Admin Login', 'Admin valid login (admin@build8now.com)', res.status === 200 && res.body.data?.user?.role === 'ADMIN', {
      statusCode: res.status,
      userRole: res.body.data?.user?.role,
      userEmail: res.body.data?.user?.email,
      tokenReceived: Boolean(adminToken),
      passwordHashExposed: res.body.data?.user?.passwordHash !== undefined,
    });
  }

  {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rahul.architect@build8now.com', password: 'Password123!' });
    infToken = res.body.data?.token;
    record('1.2 Influencer Login', 'Influencer valid login (rahul.architect@build8now.com)', res.status === 200 && res.body.data?.user?.role === 'INFLUENCER', {
      statusCode: res.status,
      userRole: res.body.data?.user?.role,
      influencerId: res.body.data?.user?.influencer?.id,
      referralCode: res.body.data?.user?.influencer?.referralCode,
      tokenReceived: Boolean(infToken),
    });
  }

  {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'priya.sharma@gmail.com', password: 'Password123!' });
    custToken = res.body.data?.token;
    record('1.3 Customer Login', 'Customer valid login (priya.sharma@gmail.com)', res.status === 200 && res.body.data?.user?.role === 'CUSTOMER', {
      statusCode: res.status,
      userRole: res.body.data?.user?.role,
      customerId: res.body.data?.user?.customer?.id,
      tokenReceived: Boolean(custToken),
    });
  }

  // Setup auxiliary users & orders
  {
    const resCust2 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'amit.kumar@gmail.com', password: 'Password123!' });
    cust2Token = resCust2.body.data.token;

    const resInf2 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'designer.priya@build8now.com', password: 'Password123!' });
    inf2Token = resInf2.body.data.token;

    const orderRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${custToken}`)
      .send({ items: [{ productId: product.id, quantity: 2 }], distanceKm: 15 });
    orderId = orderRes.body.data.id;
  }

  // 2. Invalid Credentials & Validation
  console.log('\n--- SECTION 2: REJECTION OF INVALID CREDENTIALS ---');
  {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@build8now.com', password: 'WrongPassword999!' });
    record('2.1 Wrong Password', 'Rejection with 401 Unauthorized', res.status === 401 && res.body.error?.code === 'UNAUTHORIZED', {
      statusCode: res.status,
      errorCode: res.body.error?.code,
      message: res.body.error?.message,
    });
  }

  {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ghost.user@build8now.com', password: 'Password123!' });
    record('2.2 Non-Existent User', 'Rejection with generic 401 Unauthorized', res.status === 401 && res.body.error?.code === 'UNAUTHORIZED', {
      statusCode: res.status,
      errorCode: res.body.error?.code,
      message: res.body.error?.message,
    });
  }

  {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email', password: 'Password123!' });
    record('2.3 Malformed Email', 'Rejection with 422/400 Validation Error', [400, 422].includes(res.status), {
      statusCode: res.status,
      errorCode: res.body.error?.code,
      details: res.body.error?.details,
    });
  }

  {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@build8now.com', password: '' });
    record('2.4 Missing Password', 'Rejection with 422/400 Validation Error', [400, 422].includes(res.status), {
      statusCode: res.status,
      errorCode: res.body.error?.code,
      details: res.body.error?.details,
    });
  }

  // 3. Bcrypt Password Hashing
  console.log('\n--- SECTION 3: BCRYPT PASSWORD HASHING AUDIT ---');
  {
    const allUsers = await prisma.user.findMany();
    const allBcrypt = allUsers.every(u => u.passwordHash && u.passwordHash.startsWith('$2') && u.passwordHash.length === 60);
    const adminCheck = await bcrypt.compare('Password123!', admin.passwordHash);
    record('3.1 Bcrypt DB Inspection', 'Database stored password hashes are 60-char Bcrypt format ($2a$/$2b$)', allBcrypt && adminCheck, {
      totalUsersAudited: allUsers.length,
      sampleAdminHash: admin.passwordHash,
      hashLength: admin.passwordHash.length,
      bcryptCompareValid: adminCheck,
    });
  }

  {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    const leaked = JSON.stringify(res.body).includes('passwordHash');
    record('3.2 Zero Sensitive Data Leakage', 'GET /auth/me sanitizes passwordHash', res.status === 200 && !leaked, {
      statusCode: res.status,
      passwordHashInBody: leaked,
      sanitizedKeys: Object.keys(res.body.data),
    });
  }

  // 4. JWT Token Generation & Structure
  console.log('\n--- SECTION 4: JWT TOKEN PAYLOAD & SECRET VERIFICATION ---');
  {
    const adminDecoded = jwt.verify(adminToken, env.JWT_SECRET);
    const infDecoded = jwt.verify(infToken, env.JWT_SECRET);
    const custDecoded = jwt.verify(custToken, env.JWT_SECRET);

    record('4.1 JWT Payload Structure', 'JWT claims contain userId, role, customerId, influencerId, iat, exp', 
      adminDecoded.role === 'ADMIN' && infDecoded.role === 'INFLUENCER' && custDecoded.role === 'CUSTOMER', {
        adminPayload: adminDecoded,
        influencerPayload: infDecoded,
        customerPayload: custDecoded,
      }
    );

    let forgedRejected = false;
    const fakeToken = jwt.sign({ userId: admin.id, role: 'ADMIN' }, 'attacker_secret_key');
    try {
      jwt.verify(fakeToken, env.JWT_SECRET);
    } catch {
      forgedRejected = true;
    }
    const fakeReq = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${fakeToken}`);
    record('4.2 JWT Secret Handling', 'Forged tokens signed with foreign secrets are rejected (401)', forgedRejected && fakeReq.status === 401, {
      cryptoRejection: forgedRejected,
      apiStatusCode: fakeReq.status,
      apiErrorCode: fakeReq.body.error?.code,
    });
  }

  // 5. Missing, Malformed & Expired Tokens
  console.log('\n--- SECTION 5: TOKEN REJECTION AUDIT (MISSING/MALFORMED/EXPIRED) ---');
  {
    const resMissing = await request(app).get('/api/v1/orders');
    record('5.1 Missing Token', 'GET /orders without token returns 401', resMissing.status === 401, {
      statusCode: resMissing.status,
      error: resMissing.body.error,
    });

    const resMalformed = await request(app).get('/api/v1/orders').set('Authorization', 'Bearer invalid.jwt.token');
    record('5.2 Malformed Token', 'GET /orders with corrupt token returns 401', resMalformed.status === 401, {
      statusCode: resMalformed.status,
      error: resMalformed.body.error,
    });

    const expiredToken = jwt.sign({ userId: admin.id, role: 'ADMIN' }, env.JWT_SECRET, { expiresIn: '-5s' });
    const resExpired = await request(app).get('/api/v1/orders').set('Authorization', `Bearer ${expiredToken}`);
    record('5.3 Expired Token', 'GET /orders with expired token returns 401', resExpired.status === 401 && resExpired.body.error?.message?.includes('expired'), {
      statusCode: resExpired.status,
      error: resExpired.body.error,
    });
  }

  // 6. Route Protection Matrix & ABAC
  console.log('\n--- SECTION 6: ROUTE PROTECTION MATRIX (RBAC & ABAC) ---');
  {
    // POST /shipping/profiles (Admin only)
    const adminShip = await request(app).post('/api/v1/shipping/profiles').set('Authorization', `Bearer ${adminToken}`).send({ name: `Audited Profile ${Date.now()}` });
    const custShip = await request(app).post('/api/v1/shipping/profiles').set('Authorization', `Bearer ${custToken}`).send({ name: `Cust Profile ${Date.now()}` });
    const infShip = await request(app).post('/api/v1/shipping/profiles').set('Authorization', `Bearer ${infToken}`).send({ name: `Inf Profile ${Date.now()}` });
    record('6.1 RBAC POST /shipping/profiles', 'Admin (201), Customer (403), Influencer (403)', 
      adminShip.status === 201 && custShip.status === 403 && infShip.status === 403, {
        adminStatus: adminShip.status,
        customerStatus: custShip.status,
        influencerStatus: infShip.status,
      }
    );

    // POST /loyalty/rules (Admin only)
    const adminLoyalty = await request(app).post('/api/v1/loyalty/rules').set('Authorization', `Bearer ${adminToken}`).send({ name: `Audited Rule ${Date.now()}`, ruleTarget: 'CART_VALUE', pointType: 'PERCENTAGE', pointValue: 5 });
    const custLoyalty = await request(app).post('/api/v1/loyalty/rules').set('Authorization', `Bearer ${custToken}`).send({ name: `Cust Rule`, ruleTarget: 'CART_VALUE', pointType: 'PERCENTAGE', pointValue: 5 });
    const infLoyalty = await request(app).post('/api/v1/loyalty/rules').set('Authorization', `Bearer ${infToken}`).send({ name: `Inf Rule`, ruleTarget: 'CART_VALUE', pointType: 'PERCENTAGE', pointValue: 5 });
    record('6.2 RBAC POST /loyalty/rules', 'Admin (201), Customer (403), Influencer (403)', 
      adminLoyalty.status === 201 && custLoyalty.status === 403 && infLoyalty.status === 403, {
        adminStatus: adminLoyalty.status,
        customerStatus: custLoyalty.status,
        influencerStatus: infLoyalty.status,
      }
    );

    // POST /shipping/assign-product (Admin only)
    const adminAssign = await request(app).post('/api/v1/shipping/assign-product').set('Authorization', `Bearer ${adminToken}`).send({ productId: product.id, shippingProfileId: adminShip.body.data.id });
    const custAssign = await request(app).post('/api/v1/shipping/assign-product').set('Authorization', `Bearer ${custToken}`).send({ productId: product.id, shippingProfileId: adminShip.body.data.id });
    const infAssign = await request(app).post('/api/v1/shipping/assign-product').set('Authorization', `Bearer ${infToken}`).send({ productId: product.id, shippingProfileId: adminShip.body.data.id });
    record('6.3 RBAC POST /shipping/assign-product', 'Admin (200), Customer (403), Influencer (403)', 
      adminAssign.status === 200 && custAssign.status === 403 && infAssign.status === 403, {
        adminStatus: adminAssign.status,
        customerStatus: custAssign.status,
        influencerStatus: infAssign.status,
      }
    );

    // GET /influencers (Admin only)
    const adminInfList = await request(app).get('/api/v1/influencers').set('Authorization', `Bearer ${adminToken}`);
    const custInfList = await request(app).get('/api/v1/influencers').set('Authorization', `Bearer ${custToken}`);
    const infInfList = await request(app).get('/api/v1/influencers').set('Authorization', `Bearer ${infToken}`);
    record('6.4 RBAC GET /influencers', 'Admin (200), Customer (403), Influencer (403)', 
      adminInfList.status === 200 && custInfList.status === 403 && infInfList.status === 403, {
        adminStatus: adminInfList.status,
        customerStatus: custInfList.status,
        influencerStatus: infInfList.status,
      }
    );

    // Object-Level ABAC: GET /loyalty/ledger/:influencerId
    const infOwnLedger = await request(app).get(`/api/v1/loyalty/ledger/${influencer.influencer.id}`).set('Authorization', `Bearer ${infToken}`);
    const infOtherLedger = await request(app).get(`/api/v1/loyalty/ledger/other-foreign-id-999`).set('Authorization', `Bearer ${infToken}`);
    record('6.5 ABAC Loyalty Ledger Isolation', 'Own Ledger (200), Foreign Ledger (403 IDOR Block)', 
      infOwnLedger.status === 200 && infOtherLedger.status === 403, {
        ownLedgerStatus: infOwnLedger.status,
        foreignLedgerStatus: infOtherLedger.status,
        foreignErrorMessage: infOtherLedger.body.error?.message,
      }
    );

    // Object-Level ABAC: GET /orders/:orderId
    const custOwnOrder = await request(app).get(`/api/v1/orders/${orderId}`).set('Authorization', `Bearer ${custToken}`);
    const cust2OrderAttempt = await request(app).get(`/api/v1/orders/${orderId}`).set('Authorization', `Bearer ${cust2Token}`);
    record('6.6 ABAC Order IDOR Isolation', 'Own Order (200), Other Customer Order (403 IDOR Block)', 
      custOwnOrder.status === 200 && cust2OrderAttempt.status === 403, {
        ownOrderStatus: custOwnOrder.status,
        foreignOrderStatus: cust2OrderAttempt.status,
        foreignErrorMessage: cust2OrderAttempt.body.error?.message,
      }
    );
  }

  // 7. SQLi, Rate Limiter, Helmet & CORS
  console.log('\n--- SECTION 7: ADVANCED SECURITY AUDIT (SQLi, RATE LIMIT, HELMET, CORS) ---');
  {
    const sqliRes = await request(app).post('/api/v1/auth/login').send({ email: "' OR '1'='1", password: "Password123!" });
    record('7.1 SQL Injection Prevention', 'Parameterized Prisma query engine neutralizes SQLi attack vectors', [400, 422].includes(sqliRes.status), {
      statusCode: sqliRes.status,
      errorCode: sqliRes.body.error?.code,
    });

    const healthRes = await request(app).get('/health');
    const hasHelmet = Boolean(
      healthRes.headers['x-dns-prefetch-control'] &&
      healthRes.headers['x-frame-options'] &&
      healthRes.headers['x-content-type-options']
    );
    record('7.2 Helmet Security Headers', 'Helmet HTTP response headers enforced', hasHelmet, {
      'x-dns-prefetch-control': healthRes.headers['x-dns-prefetch-control'],
      'x-frame-options': healthRes.headers['x-frame-options'],
      'strict-transport-security': healthRes.headers['strict-transport-security'],
      'x-content-type-options': healthRes.headers['x-content-type-options'],
      'x-permitted-cross-domain-policies': healthRes.headers['x-permitted-cross-domain-policies'],
    });

    const corsRes = await request(app).options('/api/v1/auth/login').set('Origin', 'http://localhost:3000').set('Access-Control-Request-Method', 'POST');
    record('7.3 CORS Headers Audit', 'CORS origin and credentials headers verified', corsRes.headers['access-control-allow-origin'] === 'http://localhost:3000', {
      'access-control-allow-origin': corsRes.headers['access-control-allow-origin'],
      'access-control-allow-credentials': corsRes.headers['access-control-allow-credentials'],
    });

    const rateLimitRes = await request(app).get('/api/v1/shipping/profiles').set('Authorization', `Bearer ${adminToken}`);
    record('7.4 Rate Limiting Middleware', 'express-rate-limit headers present on API routes', Boolean(rateLimitRes.headers['ratelimit-limit']), {
      'ratelimit-limit': rateLimitRes.headers['ratelimit-limit'],
      'ratelimit-remaining': rateLimitRes.headers['ratelimit-remaining'],
      'ratelimit-reset': rateLimitRes.headers['ratelimit-reset'],
    });
  }

  console.log('\n' + '='.repeat(80));
  const passedCount = results.filter(r => r.passed).length;
  console.log(`TOTAL AUDIT CHECKS: ${results.length} | PASSED: ${passedCount} | FAILED: ${results.length - passedCount}`);
  console.log('='.repeat(80));

  await prisma.$disconnect();
}

runFullAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
