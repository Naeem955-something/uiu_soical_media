import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  Download, 
  Send, 
  Plus, 
  Smile, 
  UserPlus, 
  CheckCheck,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CreateGroupModal } from '../components/modals/CreateGroupModal';
import { AddMembersModal } from '../components/modals/AddMembersModal';
import type { ChatMessage, ChatConversation } from '../types';
import {
  readFileAsDataURL,
  triggerDownload,
  sanitizeFileName,
  inferExtension,
  type FilePickResult
} from '../utils/fileUtils';

export const ChatView: React.FC = () => {
  const { 
    conversations, 
    activeChatId, 
    setActiveChatId, 
    typingUsers,
    sendMessage, 
    showToast 
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentChat = conversations.find(c => c.id === activeChatId) || conversations[0];
  const activeTypingUser = currentChat ? typingUsers[currentChat.id] : undefined;
  const messagesCount = currentChat?.messages?.length || 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesCount, activeTypingUser]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentChat) return;

    sendMessage(currentChat.id, inputMessage.trim());
    setInputMessage('');
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentChat) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    try {
      const picked: FilePickResult = await readFileAsDataURL(file);
      const isImg = /^image\//.test(picked.mimeType || '') || ['PNG', 'JPG', 'GIF', 'WEBP', 'SVG'].includes(picked.format);
      const isPdf = picked.format === 'PDF' || picked.mimeType === 'application/pdf';
      const attType: 'pdf' | 'doc' | 'image' = isImg ? 'image' : isPdf ? 'pdf' : 'doc';
      sendMessage(currentChat.id, '', {
        name: picked.name,
        size: `${picked.sizeLabel} • ${picked.format}`,
        type: attType,
        mimeType: picked.mimeType,
        extension: picked.extension,
        fileData: picked.dataUrl
      });
      showToast('Document attached and sent!', 'success');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadAttachment = (att: NonNullable<ChatMessage['attachment']>) => {
    const ext = att.extension || inferExtension(att.name, '.bin');
    const fileName = sanitizeFileName(att.name, `chat-attachment${ext}`);
    if (att.fileData) {
      triggerDownload(fileName, att.fileData, { asBase64: true, mimeType: att.mimeType || undefined });
    } else {
      triggerDownload(fileName, `File: ${att.name}\nSize: ${att.size}`, { mimeType: 'text/plain' });
    }
    showToast(`Downloaded ${att.name}`, 'success');
  };

  const downloadSharedFile = (file: NonNullable<ChatConversation['sharedFiles']>[number]) => {
    const ext = file.extension || inferExtension(file.name, '.bin');
    const fileName = sanitizeFileName(file.name, `shared-file${ext}`);
    if (file.fileData) {
      triggerDownload(fileName, file.fileData, { asBase64: true, mimeType: file.mimeType || undefined });
    } else {
      triggerDownload(fileName, `Shared file: ${file.name}\nShared on: ${file.date}\nSize: ${file.size}`, { mimeType: 'text/plain' });
    }
    showToast(`Downloaded ${file.name}`, 'success');
  };

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(filterSearch.toLowerCase())
  );

  const groupChats = filteredConversations.filter(c => c.type === 'GROUP');
  const directChats = filteredConversations.filter(c => c.type === 'DIRECT');

  return (
    <div className="chat-window-container">
      {/* 1. Left Sidebar: Channels & DMs */}
      <div className="chat-sidebar-left">
        <div className="chat-search-header">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-light)' }} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              style={{ paddingLeft: 36, fontSize: '0.875rem' }} 
            />
          </div>
        </div>

        <div className="chat-conversations-scroll">
          {/* Group Projects */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 6, marginBottom: 6 }}>
            <div className="chat-section-label" style={{ margin: 0 }}>Group Projects</div>
            <button 
              type="button"
              onClick={() => setIsCreateGroupModalOpen(true)}
              style={{
                background: 'var(--primary-light)',
                border: '1px solid var(--primary-border)',
                color: 'var(--primary)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.15s ease'
              }}
              title="Create a new study or project group"
            >
              <Plus size={13} strokeWidth={2.5} /> Create Group
            </button>
          </div>

          {groupChats.length === 0 ? (
            <div style={{ padding: '12px 14px', margin: '4px 0 10px 0', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>No group projects yet</p>
              <button 
                type="button"
                className="btn-primary"
                onClick={() => setIsCreateGroupModalOpen(true)}
                style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={13} /> Create Group
              </button>
            </div>
          ) : (
            groupChats.map(conv => (
              <div 
                key={conv.id}
                className={`conversation-item ${conv.id === activeChatId ? 'active' : ''}`}
                onClick={() => setActiveChatId(conv.id)}
              >
                <div 
                  className="conversation-avatar-icon" 
                  style={{ backgroundColor: conv.avatarColor || '#2563EB' }}
                >
                  {conv.avatarText || 'GP'}
                </div>
                <div className="conv-meta-block">
                  <div className="conv-title-row">
                    <span className="conv-name">{conv.name}</span>
                    <span className="conv-time">{conv.lastMessageTime}</span>
                  </div>
                  <div className="conv-preview">{conv.lastMessage}</div>
                </div>
              </div>
            ))
          )}

          {/* Direct Messages */}
          <div className="chat-section-label" style={{ marginTop: 14 }}>Direct Messages</div>
          {directChats.map(conv => (
            <div 
              key={conv.id}
              className={`conversation-item ${conv.id === activeChatId ? 'active' : ''}`}
              onClick={() => setActiveChatId(conv.id)}
            >
              <div style={{ position: 'relative' }}>
                <img 
                  src={conv.avatarImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'} 
                  alt={conv.name} 
                  style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} 
                />
                <span 
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: conv.onlineStatus ? '#10B981' : '#9CA3AF',
                    border: '2px solid white'
                  }} 
                />
              </div>
              <div className="conv-meta-block">
                <div className="conv-title-row">
                  <span className="conv-name">{conv.name}</span>
                  <span className="conv-time">{conv.lastMessageTime}</span>
                </div>
                <div className="conv-preview">{conv.lastMessage}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Middle Main Chat Pane & 3. Right Details Panel */}
      {!currentChat ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: 32, textAlign: 'center' }}>
          <div style={{
            width: 58,
            height: 58,
            borderRadius: 16,
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16
          }}>
            <Users size={28} />
          </div>
          <p style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 6, color: 'var(--text-main)' }}>No conversations selected</p>
          <p style={{ fontSize: '0.875rem', maxWidth: 360, marginBottom: 16 }}>
            Create a student group project or start chatting with campus peers to begin collaborating.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsCreateGroupModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}
          >
            <Plus size={16} /> Create Group Project
          </button>
        </div>
      ) : (
        <>
          <div className="chat-main-pane">
        {/* Chat Room Header */}
        <div className="chat-room-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {currentChat.type === 'GROUP' ? (
              <div 
                className="conversation-avatar-icon" 
                style={{ backgroundColor: currentChat.avatarColor || '#2563EB', width: 40, height: 40 }}
              >
                {currentChat.avatarText || 'GP'}
              </div>
            ) : (
              <img 
                src={currentChat.avatarImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'} 
                alt={currentChat.name} 
                style={{ width: 40, height: 40, borderRadius: '50%' }} 
              />
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{currentChat.name}</h3>
                {currentChat.type === 'GROUP' && (
                  <span className="badge badge-student" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>Group</span>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
                {currentChat.membersOnline ? `${currentChat.membersOnline} Members Online` : 'Active Now'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {currentChat.type === 'GROUP' && (
              <button 
                type="button"
                className="btn-secondary"
                onClick={() => setIsAddMemberModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '6px 12px',
                  height: 36,
                  borderRadius: 'var(--radius-sm)'
                }}
                title="Add members to this group"
              >
                <UserPlus size={14} /> Add Member
              </button>
            )}
          </div>
        </div>

        {/* Message Stream */}
        <div className="chat-messages-history">
          <div style={{ textAlign: 'center', margin: '4px 0 16px 0' }}>
            <span style={{ fontSize: '0.688rem', fontWeight: 800, color: 'var(--text-light)', letterSpacing: '0.05em' }}>
              MONDAY, OCTOBER 14
            </span>
          </div>

          {currentChat.messages.map(msg => (
            <div 
              key={msg.id} 
              className={`message-row ${msg.isCurrentUser ? 'mine' : ''}`}
            >
              <img 
                src={msg.senderAvatar} 
                alt={msg.senderName} 
                className="message-avatar" 
              />
              <div className="message-content-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, justifyContent: msg.isCurrentUser ? 'flex-end' : 'flex-start' }}>
                  <span style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {msg.senderName}
                  </span>
                  <span style={{ fontSize: '0.688rem', color: 'var(--text-light)' }}>
                    {msg.timestamp}
                  </span>
                </div>

                {msg.content && (
                  <div className={`message-bubble ${msg.isCurrentUser ? 'mine' : ''}`}>
                    {msg.content}
                  </div>
                )}

                {msg.attachment && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    background: 'white',
                    border: '1px solid var(--border-color)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    marginTop: 6
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.875rem', display: 'block' }}>{msg.attachment.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{msg.attachment.size}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => downloadAttachment(msg.attachment!)}
                      style={{ color: 'var(--primary)' }}
                      aria-label="Download attachment"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                )}

                {msg.reactions && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    {Object.entries(msg.reactions).map(([emoji, count]) => (
                      <span 
                        key={emoji}
                        style={{
                          background: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 999,
                          padding: '2px 8px',
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        {emoji} {count}
                      </span>
                    ))}
                  </div>
                )}

                {msg.seenBy && (
                  <div className="message-meta-footer" style={{ justifyContent: 'flex-end' }}>
                    <CheckCheck size={14} color="#059669" />
                    <span>Seen by {msg.seenBy}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Dynamic Typing Indicator */}
          {currentChat && typingUsers[currentChat.id] && (
            <div className="chat-typing-indicator">
              <div className="chat-typing-dots">
                <span className="chat-typing-dot"></span>
                <span className="chat-typing-dot"></span>
                <span className="chat-typing-dot"></span>
              </div>
              <span>{typingUsers[currentChat.id]} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar */}
        <form onSubmit={handleSendMessage} className="chat-input-bar">
          <input 
            ref={fileInputRef}
            type="file" 
            id="chat-attach-picker"
            onChange={handleFilePick}
            style={{ display: 'none' }}
          />
          <button 
            type="button" 
            className="nav-icon-btn" 
            style={{ width: 36, height: 36 }}
            onClick={handleAttachFile}
            title="Attach File (Document, Image, etc.)"
          >
            <Plus size={20} />
          </button>

          <input 
            type="text" 
            placeholder={`Message #${currentChat.name}...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            style={{ borderRadius: 'var(--radius-full)', background: 'var(--bg-page)' }}
          />

          <button 
            type="button" 
            className="nav-icon-btn"
            style={{ width: 36, height: 36 }}
            onClick={() => setInputMessage(prev => prev + ' 🚀')}
          >
            <Smile size={20} />
          </button>

          <button 
            type="submit" 
            className="btn-primary"
            style={{ width: 42, height: 42, borderRadius: '50%', padding: 0 }}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* 3. Right Details Panel */}
      <div className="chat-details-panel">
        <div style={{ textAlign: 'center', paddingBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
          <div 
            className="conversation-avatar-icon" 
            style={{ 
              backgroundColor: currentChat.avatarColor || '#2563EB', 
              width: 64, 
              height: 64, 
              margin: '0 auto 12px auto',
              fontSize: '1.4rem'
            }}
          >
            {currentChat.avatarText || 'GP'}
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{currentChat.name}</h4>
          <span style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>
            {currentChat.topic || 'Academic Discussion'}
          </span>
        </div>

        {/* About Box */}
        <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-main)' }}>About</span>
            <button style={{ color: '#D97706', fontSize: '0.75rem', fontWeight: 600 }}>Edit</button>
          </div>
          <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {currentChat.aboutText || 'Collaborative university study workspace and channel.'}
          </p>
        </div>

        {/* Members */}
        {currentChat.membersList && (
          <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.813rem', fontWeight: 700 }}>
                Members ({currentChat.membersList.length})
              </span>
              <button 
                type="button"
                style={{ 
                  color: 'var(--primary)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 4,
                  padding: 2
                }} 
                aria-label="Add Member"
                onClick={() => setIsAddMemberModalOpen(true)}
                title="Add members to this group"
              >
                <UserPlus size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentChat.membersList.map(member => (
                <div key={member.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={member.avatar} alt={member.name} style={{ width: 28, height: 28, borderRadius: '50%' }} />
                    <span style={{ fontSize: '0.813rem', fontWeight: 600 }}>{member.name}</span>
                  </div>
                  {member.role && (
                    <span className="badge badge-faculty" style={{ fontSize: '0.65rem' }}>
                      {member.role}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsAddMemberModalOpen(true)}
              style={{
                marginTop: 12,
                width: '100%',
                padding: '6px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                border: '1px solid var(--primary-border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s ease'
              }}
            >
              <UserPlus size={14} /> Add Members
            </button>
          </div>
        )}

        {/* Shared Files */}
        {currentChat.sharedFiles && (
          <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 12 }}>
              Shared Files
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentChat.sharedFiles.map(file => (
                <button
                  key={file.name + file.date}
                  type="button"
                  onClick={() => downloadSharedFile(file)}
                  title={`Download ${file.name}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: '0.813rem',
                    background: 'none',
                    border: 'none',
                    padding: '6px 8px',
                    margin: 0,
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <FileText size={18} color="#D97706" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{file.date} • {file.size}</span>
                  </div>
                  <Download size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Media */}
        {currentChat.recentMedia && (
          <div style={{ paddingTop: 16 }}>
            <span style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 12 }}>
              Recent Media
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {currentChat.recentMedia.map((img, idx) => (
                <img 
                  key={idx} 
                  src={img} 
                  alt="Media thumbnail" 
                  style={{ width: '100%', height: 60, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
        </>
      )}

      {/* Group Modals */}
      <CreateGroupModal 
        isOpen={isCreateGroupModalOpen} 
        onClose={() => setIsCreateGroupModalOpen(false)} 
      />

      {currentChat && (
        <AddMembersModal 
          isOpen={isAddMemberModalOpen} 
          onClose={() => setIsAddMemberModalOpen(false)} 
          chat={currentChat} 
        />
      )}
    </div>
  );
};
