const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getReports, getReport, createReport, updateStatus, upvote, deleteReport, getMyReports
} = require('../controllers/reportController');
const { addComment, getComments } = require('../controllers/commentController');

router.get('/', getReports);
router.get('/mine', protect, getMyReports);
router.get('/:id', getReport);
router.post('/', protect, createReport);
router.patch('/:id/status', protect, updateStatus);
router.patch('/:id/upvote', protect, upvote);
router.delete('/:id', protect, deleteReport);
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', getComments);

module.exports = router;
