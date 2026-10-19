import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Search, 
  Plus, 
  Send, 
  Edit2, 
  Trash2, 
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

interface AnnouncementRecord {
  id: string;
  title: string;
  content: string;
  category: string;
  targetAudience: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  authorName: string;
  status: string;
  createdAt?: string;
}

export const AdminAnnouncementsTab: React.FC = () => {
  const { showToast } = useApp();

  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [search, setSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementRecord | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('Academic');
  const [formTargetAudience, setFormTargetAudience] = useState('All');
  const [formPriority, setFormPriority] = useState<'Low' | 'Normal' | 'High' | 'Urgent'>('Normal');
  const [formSendNotification, setFormSendNotification] = useState(true);

  const loadAnnouncements = async () => {
    try {
      const data = await api.getAdminAnnouncements();
      if (Array.isArray(data)) {
        setAnnouncements(data);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setEditingAnnouncement(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('Academic');
    setFormTargetAudience('All');
    setFormPriority('Normal');
    setFormSendNotification(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: AnnouncementRecord) => {
    setEditingAnnouncement(a);
    setFormTitle(a.title);
    setFormContent(a.content);
    setFormCategory(a.category);
    setFormTargetAudience(a.targetAudience);
    setFormPriority(a.priority);
    setFormSendNotification(false);
    setIsModalOpen(true);
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formContent) {
      showToast('Title and content are required', 'error');
      return;
    }

    try {
      if (editingAnnouncement) {
        await api.updateAdminAnnouncement(editingAnnouncement.id, {
          title: formTitle,
          content: formContent,
          category: formCategory,
          targetAudience: formTargetAudience,
          priority: formPriority
        });
        showToast('Announcement updated!', 'success');
      } else {
        await api.createAdminAnnouncement({
          title: formTitle,
          content: formContent,
          category: formCategory,
          targetAudience: formTargetAudience,
          priority: formPriority,
          sendNotificationToStudents: formSendNotification
        });
        showToast(
          formSendNotification 
            ? 'Announcement published & notification sent to students!' 
            : 'Announcement published successfully!', 
          'success'
        );
      }
      setIsModalOpen(false);
      loadAnnouncements();
    } catch (err: any) {
      showToast(err.message || 'Failed to save announcement', 'error');
    }
  };

  const handleSendToStudents = async (a: AnnouncementRecord) => {
    try {
      await api.sendAdminNotification({
        title: `📢 ${a.title}`,
        description: a.content.substring(0, 100),
        category: 'academic',
        targetRole: a.targetAudience === 'Students' ? 'STUDENT' : a.targetAudience === 'Faculty' ? 'FACULTY' : 'ALL'
      });
      showToast(`Announcement dispatched to ${a.targetAudience.toLowerCase()}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch notification', 'error');
    }
  };

  const handleDeleteAnnouncement = async (a: AnnouncementRecord) => {
    if (!window.confirm(`Delete announcement "${a.title}"?`)) return;
    try {
      await api.deleteAdminAnnouncement(a.id);
      showToast('Announcement removed', 'success');
      setAnnouncements(prev => prev.filter(item => item.id !== a.id));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete announcement', 'error');
    }
  };

  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = 
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase());
    const matchesAudience = audienceFilter === 'ALL' || a.targetAudience === audienceFilter;
    return matchesSearch && matchesAudience;
  });

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div>
          <h2>University Announcements</h2>
          <p>Publish official campus notices, exam schedules, policy changes, and urgent campus bulletins</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={handleOpenCreate}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} /> New Announcement
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--admin-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search announcement title or message body..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select 
          value={audienceFilter} 
          onChange={(e) => setAudienceFilter(e.target.value)}
          style={{ height: 40, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border)', background: 'white', fontSize: '0.875rem' }}
        >
          <option value="ALL">All Audiences</option>
          <option value="Students">Students Only</option>
          <option value="Faculty">Faculty Only</option>
          <option value="All">All Campus</option>
        </select>
      </div>

      {/* Announcements Table */}
      <div className="admin-table-shell">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title & Message</th>
              <th>Audience</th>
              <th>Priority</th>
              <th>Published By</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAnnouncements.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--admin-text-muted)' }}>
                  No announcements found. Click "New Announcement" to publish one.
                </td>
              </tr>
            ) : (
              filteredAnnouncements.map(a => (
                <tr key={a.id}>
                  {/* Title & snippet */}
                  <td style={{ maxWidth: 320 }}>
                    <div style={{ fontWeight: 700, color: 'var(--admin-text-title)' }}>{a.title}</div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {a.content}
                    </span>
                  </td>

                  {/* Audience */}
                  <td>
                    <span className="admin-badge admin-badge-blue">
                      {a.targetAudience}
                    </span>
                  </td>

                  {/* Priority */}
                  <td>
                    <span className={`admin-badge ${
                      a.priority === 'Urgent' ? 'admin-badge-red' :
                      a.priority === 'High' ? 'admin-badge-amber' : 'admin-badge-gray'
                    }`}>
                      {a.priority}
                    </span>
                  </td>

                  {/* Author */}
                  <td style={{ fontSize: '0.813rem', fontWeight: 600 }}>
                    {a.authorName}
                  </td>

                  {/* Date */}
                  <td style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Recent'}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button 
                        className="admin-action-btn"
                        onClick={() => handleSendToStudents(a)}
                        title="Broadcast Notification to Students"
                        style={{ color: '#1D4ED8' }}
                      >
                        <Send size={14} />
                      </button>

                      <button 
                        className="admin-action-btn"
                        onClick={() => handleOpenEdit(a)}
                        title="Edit Announcement"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button 
                        className="admin-action-btn danger"
                        onClick={() => handleDeleteAnnouncement(a)}
                        title="Delete Announcement"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Megaphone size={18} color="var(--admin-blue-primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  {editingAnnouncement ? 'Edit Announcement' : 'Publish Campus Announcement'}
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Notice Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Schedule for Final Examinations Published"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Category</label>
                    <select 
                      value={formCategory} 
                      onChange={(e) => setFormCategory(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="Academic">Academic</option>
                      <option value="General">General</option>
                      <option value="Exam">Examinations</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Audience</label>
                    <select 
                      value={formTargetAudience} 
                      onChange={(e) => setFormTargetAudience(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="All">All Campus</option>
                      <option value="Students">Students</option>
                      <option value="Faculty">Faculty Only</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Priority</label>
                    <select 
                      value={formPriority} 
                      onChange={(e) => setFormPriority(e.target.value as any)}
                      style={{ width: '100%' }}
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Detailed Notice Body *</label>
                  <textarea 
                    rows={4}
                    placeholder="Type the full official announcement message here..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                {!editingAnnouncement && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#EFF6FF', borderRadius: 'var(--radius-md)', border: '1px solid #BFDBFE' }}>
                    <input 
                      type="checkbox" 
                      id="sendNotifCheck"
                      checked={formSendNotification}
                      onChange={(e) => setFormSendNotification(e.target.checked)}
                      style={{ width: 16, height: 16, cursor: 'pointer' }}
                    />
                    <label htmlFor="sendNotifCheck" style={{ fontSize: '0.813rem', fontWeight: 600, color: '#1D4ED8', cursor: 'pointer' }}>
                      Automatically dispatch push notification to students immediately upon publication
                    </label>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingAnnouncement ? 'Save Changes' : 'Publish & Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
