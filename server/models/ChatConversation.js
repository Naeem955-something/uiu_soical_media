const mongoose = require('mongoose');

const chatConversationSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  type: { type: String, enum: ['GROUP', 'DIRECT'], default: 'DIRECT' },
  unreadCount: { type: Number, default: 0 },
  lastMessage: { type: String, default: '' },
  lastMessageTime: { type: String, default: '' },
  avatarText: { type: String, default: '' },
  avatarColor: { type: String, default: '' },
  avatarImage: { type: String, default: '' },
  onlineStatus: { type: Boolean, default: false },
  membersOnline: { type: Number, default: 0 },
  topic: { type: String, default: '' },
  aboutText: { type: String, default: '' },
  membersList: [mongoose.Schema.Types.Mixed],
  sharedFiles: [mongoose.Schema.Types.Mixed],
  recentMedia: [{ type: String }],
  messages: [{
    senderId: { type: String, default: '' },
    senderName: { type: String, default: '' },
    senderAvatar: { type: String, default: '' },
    content: { type: String, default: '' },
    timestamp: { type: String, default: '' },
    isCurrentUser: { type: Boolean, default: false },
    reactions: mongoose.Schema.Types.Mixed,
    attachment: mongoose.Schema.Types.Mixed,
    seenBy: { type: String, default: '' }
  }]
}, { timestamps: true });

const ChatConversation = mongoose.model('ChatConversation', chatConversationSchema);
module.exports = ChatConversation;
