/**
 * Async/await error handler for cleaner Express route handlers
 * Eliminates the need for try/catch blocks in controllers
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;