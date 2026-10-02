import prisma from '../../common/database/prisma.js';
import { NotFoundError, BadRequestError } from '../../common/errors/index.js';
import { ShippingEngine } from './shipping.engine.js';
import { PaginationHelper } from '../../common/helpers/pagination.helper.js';

export class ShippingService {
  /**
   * Create a new Shipping Profile with rules
   */
  static async createProfile(data) {
    const { rules, ...profileData } = data;

    const profile = await prisma.shippingProfile.create({
      data: {
        ...profileData,
        rules: {
          create: rules || [],
        },
      },
      include: {
        rules: true,
      },
    });

    return profile;
  }

  /**
   * Update an existing Shipping Profile
   */
  static async updateProfile(id, data) {
    const existing = await prisma.shippingProfile.findUnique({
      where: { id },
      include: { rules: true },
    });

    if (!existing) {
      throw new NotFoundError(`Shipping profile with ID '${id}' not found`);
    }

    const { rules, ...profileData } = data;

    // If rules are provided, replace them atomically
    const updated = await prisma.$transaction(async (tx) => {
      if (rules && rules.length > 0) {
        await tx.shippingRule.deleteMany({
          where: { shippingProfileId: id },
        });

        await tx.shippingRule.createMany({
          data: rules.map((r) => ({ ...r, shippingProfileId: id })),
        });
      }

      return tx.shippingProfile.update({
        where: { id },
        data: profileData,
        include: { rules: true },
      });
    });

    return updated;
  }

  /**
   * List all Shipping Profiles with pagination
   */
  static async listProfiles(query = {}) {
    const { skip, take, page, limit } = PaginationHelper.parse(query);
    const where = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true' || query.isActive === true;
    }

    if (query.search) {
      where.name = { contains: query.search };
    }

    const [total, items] = await Promise.all([
      prisma.shippingProfile.count({ where }),
      prisma.shippingProfile.findMany({
        where,
        skip,
        take,
        include: {
          rules: true,
          _count: { select: { products: true } },
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
   * Get single profile by ID
   */
  static async getProfileById(id) {
    const profile = await prisma.shippingProfile.findUnique({
      where: { id },
      include: {
        rules: true,
        products: { select: { id: true, name: true, sku: true, category: true } },
      },
    });

    if (!profile) {
      throw new NotFoundError(`Shipping profile with ID '${id}' not found`);
    }

    return profile;
  }

  /**
   * Deactivate a shipping profile
   */
  static async deactivateProfile(id) {
    const profile = await prisma.shippingProfile.findUnique({ where: { id } });
    if (!profile) {
      throw new NotFoundError(`Shipping profile with ID '${id}' not found`);
    }

    const updated = await prisma.shippingProfile.update({
      where: { id },
      data: { isActive: false },
    });

    return updated;
  }

  /**
   * Assign a Shipping Profile to a Product
   */
  static async assignToProduct({ productId, shippingProfileId }) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundError(`Product with ID '${productId}' not found`);
    }

    if (shippingProfileId) {
      const profile = await prisma.shippingProfile.findUnique({ where: { id: shippingProfileId } });
      if (!profile) {
        throw new NotFoundError(`Shipping profile with ID '${shippingProfileId}' not found`);
      }
      if (!profile.isActive) {
        throw new BadRequestError('Cannot assign an inactive shipping profile to a product');
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { shippingProfileId },
      include: { shippingProfile: { include: { rules: true } } },
    });

    return updatedProduct;
  }

  /**
   * Calculate Shipping for a given product or profile & parameters
   */
  static async calculate(params) {
    let profile = null;

    if (params.productId) {
      const product = await prisma.product.findUnique({
        where: { id: params.productId },
        include: { shippingProfile: { include: { rules: true } } },
      });

      if (!product) {
        throw new NotFoundError(`Product with ID '${params.productId}' not found`);
      }

      if (!product.shippingProfile) {
        throw new BadRequestError(
          `Product '${product.name}' (${product.sku}) does not have an assigned shipping profile.`
        );
      }

      if (!product.shippingProfile.isActive) {
        throw new BadRequestError(
          `Assigned shipping profile '${product.shippingProfile.name}' is currently inactive.`
        );
      }

      profile = product.shippingProfile;

      // Fill in product physical dimensions if omitted in request
      params.weightKg = params.weightKg ?? product.weightKg;
      params.lengthCm = params.lengthCm ?? product.lengthCm ?? 0;
      params.widthCm = params.widthCm ?? product.widthCm ?? 0;
      params.heightCm = params.heightCm ?? product.heightCm ?? 0;
      params.productPrice = params.productPrice ?? product.price;
    } else if (params.shippingProfileId) {
      profile = await prisma.shippingProfile.findUnique({
        where: { id: params.shippingProfileId },
        include: { rules: true },
      });

      if (!profile) {
        throw new NotFoundError(`Shipping profile with ID '${params.shippingProfileId}' not found`);
      }

      if (!profile.isActive) {
        throw new BadRequestError(`Shipping profile '${profile.name}' is currently inactive`);
      }
    } else {
      // Fallback: fetch default active shipping profile if exists
      profile = await prisma.shippingProfile.findFirst({
        where: { isActive: true },
        include: { rules: true },
        orderBy: { createdAt: 'asc' },
      });

      if (!profile) {
        throw new BadRequestError('No active shipping profile found in the system');
      }
    }

    return ShippingEngine.calculate(profile, params);
  }
}
