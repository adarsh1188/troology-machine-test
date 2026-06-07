const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { signToken } = require('../utils/token');
const { logActivity } = require('../utils/activity');

/**
 * POST /api/auth/signup  (public)
 * Self-registration. Role is forced to "user" — admins are created by
 * seeding or by an existing admin via the user module.
 */
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, 'name, email and password are required');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    throw new ApiError(409, 'Email already registered');
  }

  const user = await User.create({ name, email, password, role: 'user' });
  const token = signToken(user);

  await logActivity({
    user: user._id,
    action: 'USER_SIGNUP',
    entity: 'User',
    entityId: user._id,
    message: `${user.name} signed up`,
  });

  res.status(201).json({
    success: true,
    token,
    user: user.toJSON(),
  });
});

/**
 * POST /api/auth/login  (public)
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated');
  }

  const token = signToken(user);
  res.json({
    success: true,
    token,
    user: user.toJSON(),
  });
});

/**
 * GET /api/auth/me  (protected)
 */
const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toJSON() });
});

module.exports = { signup, login, me };
