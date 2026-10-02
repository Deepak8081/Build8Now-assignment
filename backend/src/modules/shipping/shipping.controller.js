import { ShippingService } from './shipping.service.js';
import { ApiResponse } from '../../common/helpers/api-response.helper.js';

export class ShippingController {
  static async createProfile(req, res) {
    const profile = await ShippingService.createProfile(req.body);
    return ApiResponse.created(res, profile, 'Shipping profile created successfully');
  }

  static async updateProfile(req, res) {
    const profile = await ShippingService.updateProfile(req.params.id, req.body);
    return ApiResponse.success(res, profile, 'Shipping profile updated successfully');
  }

  static async listProfiles(req, res) {
    const result = await ShippingService.listProfiles(req.query);
    return ApiResponse.success(res, result.items, 'Shipping profiles retrieved successfully', 200, result.pagination);
  }

  static async getProfileById(req, res) {
    const profile = await ShippingService.getProfileById(req.params.id);
    return ApiResponse.success(res, profile, 'Shipping profile details retrieved');
  }

  static async deactivateProfile(req, res) {
    const profile = await ShippingService.deactivateProfile(req.params.id);
    return ApiResponse.success(res, profile, 'Shipping profile deactivated');
  }

  static async assignToProduct(req, res) {
    const product = await ShippingService.assignToProduct(req.body);
    return ApiResponse.success(res, product, 'Shipping profile assigned to product successfully');
  }

  static async calculate(req, res) {
    const calculation = await ShippingService.calculate(req.body);
    return ApiResponse.success(res, calculation, 'Shipping calculation completed successfully');
  }
}
