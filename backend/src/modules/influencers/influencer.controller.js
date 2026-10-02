import { InfluencerService } from './influencer.service.js';
import { ApiResponse } from '../../common/helpers/api-response.helper.js';

export class InfluencerController {
  static async list(req, res) {
    const result = await InfluencerService.listInfluencers(req.query);
    return ApiResponse.success(res, result.items, 'Influencers retrieved', 200, result.pagination);
  }

  static async getById(req, res) {
    const influencer = await InfluencerService.getInfluencerById(req.params.id);
    return ApiResponse.success(res, influencer, 'Influencer profile retrieved');
  }

  static async linkReferral(req, res) {
    const result = await InfluencerService.linkCustomerToInfluencer(
      req.body.customerId,
      req.body.referralCode
    );
    return ApiResponse.success(res, result, result.message);
  }
}
