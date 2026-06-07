const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { logActivity } = require('../utils/activity');

/**
 * GET /api/users  (admin)
 * Supports ?search=&role=&page=&limit=
 */
const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const { search, role } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

/**
 * GET /api/users/:id  (admin)
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, data: user });
});

/**
 * POST /api/users  (admin)  — Admin creates a user (any role)
 */
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, 'name, email and password are required');
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, 'Email already registered');

  const user = await User.create({
    name,
    email,
    password,
    role: User.ROLES.includes(role) ? role : 'user',
  });

  await logActivity({
    user: req.user._id,
    action: 'USER_CREATED',
    entity: 'User',
    entityId: user._id,
    message: `${req.user.name} created user ${user.email}`,
  });

  res.status(201).json({ success: true, data: user });
});

/**
 * PUT /api/users/:id  (admin) — update any user incl. role
 */
const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, isActive, password } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  if (email && email.toLowerCase() !== user.email) {
    const taken = await User.findOne({ email: email.toLowerCase() });
    if (taken) throw new ApiError(409, 'Email already in use');
    user.email = email;
  }
  if (name !== undefined) user.name = name;
  if (role !== undefined && User.ROLES.includes(role)) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (password) user.password = password; // re-hashed by pre-save hook

  await user.save();

  await logActivity({
    user: req.user._id,
    action: 'USER_UPDATED',
    entity: 'User',
    entityId: user._id,
    message: `${req.user.name} updated user ${user.email}`,
  });

  res.json({ success: true, data: user });
});

/**
 * PATCH /api/users/:id/role  (admin) — change role only
 */
const changeRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!User.ROLES.includes(role)) {
    throw new ApiError(400, `role must be one of: ${User.ROLES.join(', ')}`);
  }
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.role = role;
  await user.save();

  await logActivity({
    user: req.user._id,
    action: 'USER_ROLE_CHANGED',
    entity: 'User',
    entityId: user._id,
    message: `${req.user.name} changed ${user.email} role to ${role}`,
  });

  res.json({ success: true, data: user });
});

/**
 * DELETE /api/users/:id  (admin)
 */
const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    throw new ApiError(400, 'You cannot delete your own account');
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  await logActivity({
    user: req.user._id,
    action: 'USER_DELETED',
    entity: 'User',
    entityId: user._id,
    message: `${req.user.name} deleted user ${user.email}`,
  });

  res.json({ success: true, message: 'User deleted' });
});

/**
 * PUT /api/users/me/profile  (any authenticated user) — update own profile
 */
const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.findById(req.user._id);

  if (email && email.toLowerCase() !== user.email) {
    const taken = await User.findOne({ email: email.toLowerCase() });
    if (taken) throw new ApiError(409, 'Email already in use');
    user.email = email;
  }
  if (name !== undefined) user.name = name;
  if (password) user.password = password;

  await user.save();
  res.json({ success: true, data: user });
});

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  changeRole,
  deleteUser,
  updateMyProfile,
};
