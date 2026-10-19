import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Search, 
  CheckCircle2, 
  Users
} from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

interface NotificationLog {
  id: string;
  title: string;
  description: string;
  category: string;
  type?: string;
  createdAt?: string;
}

export const AdminNotificationsTab: React.FC = () => {
  const { showToast } = useApp();

  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [search, setSearch] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [category, setCategory] = useState('academic');

  const loadNotifications = async () => {
    try {
      const data = await api.getAdminNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Notification title is required', 'error');
      return;
    }

    setIsSending(true);
    try {
      const res = await api.sendAdminNotification({
        title: title.trim(),
        description: description.trim(),
        category,
        targetRole
      });
      showToast(res.message || 'Notification broadcast sent successfully!', 'success');
      setTitle('');
      setDescription('');
      loadNotifications();
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch notification', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const filteredNotifications = notifications.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    (n.description && n.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div>
          <h2>Notification Broadcasting Center</h2>
          <p>Dispatch direct system push notifications to all campus users, students, or faculty members</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 28 }}>
        
        {/* Compose Form */}
        <div style={{ background: 'white', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Dispatch New Broadcast</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Delivered instantly into user notification trays</span>
            </div>
          </div>

          <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>
                Notification Title *
              </label>
              <input 
                type="text" 
                placeholder="e.g. Course Add/Drop Period Extended"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>
                  Target Recipients
                </label>
                <select 
                  value={targetRole} 
                  onChange={(e) => setTargetRole(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="ALL">All Campus Users</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="FACULTY">Faculty / Teachers Only</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>
                  Category
                </label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="academic">Academic Notice</option>
                  <option value="social">Campus Event</option>
                  <option value="marketplace">Administrative</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>
                Message Content / Details
              </label>
              <textarea 
                rows={3}
                placeholder="Enter details or instructions for recipients..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSending || !title.trim()}
              style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Send size={16} /> {isSending ? 'Broadcasting...' : 'Send Notification Broadcast'}
            </button>
          </form>
        </div>

        {/* Quick Instructions & Metrics Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'white', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-lg)', padding: 22 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={16} color="var(--admin-blue-primary)" /> Broadcast Reach
            </h4>
            <p style={{ fontSize: '0.813rem', color: 'var(--admin-text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
              Targeted broadcasts allow administrators to distribute critical time-sensitive notices directly to student dashboards without email lag.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, background: '#F8FAFC', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Delivery Rate</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>100%</div>
              </div>
              <div style={{ flex: 1, background: '#F8FAFC', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Dispatched Logs</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text-title)' }}>{notifications.length}</div>
              </div>
            </div>
          </div>

          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-lg)', padding: 18, color: '#1E40AF', fontSize: '0.813rem' }}>
            <strong>💡 Administrative Tip:</strong> Announcements marked as "High" or "Urgent" automatically send alerts. Use this tool for direct, lightweight notifications.
          </div>
        </div>

      </div>

      {/* Recent Dispatched Notifications Table */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Recent Dispatched Notifications</h3>
          <div className="admin-search-input" style={{ width: 280, flex: 'none' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--admin-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Filter notification logs..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ height: 36, paddingLeft: 30, fontSize: '0.813rem' }}
            />
          </div>
        </div>

        <div className="admin-table-shell">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Notification Title</th>
                <th>Description</th>
                <th>Category</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--admin-text-muted)' }}>
                    No recent notifications logged.
                  </td>
                </tr>
              ) : (
                filteredNotifications.slice(0, 15).map(n => (
                  <tr key={n.id}>
                    <td style={{ fontWeight: 700, color: 'var(--admin-text-title)' }}>
                      {n.title}
                    </td>
                    <td style={{ maxWidth: 320, color: 'var(--admin-text-body)' }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {n.description || 'System generated notification'}
                      </span>
                    </td>
                    <td>
                      <span className="admin-badge admin-badge-blue">
                        {n.category || 'academic'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : 'Recent'}
                    </td>
                    <td>
                      <span className="admin-badge admin-badge-green">
                        <CheckCircle2 size={11} /> Delivered
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
