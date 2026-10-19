const express = require('express');
const router = express.Router();
const AdminReport = require('../models/AdminReport');
const User = require('../models/User');
const Post = require('../models/Post');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');
const Community = require('../models/Community');
const { protect, adminOnly } = require('../middleware/auth');

// Require authentication and administrator role for all admin routes
router.use(protect, adminOnly);

// In-memory fallback / cache for university platform settings
let platformSettings = {
  universityName: 'Metropolitan University',
  campusLocation: 'Dhaka, Bangladesh',
  academicSession: 'Fall 2026',
  contactEmail: 'admin@university.edu',
  allowStudentPosts: true,
  moderationEnabled: true,
  allowStudentRegistration: true,
  systemNotice: 'Welcome to the university unified digital campus portal.'
};

function formatReport(report) {
  const obj = report.toObject ? report.toObject() : report;
  return {
    id: obj._id.toString(),
    reporterInitials: obj.reporterInitials || 'AN',
    reporterName: obj.reporterName || 'Anonymous',
    reporterRole: obj.reporterRole || 'STUDENT',
    reportedContent: obj.reportedContent || '',
    locationContext: obj.locationContext || 'Campus Feed',
    reason: obj.reason || 'Content violation',
    priority: obj.priority || 'Normal',
    status: obj.status || 'Pending',
    createdAt: obj.createdAt
  };
}

// ==========================================
// 1. DASHBOARD & STATS
// ==========================================
router.get('/stats', protect, async (req, res) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalUsers,
      totalPosts,
      totalEvents,
      pendingReports,
      totalCommunities,
      totalAnnouncements
    ] = await Promise.all([
      User.countDocuments({ role: 'STUDENT' }),
      User.countDocuments({ role: 'FACULTY' }),
      User.countDocuments(),
      Post.countDocuments(),
      Event.countDocuments(),
      AdminReport.countDocuments({ status: { $ne: 'Reviewed' } }),
      Community.countDocuments(),
      Announcement.countDocuments()
    ]);

    const activeUsers = Math.max(1, Math.round(totalUsers * 0.45));

    res.json({
      totalStudents,
      totalFaculty,
      totalUsers,
      activeUsers,
      totalPosts,
      totalEvents,
      pendingReports,
      totalCommunities,
      totalAnnouncements
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 2. USER MANAGEMENT
// ==========================================
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department || 'General',
      studentId: u.studentId || '',
      semester: u.semester || '',
      avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      isBlocked: !!u.isBlocked,
      verified: !!u.verified,
      createdAt: u.createdAt
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/users', protect, async (req, res) => {
  try {
    const { name, email, password, role, department, studentId } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const newUser = new User({
      name,
      email,
      password,
      role: role || 'STUDENT',
      department: department || 'Computer Science',
      studentId: studentId || '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      isBlocked: false,
      verified: true
    });

    const saved = await newUser.save();
    res.status(201).json({
      id: saved._id.toString(),
      name: saved.name,
      email: saved.email,
      role: saved.role,
      department: saved.department,
      studentId: saved.studentId,
      avatar: saved.avatar,
      isBlocked: saved.isBlocked
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.role) user.role = req.body.role;
    if (req.body.department !== undefined) user.department = req.body.department;
    if (req.body.studentId !== undefined) user.studentId = req.body.studentId;
    if (req.body.isBlocked !== undefined) user.isBlocked = req.body.isBlocked;

    const saved = await user.save();
    res.json({
      id: saved._id.toString(),
      name: saved.name,
      email: saved.email,
      role: saved.role,
      department: saved.department,
      studentId: saved.studentId,
      avatar: saved.avatar,
      isBlocked: saved.isBlocked
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id/block', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      id: user._id.toString(),
      name: user.name,
      isBlocked: user.isBlocked,
      message: `User is now ${user.isBlocked ? 'Blocked' : 'Unblocked'}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/users/:id', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 3. POST MANAGEMENT
// ==========================================
router.get('/posts', protect, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name avatar department role')
      .sort({ createdAt: -1 });

    res.json(posts.map(p => {
      const authorObj = (p.author && typeof p.author === 'object') ? p.author : null;
      return {
        id: p._id.toString(),
        author: {
          name: p.authorName || (authorObj && authorObj.name) || 'Campus Member',
          avatar: p.authorAvatar || (authorObj && authorObj.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80',
          department: p.authorDepartment || (authorObj && authorObj.department) || 'Campus Member'
        },
        content: p.content || '',
        tags: Array.isArray(p.tags) ? p.tags : [],
        likes: typeof p.likes === 'number' ? p.likes : (Array.isArray(p.likedBy) ? p.likedBy.length : 0),
        commentsCount: typeof p.commentsCount === 'number' ? p.commentsCount : (Array.isArray(p.comments) ? p.comments.length : 0),
        comments: (p.comments || []).map(c => ({
          id: c._id ? c._id.toString() : `c-${Date.now()}-${Math.random()}`,
          author: {
            name: (c.author && c.author.name) || 'Student Member',
            avatar: (c.author && c.author.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'
          },
          text: c.text || '',
          createdAt: c.createdAt || new Date()
        })),
        image: p.image || null,
        fileAttachment: p.fileAttachment || null,
        createdAt: p.createdAt || new Date()
      };
    }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/posts/:id', protect, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ success: true, message: 'Post removed by administrator' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/posts/:postId/comments/:commentId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments = (post.comments || []).filter(c => c._id && c._id.toString() !== req.params.commentId);
    post.commentsCount = Math.max(0, post.comments.length);
    await post.save();
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 4. REPORTS
// ==========================================
router.get('/reports', protect, async (req, res) => {
  try {
    const reports = await AdminReport.find().sort({ createdAt: -1 });
    res.json(reports.map(r => formatReport(r)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/reports', protect, async (req, res) => {
  try {
    const { reportedContent, locationContext, reason, priority } = req.body;
    const report = new AdminReport({
      reporterInitials: req.user ? req.user.name.substring(0, 2).toUpperCase() : 'ST',
      reporterName: req.user ? req.user.name : 'Student',
      reporterRole: req.user ? req.user.role : 'STUDENT',
      reportedContent: reportedContent || 'Flagged content',
      locationContext: locationContext || 'Post Feed',
      reason: reason || 'Inappropriate content',
      priority: priority || 'Normal',
      status: 'Pending'
    });
    const saved = await report.save();
    res.status(201).json(formatReport(saved));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/reports/:id', protect, async (req, res) => {
  try {
    const report = await AdminReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.status = req.body.status || report.status;
    await report.save();
    res.json(formatReport(report));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/reports/:id', protect, async (req, res) => {
  try {
    const report = await AdminReport.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json({ success: true, message: 'Report dismissed/deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 5. EVENT MANAGEMENT
// ==========================================
router.get('/events', protect, async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events.map(ev => ({
      id: ev._id.toString(),
      title: ev.title,
      typeBadge: ev.typeBadge,
      date: ev.date,
      time: ev.time,
      location: ev.location,
      description: ev.description,
      registeredCount: ev.registeredUsers ? ev.registeredUsers.length : (ev.registeredCount || 0),
      maxCapacity: ev.maxCapacity || 100,
      image: ev.image
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/events', protect, async (req, res) => {
  try {
    const { title, typeBadge, date, time, location, description, maxCapacity, image } = req.body;
    if (!title || !date) return res.status(400).json({ message: 'Title and date are required' });

    const newEv = new Event({
      title,
      typeBadge: typeBadge || 'WORKSHOP',
      date,
      time: time || '10:00 AM',
      location: location || 'Main Auditorium',
      description: description || '',
      maxCapacity: Number(maxCapacity) || 100,
      image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
      registeredUsers: [],
      creator: req.user ? req.user._id : undefined
    });
    const saved = await newEv.save();
    res.status(201).json({
      id: saved._id.toString(),
      title: saved.title,
      typeBadge: saved.typeBadge,
      date: saved.date,
      time: saved.time,
      location: saved.location,
      description: saved.description,
      registeredCount: 0,
      maxCapacity: saved.maxCapacity,
      image: saved.image
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/events/:id', protect, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Event not found' });

    if (req.body.title) ev.title = req.body.title;
    if (req.body.typeBadge) ev.typeBadge = req.body.typeBadge;
    if (req.body.date) ev.date = req.body.date;
    if (req.body.time) ev.time = req.body.time;
    if (req.body.location) ev.location = req.body.location;
    if (req.body.description !== undefined) ev.description = req.body.description;
    if (req.body.maxCapacity !== undefined) ev.maxCapacity = Number(req.body.maxCapacity);

    await ev.save();
    res.json({
      id: ev._id.toString(),
      title: ev.title,
      typeBadge: ev.typeBadge,
      date: ev.date,
      time: ev.time,
      location: ev.location,
      description: ev.description,
      registeredCount: ev.registeredUsers ? ev.registeredUsers.length : (ev.registeredCount || 0),
      maxCapacity: ev.maxCapacity,
      image: ev.image
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/events/:id', protect, async (req, res) => {
  try {
    const ev = await Event.findByIdAndDelete(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Event not found' });
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 6. COMMUNITY / CLUB MANAGEMENT
// ==========================================
router.get('/communities', protect, async (req, res) => {
  try {
    let communities = await Community.find().sort({ createdAt: -1 });
    // Seed default if collection is empty
    if (communities.length === 0) {
      communities = await Community.create([
        {
          name: 'Machine Learning Club',
          description: 'University research and project community for AI enthusiasts.',
          category: 'Technology',
          leaderName: 'Dr. Saifur Rahman',
          leaderEmail: 's.rahman@university.edu',
          membersCount: 142,
          status: 'Approved'
        },
        {
          name: 'Robotics & Automation Society',
          description: 'Hands-on embedded robotics and hardware workshops.',
          category: 'Technology',
          leaderName: 'Prof. Robert Davis',
          leaderEmail: 'r.davis@university.edu',
          membersCount: 88,
          status: 'Approved'
        },
        {
          name: 'University Debating Club',
          description: 'Weekly parliamentary debate and public speaking rounds.',
          category: 'Cultural',
          leaderName: 'Sarah Jenkins',
          leaderEmail: 'sarah.j@university.edu',
          membersCount: 65,
          status: 'Approved'
        }
      ]);
    }
    res.json(communities.map(c => ({
      id: c._id.toString(),
      name: c.name,
      description: c.description,
      category: c.category,
      leaderName: c.leaderName,
      leaderEmail: c.leaderEmail,
      membersCount: c.membersCount,
      status: c.status
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/communities', protect, async (req, res) => {
  try {
    const { name, description, category, leaderName, leaderEmail } = req.body;
    if (!name) return res.status(400).json({ message: 'Community name is required' });

    const newComm = new Community({
      name,
      description: description || '',
      category: category || 'Academic',
      leaderName: leaderName || 'Student Organizer',
      leaderEmail: leaderEmail || '',
      membersCount: 1,
      status: 'Approved'
    });
    const saved = await newComm.save();
    res.status(201).json({
      id: saved._id.toString(),
      name: saved.name,
      description: saved.description,
      category: saved.category,
      leaderName: saved.leaderName,
      leaderEmail: saved.leaderEmail,
      membersCount: saved.membersCount,
      status: saved.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/communities/:id', protect, async (req, res) => {
  try {
    const comm = await Community.findById(req.params.id);
    if (!comm) return res.status(404).json({ message: 'Community not found' });

    if (req.body.name) comm.name = req.body.name;
    if (req.body.description !== undefined) comm.description = req.body.description;
    if (req.body.category) comm.category = req.body.category;
    if (req.body.leaderName) comm.leaderName = req.body.leaderName;
    if (req.body.status) comm.status = req.body.status;

    await comm.save();
    res.json({
      id: comm._id.toString(),
      name: comm.name,
      description: comm.description,
      category: comm.category,
      leaderName: comm.leaderName,
      leaderEmail: comm.leaderEmail,
      membersCount: comm.membersCount,
      status: comm.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/communities/:id', protect, async (req, res) => {
  try {
    const comm = await Community.findByIdAndDelete(req.params.id);
    if (!comm) return res.status(404).json({ message: 'Community not found' });
    res.json({ success: true, message: 'Community removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 7. ANNOUNCEMENTS
// ==========================================
router.get('/announcements', protect, async (req, res) => {
  try {
    let announcements = await Announcement.find().sort({ createdAt: -1 });
    if (announcements.length === 0) {
      announcements = await Announcement.create([
        {
          title: 'Final Examination Schedule Published',
          content: 'The official schedule for Fall 2026 final exams is now uploaded. Please check your student portal for your hall allocation.',
          category: 'Academic',
          targetAudience: 'Students',
          priority: 'High',
          authorName: 'Office of the Registrar',
          status: 'Published',
          sentNotification: true
        },
        {
          title: 'Campus IT Infrastructure Maintenance',
          content: 'Campus WiFi and core lab servers will undergo scheduled maintenance on Saturday between 2:00 AM and 6:00 AM.',
          category: 'General',
          targetAudience: 'All',
          priority: 'Normal',
          authorName: 'Campus IT Operations',
          status: 'Published',
          sentNotification: true
        }
      ]);
    }
    res.json(announcements.map(a => ({
      id: a._id.toString(),
      title: a.title,
      content: a.content,
      category: a.category,
      targetAudience: a.targetAudience,
      priority: a.priority,
      authorName: a.authorName,
      status: a.status,
      createdAt: a.createdAt
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/announcements', protect, async (req, res) => {
  try {
    const { title, content, category, targetAudience, priority, sendNotificationToStudents } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const newAnn = new Announcement({
      title,
      content,
      category: category || 'General',
      targetAudience: targetAudience || 'All',
      priority: priority || 'Normal',
      authorName: req.user ? req.user.name : 'University Administration',
      status: 'Published',
      sentNotification: !!sendNotificationToStudents
    });

    const saved = await newAnn.save();

    // Broadcast notification to users
    if (sendNotificationToStudents) {
      try {
        const users = await User.find().select('_id');
        const notifs = users.map(u => ({
          userId: u._id,
          title: `📢 ${title}`,
          description: content.substring(0, 100),
          category: 'academic',
          isRead: false,
          type: 'system',
          actionButton: { label: 'View Notice', viewTarget: 'communities' }
        }));
        if (notifs.length > 0) {
          await Notification.insertMany(notifs);
        }
      } catch (nErr) {
        console.error('Failed to broadcast notification:', nErr);
      }
    }

    res.status(201).json({
      id: saved._id.toString(),
      title: saved.title,
      content: saved.content,
      category: saved.category,
      targetAudience: saved.targetAudience,
      priority: saved.priority,
      authorName: saved.authorName,
      status: saved.status,
      createdAt: saved.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/announcements/:id', protect, async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ message: 'Announcement not found' });

    if (req.body.title) ann.title = req.body.title;
    if (req.body.content) ann.content = req.body.content;
    if (req.body.category) ann.category = req.body.category;
    if (req.body.targetAudience) ann.targetAudience = req.body.targetAudience;
    if (req.body.priority) ann.priority = req.body.priority;

    await ann.save();
    res.json({
      id: ann._id.toString(),
      title: ann.title,
      content: ann.content,
      category: ann.category,
      targetAudience: ann.targetAudience,
      priority: ann.priority,
      authorName: ann.authorName,
      status: ann.status,
      createdAt: ann.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/announcements/:id', protect, async (req, res) => {
  try {
    const ann = await Announcement.findByIdAndDelete(req.params.id);
    if (!ann) return res.status(404).json({ message: 'Announcement not found' });
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 8. NOTIFICATIONS
// ==========================================
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(30);
    res.json(notifications.map(n => ({
      id: n._id.toString(),
      title: n.title,
      description: n.description,
      category: n.category,
      type: n.type,
      createdAt: n.createdAt
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/notifications', protect, async (req, res) => {
  try {
    const { title, description, category, targetRole } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const query = {};
    if (targetRole && targetRole !== 'ALL') {
      query.role = targetRole;
    }

    const recipients = await User.find(query).select('_id');
    const notifs = recipients.map(u => ({
      userId: u._id,
      title,
      description: description || '',
      category: category || 'academic',
      isRead: false,
      type: 'system',
      actionButton: { label: 'Open Home', viewTarget: 'home' }
    }));

    if (notifs.length > 0) {
      await Notification.insertMany(notifs);
    }

    res.status(201).json({
      success: true,
      recipientsCount: notifs.length,
      message: `Notification dispatched to ${notifs.length} users`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 9. SETTINGS
// ==========================================
router.get('/settings', protect, async (req, res) => {
  try {
    res.json(platformSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/settings', protect, async (req, res) => {
  try {
    platformSettings = {
      ...platformSettings,
      ...req.body
    };
    res.json({
      success: true,
      message: 'Platform settings saved successfully',
      settings: platformSettings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
