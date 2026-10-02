import { Router } from 'express';
import { ShippingController } from './shipping.controller.js';
import {
  createShippingProfileSchema,
  updateShippingProfileSchema,
  assignProfileToProductSchema,
  calculateShippingSchema,
} from './shipping.schema.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import { authenticate } from '../../common/middlewares/auth.middleware.js';
import { authorizeRoles } from '../../common/middlewares/role.middleware.js';
import { asyncHandler } from '../../common/helpers/async-handler.helper.js';

const router = Router();

// Public / General Calculation endpoint
router.post(
  '/calculate',
  validate(calculateShippingSchema, 'body'),
  asyncHandler(ShippingController.calculate)
);

// Profile Listing & Viewing
router.get(
  '/profiles',
  authenticate,
  asyncHandler(ShippingController.listProfiles)
);

router.get(
  '/profiles/:id',
  authenticate,
  asyncHandler(ShippingController.getProfileById)
);

// Admin Only Profile Management
router.post(
  '/profiles',
  authenticate,
  authorizeRoles('ADMIN'),
  validate(createShippingProfileSchema, 'body'),
  asyncHandler(ShippingController.createProfile)
);

router.put(
  '/profiles/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  validate(updateShippingProfileSchema, 'body'),
  asyncHandler(ShippingController.updateProfile)
);

router.delete(
  '/profiles/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  asyncHandler(ShippingController.deactivateProfile)
);

router.post(
  '/assign-product',
  authenticate,
  authorizeRoles('ADMIN'),
  validate(assignProfileToProductSchema, 'body'),
  asyncHandler(ShippingController.assignToProduct)
);

export default router;
