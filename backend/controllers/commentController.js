const Comment = require('../models/Comment');
const Report = require('../models/Report');

exports.addComment = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report nahi mili' });
    const comment = await Comment.create({ report: report._id, user: req.user._id, text: req.body.text });
    await comment.populate('user', 'name email');
    res.status(201).json({ success: true, comment });
  } catch (err) { next(err); }
};

exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ report: req.params.id }).sort('-createdAt').populate('user', 'name email');
    res.json({ success: true, count: comments.length, comments });
  } catch (err) { next(err); }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment nahi mila' });
    const isOwner = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Permission nahi' });
    await comment.deleteOne();
    res.json({ success: true, message: 'Comment delete' });
  } catch (err) { next(err); }
};
