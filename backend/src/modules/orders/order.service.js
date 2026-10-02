import prisma from '../../common/database/prisma.js';
import { MathHelper } from '../../common/helpers/math.helper.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../common/errors/index.js';
import { ShippingService } from '../shipping/shipping.service.js';
import { PaginationHelper } from '../../common/helpers/pagination.helper.js';

export class OrderService {
  /**
   * Create an order with items, calculate shipping, and attribute influencer
   */
  static async createOrder(data, userContext) {
    const customerId = userContext.customerId || data.customerId;

    if (!customerId) {
      throw new BadRequestError('Customer ID is required to place an order.');
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { referredBy: true },
    });

    if (!customer) {
      throw new NotFoundError(`Customer with ID '${customerId}' not found`);
    }

    // Determine influencer attribution
    let influencerId = customer.referredById || null;

    if (data.referralCode) {
      const explicitInfluencer = await prisma.influencer.findUnique({
        where: { referralCode: data.referralCode.toUpperCase() },
      });
      if (explicitInfluencer && explicitInfluencer.isActive) {
        influencerId = explicitInfluencer.id;
      }
    }

    // Validate products and compute order lines
    let subtotal = 0;
    let totalShipping = 0;
    const orderItemsData = [];

    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { shippingProfile: { include: { rules: true } } },
      });

      if (!product) {
        throw new NotFoundError(`Product with ID '${item.productId}' not found`);
      }

      if (!product.isActive) {
        throw new BadRequestError(`Product '${product.name}' is currently unavailable`);
      }

      const itemSubtotal = MathHelper.round2(product.price * item.quantity);
      subtotal += itemSubtotal;

      // Calculate shipping for item line
      let lineShipping = 0;
      try {
        const shippingResult = await ShippingService.calculate({
          productId: product.id,
          quantity: item.quantity,
          weightKg: product.weightKg,
          lengthCm: product.lengthCm,
          widthCm: product.widthCm,
          heightCm: product.heightCm,
          distanceKm: data.distanceKm || 10,
          productPrice: product.price,
        });
        lineShipping = shippingResult.finalShippingCost;
      } catch (err) {
        lineShipping = 0; // Default or free if unconfigured
      }

      totalShipping += lineShipping;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: itemSubtotal,
        weightKg: product.weightKg,
        lengthCm: product.lengthCm,
        widthCm: product.widthCm,
        heightCm: product.heightCm,
      });
    }

    subtotal = MathHelper.round2(subtotal);
    totalShipping = MathHelper.round2(totalShipping);
    const totalAmount = MathHelper.round2(subtotal + totalShipping);

    const orderNumber = `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        influencerId,
        status: 'PENDING',
        subtotal,
        shippingCost: totalShipping,
        totalAmount,
        currency: 'INR',
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
        customer: {
          include: { user: { select: { name: true, email: true } } },
        },
        influencer: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    return order;
  }

  /**
   * List orders with Object-Level Authorization (Customers only see their own)
   */
  static async listOrders(query = {}, userContext) {
    const { skip, take, page, limit } = PaginationHelper.parse(query);
    const where = {};

    if (userContext.role === 'CUSTOMER') {
      where.customerId = userContext.customerId;
    } else if (userContext.role === 'INFLUENCER') {
      where.influencerId = userContext.influencerId;
    } else if (userContext.role === 'ADMIN') {
      if (query.customerId) where.customerId = query.customerId;
      if (query.influencerId) where.influencerId = query.influencerId;
      if (query.status) where.status = query.status;
    }

    const [total, items] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          items: { include: { product: true } },
          customer: { include: { user: { select: { name: true, email: true } } } },
          influencer: { include: { user: { select: { name: true, email: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      items,
      pagination: PaginationHelper.formatMeta(total, page, limit),
    };
  }

  /**
   * Get single order by ID with Object-Level Access Verification
   */
  static async getOrderById(id, userContext) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        customer: { include: { user: { select: { name: true, email: true } } } },
        influencer: { include: { user: { select: { name: true, email: true } } } },
        ledgerEntries: true,
      },
    });

    if (!order) {
      throw new NotFoundError(`Order with ID '${id}' not found`);
    }

    // Object-Level Access Control Check
    if (userContext.role === 'CUSTOMER' && order.customerId !== userContext.customerId) {
      throw new ForbiddenError('Access denied. You can only view your own orders.');
    }
    if (userContext.role === 'INFLUENCER' && order.influencerId !== userContext.influencerId) {
      throw new ForbiddenError('Access denied. You can only view orders attributed to your referral.');
    }

    return order;
  }

  /**
   * Complete an order (transitions status to COMPLETED)
   */
  static async completeOrder(id) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundError(`Order '${id}' not found`);

    return prisma.order.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: { items: true },
    });
  }

  /**
   * Cancel an order
   */
  static async cancelOrder(id, reason, userContext) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundError(`Order '${id}' not found`);

    if (userContext.role === 'CUSTOMER' && order.customerId !== userContext.customerId) {
      throw new ForbiddenError('Access denied. You can only cancel your own orders.');
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestError('This order is already cancelled.');
    }

    return prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { items: true },
    });
  }
}
