import { LoyaltyLedgerService } from './loyalty-ledger.service.js';
import { ApiResponse } from '../../common/helpers/api-response.helper.js';

export class LoyaltyController {
  static async processOrder(req, res) {
    const { orderId, idempotencyKey } = req.body;
    const result = await LoyaltyLedgerService.processOrderAccrual(orderId, idempotencyKey);
    return ApiResponse.success(res, result, result.message);
  }

  static async processRefund(req, res) {
    const result = await LoyaltyLedgerService.processRefundReversal(req.body);
    return ApiResponse.success(res, result, result.message);
  }

  static async getLedger(req, res) {
    const influencerId = req.params.influencerId || req.user.influencerId;
    const result = await LoyaltyLedgerService.getInfluencerLedger(influencerId, req.query);
    return ApiResponse.success(res, result.items, 'Ledger history retrieved', 200, result.pagination);
  }

  static async listRules(req, res) {
    const rules = await LoyaltyLedgerService.listRules();
    return ApiResponse.success(res, rules, 'Loyalty rules retrieved');
  }

  static async createRule(req, res) {
    const rule = await LoyaltyLedgerService.createRule(req.body);
    return ApiResponse.created(res, rule, 'Loyalty rule created successfully');
  }

  static async updateRule(req, res) {
    const rule = await LoyaltyLedgerService.updateRule(req.params.id, req.body);
    return ApiResponse.success(res, rule, 'Loyalty rule updated successfully');
  }

  static async deactivateRule(req, res) {
    const rule = await LoyaltyLedgerService.deactivateRule(req.params.id);
    return ApiResponse.success(res, rule, 'Loyalty rule deactivated');
  }
}
