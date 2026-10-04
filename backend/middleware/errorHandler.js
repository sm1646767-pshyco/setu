const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server error';
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  if (err.name === 'CastError') { statusCode = 400; message = 'Invalid ID'; }
  if (err.code === 11000) { statusCode = 400; message = 'Duplicate field'; }
  res.status(statusCode).json({ error: message });
};
module.exports = errorHandler;
