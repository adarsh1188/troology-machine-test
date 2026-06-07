const asyncHandler = require('../utils/asyncHandler');
const ActivityLog = require('../models/ActivityLog');

/**
 * GET /api/activity  (admin) — paginated activity feed
 */
const listActivity = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);

  const [items, total] = await Promise.all([
    ActivityLog.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ActivityLog.countDocuments(),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

module.exports = { listActivity };
