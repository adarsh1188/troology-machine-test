const ApiError = require('../utils/ApiError');

/**
 * Restrict a route to one or more roles.
 * Usage: router.post('/', protect, authorize('admin'), handler)
 */
const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(
      new ApiError(403, 'You do not have permission to perform this action')
    );
  }
  return next();
};

module.exports = { authorize };
