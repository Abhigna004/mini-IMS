// Wraps async Express handlers so errors propagate to errorHandler middleware
export const asyncWrapper = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
