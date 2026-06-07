const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Project = require('../models/Project');
const env = require('../config/env');
const { persistFiles, removeFile } = require('../services/storage.service');
const { logActivity } = require('../utils/activity');

const POPULATE = [
  { path: 'assignedUsers', select: 'name email role' },
  { path: 'createdBy', select: 'name email' },
];

// assignedUsers may arrive as a JSON string (multipart) or array (json)
function parseAssignedUsers(raw) {
  if (raw === undefined || raw === null || raw === '') return undefined;
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // comma separated fallback
    return String(raw)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

function isAssigned(project, userId) {
  return project.assignedUsers.some(
    (u) => String(u._id || u) === String(userId)
  );
}

/**
 * GET /api/projects
 * Admin: all projects. User: only assigned.
 * Query: ?search=&status=&page=&limit=&sort=
 */
const listProjects = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const { search, status, sort } = req.query;

  const filter = {};
  if (req.user.role !== 'admin') {
    filter.assignedUsers = req.user._id;
  }
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const sortBy = sort || '-createdAt';

  const [items, total] = await Promise.all([
    Project.find(filter)
      .populate(POPULATE)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit),
    Project.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

/**
 * GET /api/projects/:id
 */
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate(POPULATE);
  if (!project) throw new ApiError(404, 'Project not found');

  if (req.user.role !== 'admin' && !isAssigned(project, req.user._id)) {
    throw new ApiError(403, 'You are not assigned to this project');
  }

  res.json({ success: true, data: project });
});

/**
 * POST /api/projects  (admin) — supports multipart attachments
 */
const createProject = asyncHandler(async (req, res) => {
  const { title, description, startDate, endDate, status } = req.body;
  if (!title) throw new ApiError(400, 'title is required');

  const assignedUsers = parseAssignedUsers(req.body.assignedUsers) || [];

  let attachments = [];
  if (req.files && req.files.length) {
    if (req.files.length > env.maxAttachments) {
      throw new ApiError(400, `Maximum ${env.maxAttachments} attachments allowed`);
    }
    attachments = await persistFiles(req.files);
  }

  const project = await Project.create({
    title,
    description,
    startDate,
    endDate,
    status,
    assignedUsers,
    attachments,
    createdBy: req.user._id,
  });

  await project.populate(POPULATE);

  await logActivity({
    user: req.user._id,
    action: 'PROJECT_CREATED',
    entity: 'Project',
    entityId: project._id,
    message: `${req.user.name} created project "${project.title}"`,
  });

  res.status(201).json({ success: true, data: project });
});

/**
 * PUT /api/projects/:id  (admin) — full update + optional new attachments
 */
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');

  const { title, description, startDate, endDate, status } = req.body;
  if (title !== undefined) project.title = title;
  if (description !== undefined) project.description = description;
  if (startDate !== undefined) project.startDate = startDate;
  if (endDate !== undefined) project.endDate = endDate;
  if (status !== undefined) project.status = status;

  const assignedUsers = parseAssignedUsers(req.body.assignedUsers);
  if (assignedUsers !== undefined) project.assignedUsers = assignedUsers;

  // Append new attachments (respecting the 3-file cap)
  if (req.files && req.files.length) {
    if (project.attachments.length + req.files.length > env.maxAttachments) {
      throw new ApiError(
        400,
        `Maximum ${env.maxAttachments} attachments allowed (currently ${project.attachments.length})`
      );
    }
    const persisted = await persistFiles(req.files);
    project.attachments.push(...persisted);
  }

  await project.save();
  await project.populate(POPULATE);

  await logActivity({
    user: req.user._id,
    action: 'PROJECT_UPDATED',
    entity: 'Project',
    entityId: project._id,
    message: `${req.user.name} updated project "${project.title}"`,
  });

  res.json({ success: true, data: project });
});

/**
 * PATCH /api/projects/:id/status
 * Admin OR an assigned user may change status.
 */
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!Project.STATUSES.includes(status)) {
    throw new ApiError(400, `status must be one of: ${Project.STATUSES.join(', ')}`);
  }

  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');

  if (req.user.role !== 'admin' && !isAssigned(project, req.user._id)) {
    throw new ApiError(403, 'You can only update projects assigned to you');
  }

  project.status = status;
  await project.save();
  await project.populate(POPULATE);

  await logActivity({
    user: req.user._id,
    action: 'PROJECT_STATUS_UPDATED',
    entity: 'Project',
    entityId: project._id,
    message: `${req.user.name} set "${project.title}" to ${status}`,
  });

  res.json({ success: true, data: project });
});

/**
 * DELETE /api/projects/:id  (admin)
 */
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');

  await Promise.all(project.attachments.map(removeFile));
  await project.deleteOne();

  await logActivity({
    user: req.user._id,
    action: 'PROJECT_DELETED',
    entity: 'Project',
    entityId: project._id,
    message: `${req.user.name} deleted project "${project.title}"`,
  });

  res.json({ success: true, message: 'Project deleted' });
});

/**
 * DELETE /api/projects/:id/attachments/:attachmentId  (admin)
 */
const deleteAttachment = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');

  const attachment = project.attachments.id(req.params.attachmentId);
  if (!attachment) throw new ApiError(404, 'Attachment not found');

  await removeFile(attachment);
  attachment.deleteOne();
  await project.save();
  await project.populate(POPULATE);

  res.json({ success: true, data: project });
});

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  updateStatus,
  deleteProject,
  deleteAttachment,
};
