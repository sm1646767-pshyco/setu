const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getStats, getUsers, updateUserRole } = require('../controllers/adminController');

router.use(protect, adminOnly);
router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;
