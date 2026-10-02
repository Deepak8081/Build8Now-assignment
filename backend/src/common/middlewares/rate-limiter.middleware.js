import rateLimit from 'express-rate-limit';
import { env } from '../../config/env.config.js';

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes default
  max: env.RATE_LIMIT_MAX_REQUESTS,   // limit each IP to 100 requests per windowMs
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
