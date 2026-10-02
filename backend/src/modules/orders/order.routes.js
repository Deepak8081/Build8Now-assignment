import { Router } from 'express';
import { OrderController } from './order.controller.js';
import { createOrderSchema, cancelOrderSchema } from './order.schema.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import { authenticate } from '../../common/middlewares/auth.middleware.js';
import { authorizeRoles } from '../../common/middlewares/role.middleware.js';
import { asyncHandler } from '../../common/helpers/async-handler.helper.js';

const router = Router();

router.post(
  '/',
  authenticate,
  validate(createOrderSchema, 'body'),
  asyncHandler(OrderController.createOrder)
);

router.get(
  '/',
  authenticate,
  asyncHandler(OrderController.listOrders)
);

router.get(
  '/:id',
  authenticate,
  asyncHandler(OrderController.getOrderById)
);

router.post(
  '/:id/complete',
  authenticate,
  authorizeRoles('ADMIN'),
  asyncHandler(OrderController.completeOrder)
);

router.post(
  '/:id/cancel',
  authenticate,
  validate(cancelOrderSchema, 'body'),
  asyncHandler(OrderController.cancelOrder)
);

export default router;
