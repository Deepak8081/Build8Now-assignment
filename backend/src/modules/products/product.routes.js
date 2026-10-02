import { Router } from 'express';
import * as ProductController from './product.controller.js';
import { createProductSchema, updateProductSchema } from './product.schema.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import { authenticate } from '../../common/middlewares/auth.middleware.js';
import { authorizeRoles } from '../../common/middlewares/role.middleware.js';
import { asyncHandler } from '../../common/helpers/async-handler.helper.js';

const router = Router();

// Publicly readable endpoints
router.get('/', asyncHandler(ProductController.list));
router.get('/slug/:slug', asyncHandler(ProductController.getBySlug));
router.get('/:id', asyncHandler(ProductController.getById));

// Admin-only management endpoints
router.post(
  '/',
  authenticate,
  authorizeRoles('ADMIN'),
  validate(createProductSchema, 'body'),
  asyncHandler(ProductController.create)
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  validate(updateProductSchema, 'body'),
  asyncHandler(ProductController.update)
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  asyncHandler(ProductController.remove)
);

export default router;
