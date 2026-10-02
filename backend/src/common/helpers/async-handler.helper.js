/**
 * Async Handler Wrapper for Express Controllers
 * Catches asynchronous promise rejections and passes them to global error middleware
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
