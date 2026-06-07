const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const {
  listUsers,
  getUser,
  createUser,
  updateUser,
  changeRole,
  deleteUser,
  updateMyProfile,
} = require('../controllers/user.controller');

const router = express.Router();

router.use(protect);

// Self-service (any authenticated user) — declared before /:id
router.put('/me/profile', updateMyProfile);

// Admin-only user management
router.get('/', authorize('admin'), listUsers);
router.post('/', authorize('admin'), createUser);
router.get('/:id', authorize('admin'), getUser);
router.put('/:id', authorize('admin'), updateUser);
router.patch('/:id/role', authorize('admin'), changeRole);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
