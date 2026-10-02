/**
 * Standardized API Response Helper for Build8Now Services
 */

export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200, meta = null) => {
  const response = {
    success: true,
    statusCode,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const sendCreated = (res, data = null, message = 'Resource created successfully', meta = null) => {
  return sendSuccess(res, data, message, 201, meta);
};

export const sendError = (res, message = 'An error occurred', statusCode = 500, errorCode = 'INTERNAL_ERROR', details = null) => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    error: {
      code: errorCode,
      message,
      details,
    },
  });
};

export class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200, meta = null) {
    return sendSuccess(res, data, message, statusCode, meta);
  }

  static created(res, data = null, message = 'Resource created successfully', meta = null) {
    return sendCreated(res, data, message, meta);
  }

  static error(res, message = 'An error occurred', statusCode = 500, errorCode = 'INTERNAL_ERROR', details = null) {
    return sendError(res, message, statusCode, errorCode, details);
  }
}
