import { OrderService } from './order.service.js';
import { ApiResponse } from '../../common/helpers/api-response.helper.js';

export class OrderController {
  static async createOrder(req, res) {
    const order = await OrderService.createOrder(req.body, req.user);
    return ApiResponse.created(res, order, 'Order placed successfully');
  }

  static async listOrders(req, res) {
    const result = await OrderService.listOrders(req.query, req.user);
    return ApiResponse.success(res, result.items, 'Orders retrieved successfully', 200, result.pagination);
  }

  static async getOrderById(req, res) {
    const order = await OrderService.getOrderById(req.params.id, req.user);
    return ApiResponse.success(res, order, 'Order details retrieved');
  }

  static async completeOrder(req, res) {
    const order = await OrderService.completeOrder(req.params.id);
    return ApiResponse.success(res, order, 'Order marked as COMPLETED');
  }

  static async cancelOrder(req, res) {
    const order = await OrderService.cancelOrder(req.params.id, req.body.reason, req.user);
    return ApiResponse.success(res, order, 'Order cancelled successfully');
  }
}
