import { ValidationError } from '../errors/index.js';

/**
 * Zod Schema Request Validation Middleware
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[source]);
      if (!result.success) {
        const formattedErrors = result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          rule: err.code,
        }));

        throw new ValidationError('Request validation failed. Please correct the invalid fields.', formattedErrors);
      }

      // Replace req with sanitized and parsed data
      req[source] = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};
