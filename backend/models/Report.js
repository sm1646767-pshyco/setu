const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 120 },
  description: { type: String, required: true, minlength: 10, maxlength: 2000 },
  category: {
    type: String, required: true,
    enum: ['pothole', 'garbage', 'streetlight', 'water', 'handpump', 'bijli', 'road', 'drainage', 'other']
  },
  mode: { type: String, required: true, enum: ['city', 'village'] },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, default: '' }
  },
  photoUrl: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slaDeadline: { type: Date },
  resolvedAt: { type: Date, default: null },
  resolutionNote: { type: String, default: '' }
}, { timestamps: true });

reportSchema.pre('save', function (next) {
  if (this.isNew && !this.slaDeadline) {
    const days = { urgent: 1, high: 3, medium: 7, low: 14 };
    const d = new Date();
    d.setDate(d.getDate() + (days[this.priority] || 7));
    this.slaDeadline = d;
  }
  if (this.status === 'resolved' && !this.resolvedAt) this.resolvedAt = new Date();
  next();
});

module.exports = mongoose.model('Report', reportSchema);
