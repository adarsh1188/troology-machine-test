const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/token');
const User = require('../models/User');

/**
 * Verifies the Bearer JWT and attaches the live user document to req.user.
 */
const protect = asyncHandler(async (req, _res, next) => {
  let token;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw new ApiError(401, 'Not authorized, token invalid or expired');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'User belonging to this token no longer exists');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated');
  }

  req.user = user;
  next();
});

module.exports = { protect };
