import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import { authenticate } from '../../common/middlewares/auth.middleware.js';
import { asyncHandler } from '../../common/helpers/async-handler.helper.js';

const router = Router();

router.post('/register', validate(registerSchema, 'body'), asyncHandler(AuthController.register));
router.post('/login', validate(loginSchema, 'body'), asyncHandler(AuthController.login));
router.get('/me', authenticate, asyncHandler(AuthController.getMe));

export default router;
