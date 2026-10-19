const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect, optionalAuth } = require('../middleware/auth');

// Helper to compute timeAgo from a date
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

// Format post for frontend
function formatPost(post, userId) {
  const obj = post.toObject ? post.toObject() : post;
  return {
    id: obj._id.toString(),
    authorName: obj.authorName || (obj.author && obj.author.name) || '',
    authorAvatar: obj.authorAvatar || (obj.author && obj.author.avatar) || '',
    authorBadge: obj.authorBadge || undefined,
    authorDepartment: obj.authorDepartment || '',
    timeAgo: timeAgo(obj.createdAt),
    title: obj.title || undefined,
    content: obj.content,
    fileAttachment: obj.fileAttachment && obj.fileAttachment.name ? {
      name: obj.fileAttachment.name,
      size: obj.fileAttachment.size,
      url: obj.fileAttachment.url,
      mimeType: obj.fileAttachment.mimeType,
      extension: obj.fileAttachment.extension,
      fileData: obj.fileAttachment.fileData
    } : undefined,
    image: obj.image || undefined,
    imageDataUrl: obj.imageDataUrl || undefined,
    tags: obj.tags || [],
    likes: obj.likes || 0,
    userLiked: userId ? (obj.likedBy || []).some(id => id.toString() === userId.toString()) : false,
    commentsCount: obj.commentsCount || 0,
    commentsList: (obj.comments || []).map(c => ({
      id: c._id ? c._id.toString() : `c-${Date.now()}`,
      authorName: c.author ? c.author.name : '',
      authorAvatar: c.author ? c.author.avatar : '',
      text: c.text,
      timeAgo: timeAgo(c.createdAt)
    })),
    poll: obj.poll && obj.poll.options && obj.poll.options.length > 0 ? {
      question: obj.poll.question,
      options: obj.poll.options.map((opt, i) => ({
        id: opt._id ? opt._id.toString() : `opt-${i}`,
        label: opt.label,
        votes: opt.votes || 0,
        percentage: obj.poll.totalVotes > 0 ? Math.round((opt.votes / obj.poll.totalVotes) * 100) : 0
      })),
      totalVotes: obj.poll.totalVotes || 0,
      endsIn: obj.poll.endsIn || ''
    } : undefined,
    actionButton: obj.actionButton && obj.actionButton.label ? obj.actionButton : undefined
  };
}

// GET /api/posts
router.get('/', optionalAuth, async (req, res) => {
  try {
    let posts = await Post.find().sort({ createdAt: -1 });
    if (posts.length === 0) {
      posts = await Post.create([
        {
          authorName: 'Dr. Saifur Rahman',
          authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
          authorBadge: 'FACULTY',
          authorDepartment: 'Computer Science & Engineering',
          content: 'Excited to announce our lab\'s upcoming seminar on Generative Diffusion Models and Edge AI applications! Undergrad research assistant positions are open for Spring semester. Check out the project outline attached below.',
          fileAttachment: {
            name: 'Edge_AI_Research_Syllabus_2025.pdf',
            size: '2.4 MB'
          },
          tags: ['Research', 'MachineLearning', 'EdgeAI'],
          likes: 38,
          commentsCount: 2,
          comments: [
            {
              author: { name: 'Student User', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
              text: 'Is there a prerequisite course requirement for the research assistantship?',
              createdAt: new Date(Date.now() - 3600000)
            },
            {
              author: { name: 'Dr. Saifur Rahman', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
              text: 'Data Structures and basic Linear Algebra are sufficient. Enthusiasm for PyTorch is key!',
              createdAt: new Date(Date.now() - 1800000)
            }
          ]
        },
        {
          authorName: 'Machine Learning Club',
          authorAvatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200',
          authorBadge: 'CLUB',
          authorDepartment: 'Student Activities Council',
          content: 'Campus Annual Hackathon 2025: Which primary track would you most like to compete in this year? Cast your vote!',
          tags: ['Hackathon', 'CampusLife', 'Coding'],
          likes: 64,
          commentsCount: 1,
          poll: {
            question: 'Preferred Hackathon Domain Track:',
            options: [
              { label: 'AI & Intelligent Agents', votes: 45 },
              { label: 'FinTech & Web3 Services', votes: 12 },
              { label: 'Healthcare & Biotech Tools', votes: 23 },
              { label: 'Smart Campus Infrastructure', votes: 31 }
            ],
            totalVotes: 111,
            endsIn: '2 days remaining'
          },
          comments: [
            {
              author: { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
              text: 'Team registration opens next Monday!',
              createdAt: new Date(Date.now() - 7200000)
            }
          ]
        }
      ]);
    }
    const userId = req.user ? req.user._id : null;
    res.json(posts.map(p => formatPost(p, userId)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/posts
router.post('/', protect, async (req, res) => {
  try {
    const { content, image, imageDataUrl, fileAttachment, title, tags } = req.body;
    const newPost = new Post({
      author: req.user._id,
      authorName: req.user.name,
      authorAvatar: req.user.avatar,
      authorBadge: req.user.role === 'STUDENT' ? 'STUDENT' : 'FACULTY',
      authorDepartment: req.user.department || '',
      content,
      image,
      imageDataUrl,
      fileAttachment,
      title,
      tags: tags || []
    });
    const savedPost = await newPost.save();
    res.status(201).json(formatPost(savedPost, req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/posts/:id/like
router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const index = post.likedBy.findIndex(id => id.toString() === req.user._id.toString());
    if (index === -1) {
      post.likedBy.push(req.user._id);
      post.likes += 1;
    } else {
      post.likedBy.splice(index, 1);
      post.likes = Math.max(0, post.likes - 1);
    }
    await post.save();
    res.json(formatPost(post, req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/posts/:id/comments
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const comment = {
      author: {
        name: req.user.name,
        avatar: req.user.avatar
      },
      text: req.body.text,
      createdAt: new Date()
    };
    post.comments.push(comment);
    post.commentsCount += 1;
    await post.save();
    res.json(formatPost(post, req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/posts/:id/vote
router.put('/:id/vote', protect, async (req, res) => {
  try {
    const { optionId } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post || !post.poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    // Find the option by its _id
    const option = post.poll.options.id(optionId) || post.poll.options[0];
    if (option) {
      option.votes += 1;
      post.poll.totalVotes += 1;
    }
    await post.save();
    res.json(formatPost(post, req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
