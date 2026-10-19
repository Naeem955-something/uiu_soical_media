const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function formatNotification(notif) {
  const obj = notif.toObject ? notif.toObject() : notif;
  return {
    id: obj._id.toString(),
    title: obj.title,
    description: obj.description,
    timeAgo: timeAgo(obj.createdAt),
    category: obj.category,
    isRead: obj.isRead,
    type: obj.type,
    actionButton: obj.actionButton && obj.actionButton.label ? obj.actionButton : undefined,
    secondaryButton: obj.secondaryButton && obj.secondaryButton.label ? obj.secondaryButton : undefined
  };
}

// GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications.map(n => formatNotification(n)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications.map(n => formatNotification(n)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.isRead = true;
    await notification.save();
    res.json(formatNotification(notification));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
