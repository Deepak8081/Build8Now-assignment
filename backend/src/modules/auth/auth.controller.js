import { AuthService } from './auth.service.js';
import { ApiResponse } from '../../common/helpers/api-response.helper.js';

export class AuthController {
  static async register(req, res) {
    const result = await AuthService.register(req.body);
    return ApiResponse.created(res, result, 'User registered successfully');
  }

  static async login(req, res) {
    const result = await AuthService.login(req.body);
    return ApiResponse.success(res, result, 'Login successful');
  }

  static async getMe(req, res) {
    const result = await AuthService.getMe(req.user.id);
    return ApiResponse.success(res, result, 'User profile retrieved successfully');
  }
}
