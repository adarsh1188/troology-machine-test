const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const { listActivity } = require('../controllers/activity.controller');

const router = express.Router();

router.get('/', protect, authorize('admin'), listActivity);

module.exports = router;
