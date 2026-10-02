import { Router } from 'express';
import { LoyaltyController } from './loyalty.controller.js';
import {
  createLoyaltyRuleSchema,
  updateLoyaltyRuleSchema,
  processOrderLoyaltySchema,
  refundOrderLoyaltySchema,
} from './loyalty.schema.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import { authenticate } from '../../common/middlewares/auth.middleware.js';
import { authorizeRoles, enforceObjectOwnership } from '../../common/middlewares/role.middleware.js';
import { asyncHandler } from '../../common/helpers/async-handler.helper.js';

const router = Router();

// Order & Refund points processing
router.post(
  '/process-order',
  authenticate,
  validate(processOrderLoyaltySchema, 'body'),
  asyncHandler(LoyaltyController.processOrder)
);

router.post(
  '/process-refund',
  authenticate,
  validate(refundOrderLoyaltySchema, 'body'),
  asyncHandler(LoyaltyController.processRefund)
);

// Ledger query with Object-Level ABAC protection
router.get(
  '/ledger/:influencerId',
  authenticate,
  (req, res, next) => {
    enforceObjectOwnership(req, req.params.influencerId, 'influencerId');
    next();
  },
  asyncHandler(LoyaltyController.getLedger)
);

// Rule Management (Admin only)
router.get('/rules', authenticate, asyncHandler(LoyaltyController.listRules));

router.post(
  '/rules',
  authenticate,
  authorizeRoles('ADMIN'),
  validate(createLoyaltyRuleSchema, 'body'),
  asyncHandler(LoyaltyController.createRule)
);

router.put(
  '/rules/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  validate(updateLoyaltyRuleSchema, 'body'),
  asyncHandler(LoyaltyController.updateRule)
);

router.delete(
  '/rules/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  asyncHandler(LoyaltyController.deactivateRule)
);

export default router;
