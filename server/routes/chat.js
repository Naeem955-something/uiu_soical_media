const express = require('express');
const router = express.Router();
const ChatConversation = require('../models/ChatConversation');
const { protect, optionalAuth } = require('../middleware/auth');

function formatConversation(conv, userId) {
  const obj = conv.toObject ? conv.toObject() : conv;
  return {
    id: obj._id.toString(),
    name: obj.name,
    type: obj.type,
    unreadCount: obj.unreadCount || 0,
    lastMessage: obj.lastMessage || '',
    lastMessageTime: obj.lastMessageTime || '',
    avatarText: obj.avatarText || undefined,
    avatarColor: obj.avatarColor || undefined,
    avatarImage: obj.avatarImage || undefined,
    onlineStatus: obj.onlineStatus || false,
    membersOnline: obj.membersOnline || 0,
    topic: obj.topic || undefined,
    aboutText: obj.aboutText || undefined,
    membersList: obj.membersList || [],
    sharedFiles: obj.sharedFiles || [],
    recentMedia: obj.recentMedia || [],
    messages: (obj.messages || []).map(m => ({
      id: m._id ? m._id.toString() : `m-${Date.now()}`,
      senderId: m.senderId || '',
      senderName: m.senderName || '',
      senderAvatar: m.senderAvatar || '',
      content: m.content || '',
      timestamp: m.timestamp || '',
      isCurrentUser: userId ? m.senderId === userId.toString() : false,
      reactions: m.reactions || undefined,
      attachment: m.attachment || undefined,
      seenBy: m.seenBy || undefined
    }))
  };
}

// GET /api/chat
router.get('/', optionalAuth, async (req, res) => {
  try {
    let chats = await ChatConversation.find().sort({ createdAt: -1 });
    if (chats.length === 0) {
      chats = await ChatConversation.create([
        {
          name: 'CSE Senior Design Project',
          type: 'GROUP',
          topic: 'Autonomous Drone Navigation System',
          unreadCount: 0,
          lastMessage: 'Alex: Pushed the latest ROS2 packages to GitHub repo',
          lastMessageTime: '10:45 AM',
          avatarText: 'SD',
          avatarColor: '#2563EB',
          onlineStatus: true,
          membersOnline: 4,
          aboutText: 'Capstone design team for autonomous aerial drone obstacle avoidance.',
          membersList: [
            { name: 'Student User', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', role: 'Team Lead', isOnline: true },
            { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', role: 'Hardware Specialist', isOnline: true },
            { name: 'Fahima Tonni', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100', role: 'ML Researcher', isOnline: false }
          ],
          messages: [
            {
              senderId: 'alex-1',
              senderName: 'Alex Rivera',
              senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
              content: 'Has everyone checked the new waypoint calculation script?',
              timestamp: '10:30 AM',
              isCurrentUser: false
            },
            {
              senderId: 'alex-1',
              senderName: 'Alex Rivera',
              senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
              content: 'Pushed the latest ROS2 packages to GitHub repo',
              timestamp: '10:45 AM',
              isCurrentUser: false
            }
          ]
        },
        {
          name: 'Dr. Saifur Rahman',
          type: 'DIRECT',
          topic: 'Machine Learning Club Advising',
          unreadCount: 0,
          lastMessage: 'Dr. Saifur: Please bring the project proposal draft to tomorrow\'s meeting.',
          lastMessageTime: 'Yesterday',
          avatarImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          onlineStatus: true,
          membersOnline: 1,
          aboutText: 'Associate Professor & Faculty Advisor',
          messages: [
            {
              senderId: 'faculty-1',
              senderName: 'Dr. Saifur Rahman',
              senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
              content: 'Please bring the project proposal draft to tomorrow\'s meeting.',
              timestamp: 'Yesterday 3:15 PM',
              isCurrentUser: false
            }
          ]
        }
      ]);
    }
    const userId = req.user ? req.user._id : null;
    res.json(chats.map(c => formatConversation(c, userId)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/chat - create new conversation (Direct or Group) or send message
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, type, topic, initialMessage, senderName, senderEmail, recipientName, recipientAvatar, membersList, avatarColor, avatarText, aboutText } = req.body;
    const authorName = req.user ? req.user.name : (senderName || 'Anonymous Student');
    const authorAvatar = req.user ? req.user.avatar : '';
    const authorId = req.user ? req.user._id.toString() : `u-${Date.now()}`;

    const isGroup = type === 'GROUP';
    const convName = name || (isGroup ? 'New Study Group' : (recipientName ? `Chat with ${recipientName}` : `Message from ${authorName}`));
    
    // Prepare members for group
    let finalMembers = Array.isArray(membersList) ? [...membersList] : [];
    if (isGroup) {
      const creatorAlreadyIn = finalMembers.some(m => m.name === authorName);
      if (!creatorAlreadyIn) {
        finalMembers.unshift({
          name: authorName,
          avatar: authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          role: 'Admin',
          isOnline: true
        });
      }
    }

    const defaultAvatarText = isGroup 
      ? (convName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'GP')
      : authorName.substring(0, 2).toUpperCase();

    const newChat = new ChatConversation({
      name: convName,
      type: isGroup ? 'GROUP' : 'DIRECT',
      topic: topic || (isGroup ? 'Project & Study Discussion' : 'Direct Message'),
      unreadCount: 0,
      lastMessage: initialMessage ? `${authorName.split(' ')[0]}: ${initialMessage}` : (isGroup ? `${authorName.split(' ')[0]} created group "${convName}"` : 'Conversation initiated'),
      lastMessageTime: 'Just now',
      avatarText: avatarText || defaultAvatarText,
      avatarColor: avatarColor || (isGroup ? '#2563EB' : undefined),
      avatarImage: recipientAvatar || '',
      onlineStatus: true,
      membersOnline: isGroup ? finalMembers.length : 1,
      aboutText: aboutText || (isGroup ? `Collaborative university group for ${convName}.` : `Direct conversation started from profile.`),
      membersList: finalMembers,
      messages: initialMessage ? [{
        senderId: authorId,
        senderName: authorName,
        senderAvatar: authorAvatar,
        content: senderEmail ? `${initialMessage}\n\n[Contact Email: ${senderEmail}]` : initialMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCurrentUser: true
      }] : (isGroup ? [{
        senderId: 'system',
        senderName: 'System',
        senderAvatar: '',
        content: `🎉 ${authorName} created the group "${convName}". Welcome all members!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCurrentUser: false
      }] : [])
    });

    const saved = await newChat.save();

    // Create a notification for the recipient/group in the system
    try {
      const Notification = require('../models/Notification');
      const User = require('../models/User');
      const targetUser = req.user || (await User.findOne());
      if (targetUser) {
        await Notification.create({
          userId: targetUser._id,
          title: isGroup ? `New group created: "${convName}"` : `New message from ${authorName}`,
          description: initialMessage ? `"${initialMessage.substring(0, 80)}${initialMessage.length > 80 ? '...' : ''}"` : (isGroup ? `You created group "${convName}".` : 'Sent you a direct message.'),
          category: 'academic',
          isRead: false,
          type: 'chat',
          actionButton: { label: 'View Chat', viewTarget: 'chat' }
        });
      }
    } catch (notifErr) {
      console.error('Notification creation error:', notifErr);
    }

    res.status(201).json(formatConversation(saved, authorId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/chat/:id/members - add members to existing group
router.post('/:id/members', protect, async (req, res) => {
  try {
    const chat = await ChatConversation.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    const newMembers = req.body.members || (req.body.member ? [req.body.member] : []);
    if (!newMembers.length) {
      return res.status(400).json({ message: 'No members provided to add' });
    }

    const existingNames = new Set((chat.membersList || []).map(m => m.name));
    const addedNames = [];

    newMembers.forEach(m => {
      if (!existingNames.has(m.name)) {
        chat.membersList.push({
          name: m.name,
          avatar: m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          role: m.role || 'Member',
          isOnline: true
        });
        addedNames.push(m.name);
      }
    });

    if (addedNames.length > 0) {
      chat.membersOnline = (chat.membersOnline || 0) + addedNames.length;
      const sysMsg = {
        senderId: 'system',
        senderName: 'System',
        senderAvatar: '',
        content: `👋 ${req.user.name} added ${addedNames.join(', ')} to the group.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCurrentUser: false
      };
      chat.messages.push(sysMsg);
      chat.lastMessage = `Added ${addedNames.join(', ')}`;
      chat.lastMessageTime = 'Just now';
    }

    await chat.save();
    res.json(formatConversation(chat, req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/chat/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const chat = await ChatConversation.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(formatConversation(chat, req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/chat/:id/messages
router.post('/:id/messages', protect, async (req, res) => {
  try {
    const chat = await ChatConversation.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    const message = {
      senderId: req.user._id.toString(),
      senderName: req.user.name,
      senderAvatar: req.user.avatar,
      content: req.body.content || '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true
    };
    if (req.body.attachment) {
      message.attachment = req.body.attachment;
    }
    chat.messages.push(message);
    chat.lastMessage = `${req.user.name.split(' ')[0]}: ${req.body.content || 'Sent an attachment'}`;
    chat.lastMessageTime = 'Just now';
    await chat.save();
    res.status(201).json(formatConversation(chat, req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
