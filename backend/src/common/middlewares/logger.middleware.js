/**
 * HTTP Request Logger Middleware
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const status = res.statusCode;
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(
      `[${new Date().toISOString()}] ${color}${req.method}\x1b[0m ${req.originalUrl} - ${color}${status}\x1b[0m (${duration}ms)`
    );
  });
  next();
};
