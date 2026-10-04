const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Naam zaroori'], trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: [true, 'Email zaroori'], unique: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  password: { type: String, required: [true, 'Password zaroori'], minlength: 6, select: false },
  role: { type: String, enum: ['user', 'admin', 'worker'], default: 'user' },
  city: { type: String, default: '' },
  village: { type: String, default: '' }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
