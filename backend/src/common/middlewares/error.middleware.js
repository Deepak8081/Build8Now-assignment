import { AppError } from '../errors/index.js';
import { env } from '../../config/env.config.js';

/**
 * Global exception and error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected internal server error occurred';
  let details = err.details || null;

  // Handle Prisma known errors
  if (err.code === 'P2002') {
    statusCode = 409;
    errorCode = 'UNIQUE_CONSTRAINT_VIOLATION';
    const target = err.meta?.target ? err.meta.target : 'field';
    message = `A record with this ${target} already exists.`;
    details = err.meta;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    errorCode = 'RECORD_NOT_FOUND';
    message = 'Requested record was not found in the database.';
  } else if (err.code === 'P2003') {
    statusCode = 400;
    errorCode = 'FOREIGN_KEY_VIOLATION';
    message = 'Invalid reference: Related entity does not exist.';
  }

  // Handle malformed JSON body errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    errorCode = 'MALFORMED_JSON';
    message = 'Malformed JSON payload provided in request body';
  }

  if (env.NODE_ENV === 'development' && statusCode === 500) {
    console.error('[Error Trace]', err);
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    error: {
      code: errorCode,
      message,
      ...(details ? { details } : {}),
      ...(env.NODE_ENV === 'development' && statusCode === 500 ? { stack: err.stack } : {}),
    },
  });
};
