import React, { useState, useEffect } from 'react';
import { X, Users, Search, Check, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

interface CampusUserOption {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: string;
  department?: string;
}

const FALLBACK_USERS: CampusUserOption[] = [
  {
    id: 'u-fb-1',
    name: 'Fahima Tonni',
    email: 'fahima.tonni@university.edu',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    role: 'STUDENT',
    department: 'Computer Science'
  },
  {
    id: 'u-fb-2',
    name: 'Alex Rivera',
    email: 'alex.rivera@university.edu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'STUDENT',
    department: 'Electrical Engineering'
  },
  {
    id: 'u-fb-3',
    name: 'Sarah Jenkins',
    email: 'sarah.j@university.edu',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: 'STUDENT',
    department: 'Software Engineering'
  },
  {
    id: 'u-fb-4',
    name: 'Michael Chang',
    email: 'm.chang@university.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'STUDENT',
    department: 'Data Science'
  },
  {
    id: 'u-fb-5',
    name: 'Prof. Robert Davis',
    email: 'r.davis@university.edu',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    role: 'FACULTY',
    department: 'Computer Science'
  }
];

const PRESET_COLORS = [
  '#2563EB', // Blue
  '#7C3AED', // Purple
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Red
  '#DB2777', // Pink
  '#0891B2', // Cyan
  '#4F46E5', // Indigo
];

const PRESET_TOPICS = [
  'Project & Study Discussion',
  'Senior Thesis & Capstone',
  'Web Development Team',
  'AI & Machine Learning Group',
  'Exam Preparation & Review',
  'Campus Club & Activities',
  'Hackathon Sprint Team'
];

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
  const { user, createGroup, showToast } = useApp();

  const [groupName, setGroupName] = useState('');
  const [topic, setTopic] = useState('Project & Study Discussion');
  const [customTopic, setCustomTopic] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [avatarColor, setAvatarColor] = useState('#2563EB');
  const [initialMessage, setInitialMessage] = useState('');

  const [campusUsers, setCampusUsers] = useState<CampusUserOption[]>(FALLBACK_USERS);
  const [selectedMembers, setSelectedMembers] = useState<Array<{ name: string; avatar: string; role?: string }>>([]);
  const [userSearch, setUserSearch] = useState('');
  const [customMemberInput, setCustomMemberInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch campus users when modal opens
  useEffect(() => {
    if (isOpen) {
      api.getCampusUsers()
        .then((users: CampusUserOption[]) => {
          if (Array.isArray(users) && users.length > 0) {
            // Filter out current user from the list
            const currentUserId = user?.id;
            const currentUserName = user?.name?.toLowerCase();
            const filtered = users.filter(u => u.id !== currentUserId && u.name.toLowerCase() !== currentUserName);
            setCampusUsers(filtered.length > 0 ? filtered : FALLBACK_USERS);
          }
        })
        .catch(() => {
          setCampusUsers(FALLBACK_USERS);
        });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const initials = groupName.trim()
    ? groupName.trim().split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase()
    : 'GP';

  const toggleMember = (u: CampusUserOption) => {
    const alreadySelected = selectedMembers.some(m => m.name.toLowerCase() === u.name.toLowerCase());
    if (alreadySelected) {
      setSelectedMembers(prev => prev.filter(m => m.name.toLowerCase() !== u.name.toLowerCase()));
    } else {
      setSelectedMembers(prev => [
        ...prev,
        {
          name: u.name,
          avatar: u.avatar,
          role: u.role === 'FACULTY' ? 'Advisor' : 'Member'
        }
      ]);
    }
  };

  const handleAddCustomMember = () => {
    const trimmed = customMemberInput.trim();
    if (!trimmed) return;
    if (selectedMembers.some(m => m.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`${trimmed} is already selected`, 'info');
      return;
    }
    setSelectedMembers(prev => [
      ...prev,
      {
        name: trimmed,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        role: 'Member'
      }
    ]);
    setCustomMemberInput('');
  };

  const handleRemoveMember = (name: string) => {
    setSelectedMembers(prev => prev.filter(m => m.name !== name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      showToast('Please enter a group name', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalTopic = topic === 'Custom' ? (customTopic.trim() || 'Custom Group') : topic;
      await createGroup({
        name: groupName.trim(),
        topic: finalTopic,
        aboutText: aboutText.trim() || `Collaborative university group for ${groupName.trim()}.`,
        avatarColor,
        members: selectedMembers,
        initialMessage: initialMessage.trim() || undefined
      });

      // Reset and close
      setGroupName('');
      setTopic('Project & Study Discussion');
      setCustomTopic('');
      setAboutText('');
      setSelectedMembers([]);
      setInitialMessage('');
      onClose();
    } catch {
      // Error handled by createGroup toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = campusUsers.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.department && u.department.toLowerCase().includes(userSearch.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 580 }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Create New Group</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Collaborate with fellow students and faculty on projects & coursework
              </p>
            </div>
          </div>
          <button 
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
            
            {/* Top Row: Group Preview & Name */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div 
                  style={{ 
                    width: 58, 
                    height: 58, 
                    borderRadius: '50%', 
                    backgroundColor: avatarColor, 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '1.25rem', 
                    fontWeight: 800,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  {initials}
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 600 }}>Badge Preview</span>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                  Group Name <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. CS401 Machine Learning Study Group"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                  style={{ width: '100%', fontSize: '0.9rem' }}
                  autoFocus
                />
              </div>
            </div>

            {/* Avatar Color Picker */}
            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>
                Group Color Theme
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAvatarColor(color)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: avatarColor === color ? '3px solid #111827' : '2px solid white',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      transition: 'transform 0.15s ease'
                    }}
                    title={color}
                  >
                    {avatarColor === color && <Check size={14} strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic / Category */}
            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                Category / Topic
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{ width: '100%', fontSize: '0.875rem' }}
              >
                {PRESET_TOPICS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
                <option value="Custom">+ Custom Topic...</option>
              </select>
              {topic === 'Custom' && (
                <input 
                  type="text"
                  placeholder="Type custom topic / subject..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  style={{ width: '100%', marginTop: 8, fontSize: '0.875rem' }}
                />
              )}
            </div>

            {/* Description / About */}
            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                Description / Purpose
              </label>
              <textarea
                placeholder="What is this group project or study room for?"
                rows={2}
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                style={{ width: '100%', fontSize: '0.875rem', resize: 'vertical' }}
              />
            </div>

            {/* Members Section */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Add Campus Members ({selectedMembers.length + 1} total)
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  You are automatically assigned as Admin
                </span>
              </div>

              {/* Selected Members Chips */}
              {selectedMembers.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {selectedMembers.map(m => (
                    <span 
                      key={m.name}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        padding: '4px 8px',
                        borderRadius: 999,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-main)'
                      }}
                    >
                      <img 
                        src={m.avatar} 
                        alt={m.name} 
                        style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} 
                      />
                      <span>{m.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.name)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: 0 }}
                        title="Remove"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Quick invite custom name input */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input 
                  type="text"
                  placeholder="Or invite student by name / email..."
                  value={customMemberInput}
                  onChange={(e) => setCustomMemberInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomMember();
                    }
                  }}
                  style={{ flex: 1, fontSize: '0.813rem' }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddCustomMember}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 12px', fontSize: '0.813rem' }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {/* Campus Directory Search */}
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-light)' }} />
                <input 
                  type="text"
                  placeholder="Search campus directory..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ width: '100%', paddingLeft: 32, fontSize: '0.813rem', paddingBlock: 6 }}
                />
              </div>

              {/* Directory List */}
              <div style={{ 
                maxHeight: 160, 
                overflowY: 'auto', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-page)',
                padding: '4px'
              }}>
                {filteredUsers.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    No users matching "{userSearch}"
                  </div>
                ) : (
                  filteredUsers.map(u => {
                    const isSelected = selectedMembers.some(m => m.name.toLowerCase() === u.name.toLowerCase());
                    return (
                      <div
                        key={u.id}
                        onClick={() => toggleMember(u)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          background: isSelected ? 'var(--primary-light)' : 'transparent',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img 
                            src={u.avatar} 
                            alt={u.name} 
                            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} 
                          />
                          <div>
                            <div style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-main)' }}>
                              {u.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {u.department || u.email}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          style={{
                            background: isSelected ? 'var(--primary)' : 'white',
                            color: isSelected ? 'white' : 'var(--text-main)',
                            border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                            borderRadius: 'var(--radius-sm)',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {isSelected ? (
                            <>
                              <Check size={12} /> Added
                            </>
                          ) : (
                            <>
                              <Plus size={12} /> Add
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Optional welcome message */}
            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                Welcome Message (Optional)
              </label>
              <input 
                type="text" 
                placeholder="Say hello to everyone in the new group..."
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                style={{ width: '100%', fontSize: '0.875rem' }}
              />
            </div>

          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting || !groupName.trim()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              {isSubmitting ? (
                'Creating Group...'
              ) : (
                <>
                  <Users size={16} /> Create Group
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
