const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9_-]+$/,
      'Slug can only contain letters, numbers, underscores and hyphens'
    ]
  },
  original_url: {
    type: String,
    required: [true, 'Please provide the original URL'],
    match: [
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
      'Please provide a valid URL'
    ]
  },
  clicks: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
});

// Index for faster queries
LinkSchema.index({ slug: 1 });
LinkSchema.index({ owner_id: 1 });

module.exports = mongoose.model('Link', LinkSchema); 