const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const Notification = require('../models/Notification');
const { optionalAuth } = require('../middleware/auth');

function formatCommunity(c) {
  const obj = c.toObject ? c.toObject() : c;
  return {
    id: obj._id.toString(),
    name: obj.name,
    description: obj.description || '',
    category: obj.category || 'Academic',
    leaderName: obj.leaderName || 'Student Organizer',
    leaderEmail: obj.leaderEmail || '',
    membersCount: obj.membersCount || 1,
    status: obj.status || 'Approved',
    bannerImage: obj.bannerImage || '',
    meetingInfo: obj.meetingInfo || '',
    tags: obj.tags || [],
    iconColor: obj.iconColor || '#2563EB',
    createdAt: obj.createdAt
  };
}

// GET /api/communities - list all communities
router.get('/', async (req, res) => {
  try {
    let communities = await Community.find({ status: { $ne: 'Suspended' } }).sort({ createdAt: -1 });
    if (communities.length === 0) {
      communities = await Community.create([
        {
          name: 'Machine Learning Club',
          description: 'Exploring the frontiers of neural networks, deep learning, and ethical AI in the heart of our campus.',
          category: 'Technology',
          leaderName: 'Dr. Saifur Rahman',
          leaderEmail: 's.rahman@university.edu',
          membersCount: 1200,
          status: 'Approved',
          bannerImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400',
          meetingInfo: 'Fridays at 4:00 PM • Lab 402',
          tags: ['AI', 'Python', 'DeepLearning'],
          iconColor: '#2563EB'
        },
        {
          name: 'CSE Department Association',
          description: 'Official student and alumni community of the Computer Science & Engineering department.',
          category: 'Academic',
          leaderName: 'Prof. Robert Davis',
          leaderEmail: 'r.davis@university.edu',
          membersCount: 4500,
          status: 'Approved',
          bannerImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000',
          meetingInfo: 'Monthly General Assembly',
          tags: ['ComputerScience', 'Engineering', 'Alumni'],
          iconColor: '#7C3AED'
        },
        {
          name: 'AI Research Lab',
          description: 'Undergraduate and postgraduate research group focusing on computer vision and LLMs.',
          category: 'Research',
          leaderName: 'Fahima Tonni',
          leaderEmail: 'fahima.t@university.edu',
          membersCount: 820,
          status: 'Approved',
          bannerImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000',
          meetingInfo: 'Wednesdays at 5:00 PM • Research Center',
          tags: ['Research', 'Papers', 'NLP'],
          iconColor: '#059669'
        },
        {
          name: 'Robotics & Automation Society',
          description: 'Hardware prototyping, autonomous systems, and embedded robotics sprint competitions.',
          category: 'Technology',
          leaderName: 'Alex Rivera',
          leaderEmail: 'alex.r@university.edu',
          membersCount: 1800,
          status: 'Approved',
          bannerImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1000',
          meetingInfo: 'Saturdays at 11:00 AM • Robotics Lab',
          tags: ['Robotics', 'Arduino', 'Hardware'],
          iconColor: '#D97706'
        }
      ]);
    }
    res.json(communities.map(c => formatCommunity(c)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/communities - create a new community (students / faculty)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, description, category, meetingInfo, tags, bannerImage, iconColor } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Community name is required' });
    }

    const leaderName = req.user ? req.user.name : (req.body.leaderName || 'Student Organizer');
    const leaderEmail = req.user ? req.user.email : (req.body.leaderEmail || '');

    const defaultImages = [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000'
    ];
    const pickedImage = bannerImage && bannerImage.trim() 
      ? bannerImage.trim() 
      : defaultImages[Math.floor(Math.random() * defaultImages.length)];

    const newCommunity = new Community({
      name: name.trim(),
      description: description ? description.trim() : `Official university campus community for ${name.trim()}.`,
      category: category || 'Academic',
      leaderName,
      leaderEmail,
      membersCount: 1, // creator is member 1
      status: 'Approved',
      bannerImage: pickedImage,
      meetingInfo: meetingInfo || 'Weekly Campus Meetups',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [category || 'Campus']),
      iconColor: iconColor || '#2563EB'
    });

    const saved = await newCommunity.save();

    // Create notification for user
    if (req.user) {
      try {
        await Notification.create({
          userId: req.user._id,
          title: `🏛️ Community "${saved.name}" Created!`,
          description: `You are now the Lead Organizer of ${saved.name}. Start inviting campus peers!`,
          category: 'social',
          isRead: false,
          type: 'community',
          actionButton: { label: 'Open Community', viewTarget: 'communities' }
        });
      } catch (nErr) {
        console.error('Notification creation error:', nErr);
      }
    }

    res.status(201).json(formatCommunity(saved));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/communities/:id/join - toggle join community
router.post('/:id/join', optionalAuth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const { isJoining } = req.body;
    if (isJoining) {
      community.membersCount = (community.membersCount || 0) + 1;
    } else {
      community.membersCount = Math.max(1, (community.membersCount || 1) - 1);
    }

    await community.save();
    res.json(formatCommunity(community));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Format community discussion
function formatDiscussion(d, userId) {
  const seconds = Math.floor((new Date() - new Date(d.createdAt || Date.now())) / 1000);
  let timeStr = 'Just now';
  if (seconds >= 60 && seconds < 3600) timeStr = `${Math.floor(seconds / 60)}m ago`;
  else if (seconds >= 3600 && seconds < 86400) timeStr = `${Math.floor(seconds / 3600)}h ago`;
  else if (seconds >= 86400) timeStr = `${Math.floor(seconds / 86400)}d ago`;

  return {
    id: d._id ? d._id.toString() : `d-${Date.now()}`,
    author: d.author || 'Campus Member',
    avatar: d.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    time: timeStr,
    category: d.category || 'Discussion',
    content: d.content,
    likes: d.likes || 0,
    liked: userId ? (d.likedBy || []).some(id => id.toString() === userId.toString()) : false,
    comments: (d.comments || []).length,
    commentsList: (d.comments || []).map(c => {
      const cSec = Math.floor((new Date() - new Date(c.createdAt || Date.now())) / 1000);
      let cTime = 'Just now';
      if (cSec >= 60 && cSec < 3600) cTime = `${Math.floor(cSec / 60)}m ago`;
      else if (cSec >= 3600 && cSec < 86400) cTime = `${Math.floor(cSec / 3600)}h ago`;
      else if (cSec >= 86400) cTime = `${Math.floor(cSec / 86400)}d ago`;

      return {
        id: c._id ? c._id.toString() : `c-${Date.now()}`,
        authorName: c.authorName || 'Student',
        authorAvatar: c.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80',
        text: c.text,
        timeAgo: cTime
      };
    })
  };
}

// GET /api/communities/:id/discussions
router.get('/:id/discussions', optionalAuth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    const userId = req.user ? req.user._id : null;
    const discussions = (community.discussions || []).map(d => formatDiscussion(d, userId));
    // Sort newest first
    discussions.reverse();
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/communities/:id/discussions
router.post('/:id/discussions', optionalAuth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    const { content, category } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Discussion content is required' });
    }

    const author = req.user ? req.user.name : (req.body.author || 'Campus Member');
    const avatar = req.user ? req.user.avatar : (req.body.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100');

    const newDisc = {
      author,
      avatar,
      category: category || 'Discussion',
      content: content.trim(),
      likes: 0,
      likedBy: [],
      comments: []
    };

    if (!community.discussions) community.discussions = [];
    community.discussions.push(newDisc);
    await community.save();

    const createdDisc = community.discussions[community.discussions.length - 1];
    res.status(201).json(formatDiscussion(createdDisc, req.user ? req.user._id : null));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/communities/:id/discussions/:discId/comments
router.post('/:id/discussions/:discId/comments', optionalAuth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    const disc = community.discussions.id(req.params.discId);
    if (!disc) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const authorName = req.user ? req.user.name : (req.body.authorName || 'Student');
    const authorAvatar = req.user ? req.user.avatar : (req.body.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80');

    disc.comments.push({
      authorName,
      authorAvatar,
      text: text.trim()
    });

    await community.save();
    res.json(formatDiscussion(disc, req.user ? req.user._id : null));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/communities/:id/discussions/:discId/like
router.put('/:id/discussions/:discId/like', optionalAuth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    const disc = community.discussions.id(req.params.discId);
    if (!disc) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const userId = req.user ? req.user._id : null;
    if (userId) {
      const idx = (disc.likedBy || []).findIndex(id => id.toString() === userId.toString());
      if (idx === -1) {
        if (!disc.likedBy) disc.likedBy = [];
        disc.likedBy.push(userId);
        disc.likes = (disc.likes || 0) + 1;
      } else {
        disc.likedBy.splice(idx, 1);
        disc.likes = Math.max(0, (disc.likes || 1) - 1);
      }
    } else {
      disc.likes = (disc.likes || 0) + 1;
    }

    await community.save();
    res.json(formatDiscussion(disc, userId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
