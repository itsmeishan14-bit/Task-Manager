/**
 * Request Logger Middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    const statusClass = statusCode >= 400 ? '❌' : statusCode >= 300 ? '⚠️' : '✅';
    
    console.log(`${statusClass} ${method} ${originalUrl} - ${statusCode} (${duration}ms)`);
  });
  
  next();
};
