import prisma from '../../common/database/prisma.js';
import { NotFoundError, ConflictError } from '../../common/errors/index.js';
import { parsePagination, formatPaginationMeta } from '../../common/helpers/pagination.helper.js';

export const listProducts = async (query = {}) => {
  const { skip, take, page, limit } = parsePagination(query);
  const where = {};

  if (query.category) {
    where.category = query.category;
  }
  if (query.isActive !== undefined) {
    where.isActive = query.isActive === 'true' || query.isActive === true;
  }
  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { sku: { contains: query.search } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take,
      include: {
        shippingProfile: {
          include: { rules: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    items,
    pagination: formatPaginationMeta(total, page, limit),
  };
};

export const getProductBySlug = async (slug) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      shippingProfile: {
        include: { rules: true },
      },
    },
  });

  if (!product) {
    throw new NotFoundError(`Product with slug '${slug}' not found`);
  }

  return product;
};

export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      shippingProfile: {
        include: { rules: true },
      },
    },
  });

  if (!product) {
    throw new NotFoundError(`Product with ID '${id}' not found`);
  }

  return product;
};

export const createProduct = async (data) => {
  const existing = await prisma.product.findFirst({
    where: {
      OR: [{ slug: data.slug }, { sku: data.sku }],
    },
  });

  if (existing) {
    throw new ConflictError('A product with this slug or SKU already exists');
  }

  return prisma.product.create({
    data,
    include: { shippingProfile: true },
  });
};

export const updateProduct = async (id, data) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError(`Product with ID '${id}' not found`);
  }

  return prisma.product.update({
    where: { id },
    data,
    include: { shippingProfile: true },
  });
};

export const deleteProduct = async (id) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError(`Product with ID '${id}' not found`);
  }

  return prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
};
