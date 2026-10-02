/**
 * Pagination and Filtering Query Helper
 */

export const parsePagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    take: limit,
  };
};

export const formatPaginationMeta = (total = 0, page = 1, limit = 20) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export class PaginationHelper {
  static parse(query = {}) {
    return parsePagination(query);
  }

  static formatMeta(total = 0, page = 1, limit = 20) {
    return formatPaginationMeta(total, page, limit);
  }
}
