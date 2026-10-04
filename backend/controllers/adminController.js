const Report = require('../models/Report');
const User = require('../models/User');
const Comment = require('../models/Comment');

exports.getStats = async (req, res, next) => {
  try {
    const [totalReports, pending, inProgress, resolved, rejected, totalUsers, totalComments] = await Promise.all([
      Report.countDocuments(), Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'in-progress' }), Report.countDocuments({ status: 'resolved' }),
      Report.countDocuments({ status: 'rejected' }), User.countDocuments(), Comment.countDocuments()
    ]);
    const byCategory = await Report.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }
    ]);
    const overdue = await Report.countDocuments({
      slaDeadline: { $lt: new Date() }, status: { $nin: ['resolved', 'rejected'] }
    });
    res.json({ success: true, stats: {
      totalReports, pending, inProgress, resolved, rejected, totalUsers, totalComments, overdue, byCategory,
      resolutionRate: totalReports ? ((resolved / totalReports) * 100).toFixed(1) : 0
    }});
  } catch (err) { next(err); }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.json({ success: true, users });
  } catch (err) { next(err); }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};
