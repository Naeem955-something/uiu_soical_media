const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  type: { type: String, required: true },
  actionButton: {
    label: String,
    viewTarget: String
  },
  secondaryButton: {
    label: String
  }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
