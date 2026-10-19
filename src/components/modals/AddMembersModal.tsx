import React, { useState, useEffect } from 'react';
import { X, UserPlus, Search, Check, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ChatConversation } from '../../types';

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

interface AddMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: ChatConversation;
}

export const AddMembersModal: React.FC<AddMembersModalProps> = ({ isOpen, onClose, chat }) => {
  const { addGroupMembers, showToast } = useApp();

  const [campusUsers, setCampusUsers] = useState<CampusUserOption[]>(FALLBACK_USERS);
  const [selectedToAdd, setSelectedToAdd] = useState<Array<{ name: string; avatar: string; role?: string }>>([]);
  const [search, setSearch] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getCampusUsers()
        .then((users: CampusUserOption[]) => {
          if (Array.isArray(users) && users.length > 0) {
            setCampusUsers(users);
          }
        })
        .catch(() => {
          setCampusUsers(FALLBACK_USERS);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const existingNames = new Set((chat.membersList || []).map(m => m.name.toLowerCase()));

  const toggleSelect = (u: CampusUserOption) => {
    const isSelected = selectedToAdd.some(m => m.name.toLowerCase() === u.name.toLowerCase());
    if (isSelected) {
      setSelectedToAdd(prev => prev.filter(m => m.name.toLowerCase() !== u.name.toLowerCase()));
    } else {
      setSelectedToAdd(prev => [
        ...prev,
        {
          name: u.name,
          avatar: u.avatar,
          role: u.role === 'FACULTY' ? 'Advisor' : 'Member'
        }
      ]);
    }
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (existingNames.has(trimmed.toLowerCase())) {
      showToast(`${trimmed} is already in this group`, 'info');
      return;
    }
    if (selectedToAdd.some(m => m.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`${trimmed} is already selected`, 'info');
      return;
    }
    setSelectedToAdd(prev => [
      ...prev,
      {
        name: trimmed,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        role: 'Member'
      }
    ]);
    setCustomInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedToAdd.length === 0) {
      showToast('Please select at least one member to add', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await addGroupMembers(chat.id, selectedToAdd);
      setSelectedToAdd([]);
      onClose();
    } catch {
      // Error handled in addGroupMembers
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableUsers = campusUsers.filter(u => !existingNames.has(u.name.toLowerCase()));
  const filteredUsers = availableUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.department && u.department.toLowerCase().includes(search.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 520 }}
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
              <UserPlus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Add Members</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Add more collaborators to <strong>{chat.name}</strong>
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
          <div className="modal-body" style={{ maxHeight: '68vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Current Members Pill Header */}
            <div style={{ background: 'var(--bg-page)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.813rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Existing Members</span>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{chat.membersList?.length || 1} members</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(chat.membersList || []).map(m => (
                  <span 
                    key={m.name} 
                    style={{ 
                      fontSize: '0.72rem', 
                      background: 'white', 
                      border: '1px solid var(--border-color)', 
                      padding: '2px 8px', 
                      borderRadius: 999,
                      color: 'var(--text-muted)'
                    }}
                  >
                    {m.name} {m.role === 'Admin' && '(Admin)'}
                  </span>
                ))}
              </div>
            </div>

            {/* Selected to Add Chips */}
            {selectedToAdd.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                  Selected to Add ({selectedToAdd.length})
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedToAdd.map(m => (
                    <span 
                      key={m.name}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--primary-light)',
                        border: '1px solid var(--primary-border)',
                        padding: '4px 8px',
                        borderRadius: 999,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--primary)'
                      }}
                    >
                      <span>{m.name}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedToAdd(prev => prev.filter(x => x.name !== m.name))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 0 }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Custom invite input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                Invite by Name or Email
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="text"
                  placeholder="Enter student or faculty name / email..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustom();
                    }
                  }}
                  style={{ flex: 1, fontSize: '0.813rem' }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddCustom}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 12px', fontSize: '0.813rem' }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {/* Directory Search & List */}
            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>
                Select from Campus Directory
              </label>
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-light)' }} />
                <input 
                  type="text"
                  placeholder="Filter by name or department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: '100%', paddingLeft: 32, fontSize: '0.813rem', paddingBlock: 6 }}
                />
              </div>

              <div style={{ 
                maxHeight: 180, 
                overflowY: 'auto', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-page)',
                padding: '4px'
              }}>
                {filteredUsers.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {availableUsers.length === 0 
                      ? 'All available campus users are already in this group!' 
                      : `No users matching "${search}"`}
                  </div>
                ) : (
                  filteredUsers.map(u => {
                    const isSelected = selectedToAdd.some(m => m.name.toLowerCase() === u.name.toLowerCase());
                    return (
                      <div
                        key={u.id}
                        onClick={() => toggleSelect(u)}
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
                              <Check size={12} /> Selected
                            </>
                          ) : (
                            <>
                              <Plus size={12} /> Select
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
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
              disabled={isSubmitting || selectedToAdd.length === 0}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              {isSubmitting ? (
                'Adding Members...'
              ) : (
                <>
                  <UserPlus size={16} /> Add {selectedToAdd.length > 0 ? `(${selectedToAdd.length})` : ''} Members
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
