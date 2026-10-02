import rateLimit from 'express-rate-limit';
import { env } from '../../config/env.config.js';

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes default
  max: env.NODE_ENV === 'production' ? env.RATE_LIMIT_MAX_REQUESTS : 1000000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded. Too many requests from this IP, please try again later.',
    },
  },
});
