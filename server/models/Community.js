const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'Academic' },
  leaderName: { type: String, default: 'Campus Coordinator' },
  leaderEmail: { type: String, default: '' },
  membersCount: { type: Number, default: 1 },
  status: { type: String, enum: ['Approved', 'Pending', 'Suspended'], default: 'Approved' },
  bannerImage: { type: String, default: '' },
  meetingInfo: { type: String, default: '' },
  tags: { type: [String], default: [] },
  iconColor: { type: String, default: '#2563EB' },
  discussions: [{
    author: { type: String, default: 'Campus Member' },
    avatar: { type: String, default: '' },
    category: { type: String, default: 'Discussion' },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
      authorName: { type: String, default: 'Student' },
      authorAvatar: { type: String, default: '' },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Community', communitySchema);
