const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Project = require('../models/Project');

/**
 * GET /api/dashboard
 * Returns: total users, total projects, count by status,
 * and projects ending within the next 7 days.
 * Users only see analytics scoped to their assigned projects.
 */
const getDashboard = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const projectScope = isAdmin ? {} : { assignedUsers: req.user._id };

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalProjects,
    statusAgg,
    endingSoon,
    endingSoonList,
  ] = await Promise.all([
    isAdmin ? User.countDocuments() : Promise.resolve(null),
    Project.countDocuments(projectScope),
    Project.aggregate([
      { $match: projectScope },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Project.countDocuments({
      ...projectScope,
      endDate: { $gte: now, $lte: in7Days },
      status: { $ne: 'Completed' },
    }),
    Project.find({
      ...projectScope,
      endDate: { $gte: now, $lte: in7Days },
      status: { $ne: 'Completed' },
    })
      .select('title status endDate')
      .sort({ endDate: 1 })
      .limit(10),
  ]);

  // Normalise status counts so every status is present
  const byStatus = { Pending: 0, 'In-Progress': 0, Completed: 0 };
  statusAgg.forEach((s) => {
    byStatus[s._id] = s.count;
  });

  res.json({
    success: true,
    data: {
      totalUsers,
      totalProjects,
      projectsByStatus: byStatus,
      projectsEndingWithin7Days: endingSoon,
      endingSoonProjects: endingSoonList,
    },
  });
});

module.exports = { getDashboard };
