const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/projects', require('./project.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/activity', require('./activity.routes'));

router.get('/health', (_req, res) =>
  res.json({ success: true, status: 'ok', time: new Date().toISOString() })
);

module.exports = router;
