const express = require('express');
const router = express.Router();
const ResourceItem = require('../models/ResourceItem');
const { protect, optionalAuth } = require('../middleware/auth');

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

function formatResource(res, userId) {
  const obj = res.toObject ? res.toObject() : res;
  return {
    id: obj._id.toString(),
    title: obj.title,
    courseCode: obj.courseCode,
    category: obj.category,
    authorName: obj.authorName,
    authorAvatar: obj.authorAvatar,
    fileSize: obj.fileSize,
    timeAgo: timeAgo(obj.createdAt),
    downloads: obj.downloads || 0,
    rating: obj.rating || 0,
    isBookmarked: userId ? (obj.bookmarkedBy || []).some(id => id.toString() === userId.toString()) : false,
    fileFormat: obj.fileFormat,
    description: obj.description || undefined,
    fileName: obj.fileName || undefined,
    mimeType: obj.mimeType || undefined,
    extension: obj.extension || undefined,
    fileData: obj.fileData || undefined
  };
}

// GET /api/resources
router.get('/', optionalAuth, async (req, res) => {
  try {
    let resources = await ResourceItem.find().sort({ createdAt: -1 });
    if (resources.length === 0) {
      resources = await ResourceItem.create([
        {
          title: 'CS-402: Distributed Systems Comprehensive Lecture Notes',
          courseCode: 'CS-402',
          category: 'Lecture Notes',
          authorName: 'Fahima Tonni',
          authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
          fileSize: '4.8 MB',
          fileFormat: 'PDF',
          downloads: 145,
          rating: 4.9,
          description: 'Full lecture notes covering Raft consensus, Byzantine fault tolerance, and MapReduce architecture.'
        },
        {
          title: 'Deep Learning & PyTorch Model Architectures Cheat Sheet',
          courseCode: 'CS-415',
          category: 'Exam Prep',
          authorName: 'Dr. Saifur Rahman',
          authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          fileSize: '2.1 MB',
          fileFormat: 'PDF',
          downloads: 320,
          rating: 5.0,
          description: 'Official department reference guide for neural network architectures, backprop math, and optimizer formulas.'
        }
      ]);
    }
    const userId = req.user ? req.user._id : null;
    res.json(resources.map(r => formatResource(r, userId)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/resources
router.post('/', protect, async (req, res) => {
  try {
    const newResource = new ResourceItem({
      ...req.body,
      author: req.user._id,
      authorName: req.user.name,
      authorAvatar: req.user.avatar
    });
    const savedResource = await newResource.save();
    res.status(201).json(formatResource(savedResource, req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/resources/:id/bookmark
router.put('/:id/bookmark', protect, async (req, res) => {
  try {
    const resource = await ResourceItem.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    const index = resource.bookmarkedBy.findIndex(id => id.toString() === req.user._id.toString());
    if (index === -1) {
      resource.bookmarkedBy.push(req.user._id);
    } else {
      resource.bookmarkedBy.splice(index, 1);
    }
    await resource.save();
    res.json(formatResource(resource, req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/resources/:id/download
router.put('/:id/download', optionalAuth, async (req, res) => {
  try {
    const resource = await ResourceItem.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    const userId = req.user ? req.user._id : null;
    res.json(formatResource(resource, userId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
