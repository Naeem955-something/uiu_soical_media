const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'General' },
  targetAudience: { type: String, default: 'All' },
  priority: { type: String, enum: ['Low', 'Normal', 'High', 'Urgent'], default: 'Normal' },
  authorName: { type: String, default: 'University Administration' },
  status: { type: String, enum: ['Published', 'Draft'], default: 'Published' },
  sentNotification: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
