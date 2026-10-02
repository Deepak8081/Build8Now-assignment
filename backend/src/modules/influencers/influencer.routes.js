import { Router } from 'express';
import { InfluencerController } from './influencer.controller.js';
import { linkReferralSchema } from './influencer.schema.js';
import { validate } from '../../common/middlewares/validate.middleware.js';
import { authenticate } from '../../common/middlewares/auth.middleware.js';
import { authorizeRoles, enforceObjectOwnership } from '../../common/middlewares/role.middleware.js';
import { asyncHandler } from '../../common/helpers/async-handler.helper.js';

const router = Router();

router.get(
  '/',
  authenticate,
  authorizeRoles('ADMIN'),
  asyncHandler(InfluencerController.list)
);

router.get(
  '/:id',
  authenticate,
  (req, res, next) => {
    enforceObjectOwnership(req, req.params.id, 'influencerId');
    next();
  },
  asyncHandler(InfluencerController.getById)
);

router.post(
  '/link-referral',
  authenticate,
  validate(linkReferralSchema, 'body'),
  asyncHandler(InfluencerController.linkReferral)
);

export default router;
