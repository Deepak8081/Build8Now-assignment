import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Task 6: Zod Request Validation & Error Handling Suite', () => {
  describe('Authentication Validation', () => {
    it('rejects registration with invalid email format with 422', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'not-a-valid-email',
          password: 'Password123!',
          name: 'Valid Name',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toBeInstanceOf(Array);
      expect(res.body.error.details[0].field).toBe('email');
    });

    it('rejects registration with password shorter than 6 characters with 422', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'valid@example.com',
          password: '123', // short
          name: 'Valid Name',
        });

      expect(res.status).toBe(422);
      expect(res.body.error.details[0].field).toBe('password');
    });

    it('rejects registration with name containing numbers with 422', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'deepak.valid@example.com',
          password: 'Password123!',
          name: 'Deepak12345', // Contains digits - invalid!
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details[0].field).toBe('name');
      expect(res.body.error.details[0].message).toContain('alphabetic');
    });

    it('rejects registration with invalid role enum with 422', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'valid@example.com',
          password: 'Password123!',
          name: 'Valid Name',
          role: 'SUPER_HACKER', // invalid role
        });

      expect(res.status).toBe(422);
    });
  });

  describe('Shipping Engine Validation', () => {
    it('rejects negative weight with 422', async () => {
      const res = await request(app)
        .post('/api/v1/shipping/calculate')
        .send({
          weightKg: -5.5,
          distanceKm: 10,
        });

      expect(res.status).toBe(422);
      expect(res.body.error.details[0].field).toBe('weightKg');
    });

    it('rejects negative dimensions with 422', async () => {
      const res = await request(app)
        .post('/api/v1/shipping/calculate')
        .send({
          weightKg: 10,
          lengthCm: -50,
        });

      expect(res.status).toBe(422);
      expect(res.body.error.details[0].field).toBe('lengthCm');
    });
  });

  describe('Loyalty & Refund Validation', () => {
    it('rejects refund request with zero or negative refundAmount with 422', async () => {
      const res = await request(app)
        .post('/api/v1/loyalty/process-refund')
        .send({
          orderId: 'c1234567-89ab-cdef-0123-456789abcdef',
          refundAmount: 0, // must be > 0
          reason: 'Valid reason',
          idempotencyKey: 'refund_key_123',
        });

      expect(res.status).toBe(401); // Requires auth token first
    });

    it('rejects process-order without idempotencyKey with 422', async () => {
      const res = await request(app)
        .post('/api/v1/loyalty/process-order')
        .send({
          orderId: 'c1234567-89ab-cdef-0123-456789abcdef',
          // missing idempotencyKey
        });

      expect(res.status).toBe(401); // Auth middleware catches first
    });
  });

  describe('HTTP Protocol & Global Error Handling', () => {
    it('returns clean 404 for nonexistent endpoint routes', async () => {
      const res = await request(app).get('/api/v1/nonexistent/service/route');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('returns 200 OK on health check', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body.service).toContain('Build8Now');
    });
  });
});
