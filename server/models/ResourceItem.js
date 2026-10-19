const mongoose = require('mongoose');

const resourceItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  courseCode: { type: String, default: '' },
  category: { type: String, default: 'Lecture Notes' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, default: '' },
  authorAvatar: { type: String, default: '' },
  fileSize: { type: String, default: '' },
  fileFormat: { type: String, default: 'PDF' },
  fileName: { type: String, default: '' },
  mimeType: { type: String, default: '' },
  extension: { type: String, default: '' },
  fileData: { type: String, default: '' },
  description: { type: String, default: '' },
  downloads: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const ResourceItem = mongoose.model('ResourceItem', resourceItemSchema);
module.exports = ResourceItem;
