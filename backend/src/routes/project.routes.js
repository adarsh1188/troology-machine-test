const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const { uploadAttachments } = require('../middleware/upload');
const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  updateStatus,
  deleteProject,
  deleteAttachment,
} = require('../controllers/project.controller');

const router = express.Router();

router.use(protect);

router.get('/', listProjects);
router.get('/:id', getProject);

// Admin: create / update / delete
router.post('/', authorize('admin'), uploadAttachments, createProject);
router.put('/:id', authorize('admin'), uploadAttachments, updateProject);
router.delete('/:id', authorize('admin'), deleteProject);
router.delete('/:id/attachments/:attachmentId', authorize('admin'), deleteAttachment);

// Admin OR assigned user: status only
router.patch('/:id/status', updateStatus);

module.exports = router;
