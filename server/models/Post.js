const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, default: '' },
  authorAvatar: { type: String, default: '' },
  authorBadge: { type: String, enum: ['FACULTY', 'CLUB', 'STUDENT', ''], default: '' },
  authorDepartment: { type: String, default: '' },
  title: { type: String, default: '' },
  content: { type: String, required: true },
  fileAttachment: {
    name: String,
    size: String,
    url: String,
    mimeType: String,
    extension: String,
    fileData: String
  },
  image: { type: String, default: '' },
  imageDataUrl: { type: String, default: '' },
  tags: { type: [String], default: [] },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  commentsCount: { type: Number, default: 0 },
  comments: [{
    author: {
      name: String,
      avatar: String
    },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  poll: {
    question: String,
    options: [{
      label: String,
      votes: { type: Number, default: 0 }
    }],
    totalVotes: { type: Number, default: 0 },
    endsIn: String
  },
  actionButton: {
    label: String,
    actionType: String
  }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
