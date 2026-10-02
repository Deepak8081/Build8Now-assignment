import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.config.js';
import { requestLogger } from './common/middlewares/logger.middleware.js';
import { apiRateLimiter } from './common/middlewares/rate-limiter.middleware.js';
import { errorHandler } from './common/middlewares/error.middleware.js';
import { NotFoundError } from './common/errors/index.js';

// Route Imports
import authRoutes from './modules/auth/auth.routes.js';
import shippingRoutes from './modules/shipping/shipping.routes.js';
import loyaltyRoutes from './modules/loyalty/loyalty.routes.js';
import influencerRoutes from './modules/influencers/influencer.routes.js';
import orderRoutes from './modules/orders/order.routes.js';
import productRoutes from './modules/products/product.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : [env.CORS_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging & Rate Limiting
if (env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}
app.use('/api/', apiRateLimiter);

// Swagger Documentation Setup (Dynamic Reloading & Raw JSON Endpoint)
const swaggerPath = path.join(__dirname, 'docs', 'swagger.json');

app.get('/api-docs.json', (req, res) => {
  try {
    const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
    res.setHeader('Content-Type', 'application/json');
    return res.json(swaggerDocument);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load OpenAPI spec' });
  }
});

app.use('/api-docs', swaggerUi.serve, (req, res, next) => {
  try {
    const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'Build8Now API Documentation (22 Paths / 31 Endpoints)',
    })(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Build8Now Backend API',
    version: '1.0.0',
    port: env.PORT,
  });
});

// Root & API v1 Info Index
const apiIndexHandler = (req, res) => {
  res.status(200).json({
    service: 'Build8Now Material Procurement & Freight Loyalty API',
    version: '1.0.0',
    status: 'ACTIVE',
    documentation: `http://localhost:${env.PORT}/api-docs`,
    endpoints: {
      auth: '/api/v1/auth',
      shipping: '/api/v1/shipping',
      loyalty: '/api/v1/loyalty',
      influencers: '/api/v1/influencers',
      orders: '/api/v1/orders',
      products: '/api/v1/products',
      health: '/health',
    },
  });
};

app.get('/', apiIndexHandler);
app.get('/api/v1', apiIndexHandler);

// Mount API Modules (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/shipping', shippingRoutes);
app.use('/api/v1/loyalty', loyaltyRoutes);
app.use('/api/v1/influencers', influencerRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/products', productRoutes);

// Catch-all 404 for unhandled routes
app.all('*', (req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} does not exist on this server`));
});

// Global Error Handler
app.use(errorHandler);

export default app;
