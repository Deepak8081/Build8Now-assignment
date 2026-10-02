import { ForbiddenError, UnauthorizedError } from '../errors/index.js';

/**
 * Role-Based Access Control (RBAC) Guard Middleware
 * @param  {...string} allowedRoles Allowed roles (e.g. 'ADMIN', 'CUSTOMER', 'INFLUENCER')
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required before role verification'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Role '${req.user.role}' is not authorized to access this resource. Allowed roles: [${allowedRoles.join(', ')}]`
        )
      );
    }

    next();
  };
};

/**
 * Object-Level Access Control (ABAC) Helper
 * Validates that non-admin users can ONLY access their own resource ID
 */
export const enforceObjectOwnership = (req, targetResourceId, userResourceKey = 'id') => {
  if (req.user.role === 'ADMIN') {
    return true; // Admins bypass object ownership checks
  }

  const currentUserId = req.user[userResourceKey];
  if (!currentUserId || currentUserId !== targetResourceId) {
    throw new ForbiddenError('Forbidden: Object-level access denied. You are only permitted to access your own records.');
  }

  return true;
};
