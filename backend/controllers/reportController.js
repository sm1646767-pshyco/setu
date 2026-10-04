const Report = require('../models/Report');
const Comment = require('../models/Comment');

exports.getReports = async (req, res, next) => {
  try {
    const { status, category, mode, search, sort = '-createdAt', limit = 100, page = 1 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (mode) query.mode = mode;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
    const skip = (Number(page) - 1) * Number(limit);
    const [reports, total] = await Promise.all([
      Report.find(query).sort(sort).limit(Number(limit)).skip(skip).populate('reportedBy', 'name email'),
      Report.countDocuments(query)
    ]);
    res.json({ success: true, count: reports.length, total, reports });
  } catch (err) { next(err); }
};

exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate('reportedBy', 'name email');
    if (!report) return res.status(404).json({ error: 'Report nahi mili' });
    res.json({ success: true, report });
  } catch (err) { next(err); }
};

exports.createReport = async (req, res, next) => {
  try {
    const { title, description, category, mode, location, photoUrl, priority } = req.body;
    const report = await Report.create({
      title, description, category, mode, location, photoUrl, priority,
      reportedBy: req.user._id
    });
    await report.populate('reportedBy', 'name email');
    res.status(201).json({ success: true, report });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, resolutionNote } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, resolutionNote: resolutionNote || '' },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: 'Report nahi mili' });
    res.json({ success: true, report });
  } catch (err) { next(err); }
};

exports.upvote = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report nahi mili' });
    const userId = req.user._id.toString();
    const already = report.upvotedBy.some((id) => id.toString() === userId);
    if (already) {
      report.upvotedBy = report.upvotedBy.filter((id) => id.toString() !== userId);
      report.upvotes = Math.max(0, report.upvotes - 1);
    } else {
      report.upvotedBy.push(req.user._id);
      report.upvotes += 1;
    }
    await report.save();
    res.json({ success: true, upvotes: report.upvotes, upvoted: !already });
  } catch (err) { next(err); }
};

exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report nahi mili' });
    const isOwner = report.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Permission nahi' });
    await Comment.deleteMany({ report: report._id });
    await report.deleteOne();
    res.json({ success: true, message: 'Report delete ho gayi' });
  } catch (err) { next(err); }
};

exports.getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reportedBy: req.user._id }).sort('-createdAt');
    res.json({ success: true, count: reports.length, reports });
  } catch (err) { next(err); }
};
