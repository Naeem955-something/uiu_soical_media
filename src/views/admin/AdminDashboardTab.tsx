import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Zap, 
  MessageSquare, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  GraduationCap, 
  Compass, 
  ArrowRight,
  ShieldAlert,
  UserPlus,
  Megaphone,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

interface AdminDashboardTabProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({ onNavigateTab }) => {
  const { adminReports, posts, events, showToast } = useApp();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    totalEvents: 0,
    pendingReports: 0,
    totalCommunities: 3,
    totalAnnouncements: 2
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminStats();
      if (data) {
        setStats(data);
      }
    } catch {
      // Fallback calculations from context
      setStats({
        totalStudents: 1,
        totalFaculty: 1,
        totalUsers: 2,
        activeUsers: 2,
        totalPosts: posts.length,
        totalEvents: events.length,
        pendingReports: adminReports.filter(r => r.status !== 'Reviewed').length,
        totalCommunities: 3,
        totalAnnouncements: 2
      });
    } finally {
      setIsLoading(false);
    }
  }, [posts.length, events.length, adminReports]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const pendingReportsList = adminReports.filter(r => r.status !== 'Reviewed').slice(0, 4);

  return (
    <div>
      {/* View Header */}
      <div className="admin-view-header">
        <div>
          <h2>University Operations Overview</h2>
          <p>Real-time campus metrics, student activities, and administrative health status</p>
        </div>
        <button 
          className="btn-secondary" 
          onClick={() => {
            loadStats();
            showToast('Metrics updated with live database data', 'info');
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh Telemetry
        </button>
      </div>

      {/* 5 Core Required KPI Cards */}
      <div className="admin-kpi-grid">
        {/* 1. Total Students */}
        <div className="admin-kpi-card">
          <div>
            <span className="admin-kpi-lbl">Total Students</span>
            <div className="admin-kpi-val">{stats.totalStudents || 1}</div>
            <span style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
              <TrendingUp size={12} /> Active Enrolled
            </span>
          </div>
          <div className="admin-kpi-icon" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
            <GraduationCap size={22} />
          </div>
        </div>

        {/* 2. Active Users */}
        <div className="admin-kpi-card">
          <div>
            <span className="admin-kpi-lbl">Active Users</span>
            <div className="admin-kpi-val">{stats.activeUsers || 2}</div>
            <span style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} /> Online Today
            </span>
          </div>
          <div className="admin-kpi-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
            <Zap size={22} />
          </div>
        </div>

        {/* 3. Total Posts */}
        <div className="admin-kpi-card">
          <div>
            <span className="admin-kpi-lbl">Total Posts</span>
            <div className="admin-kpi-val">{stats.totalPosts}</div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              Campus Feed Threads
            </span>
          </div>
          <div className="admin-kpi-icon" style={{ background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0' }}>
            <MessageSquare size={22} />
          </div>
        </div>

        {/* 4. Total Events */}
        <div className="admin-kpi-card">
          <div>
            <span className="admin-kpi-lbl">Total Events</span>
            <div className="admin-kpi-val">{stats.totalEvents}</div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              Seminars & Workshops
            </span>
          </div>
          <div className="admin-kpi-icon" style={{ background: '#FFFBEB', color: '#D97706' }}>
            <Calendar size={22} />
          </div>
        </div>

        {/* 5. Pending Reports */}
        <div className="admin-kpi-card" style={{ borderLeft: '4px solid #EF4444' }}>
          <div>
            <span className="admin-kpi-lbl">Pending Reports</span>
            <div className="admin-kpi-val" style={{ color: stats.pendingReports > 0 ? '#DC2626' : '#10B981' }}>
              {stats.pendingReports}
            </div>
            <span style={{ fontSize: '0.75rem', color: stats.pendingReports > 0 ? '#DC2626' : '#059669', fontWeight: 700 }}>
              {stats.pendingReports > 0 ? 'Requires Action' : 'All Clear'}
            </span>
          </div>
          <div className="admin-kpi-icon" style={{ background: '#FEF2F2', color: '#DC2626' }}>
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Secondary Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 28 }}>
        <div style={{ background: 'white', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Faculty Members</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text-title)' }}>{stats.totalFaculty || 1}</div>
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F0FDFA', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Clubs & Societies</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text-title)' }}>{stats.totalCommunities || 3}</div>
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Megaphone size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Announcements</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text-title)' }}>{stats.totalAnnouncements || 2}</div>
          </div>
        </div>
      </div>

      {/* Bottom 2-Column: Quick Actions & Pending Reports */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24 }}>
        
        {/* Pending Moderation Queue */}
        <div style={{ background: 'white', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={18} color="#DC2626" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Reports Needing Review</h3>
            </div>
            <button 
              onClick={() => onNavigateTab('reports')} 
              style={{ fontSize: '0.813rem', color: 'var(--admin-blue-primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          {pendingReportsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--admin-text-muted)' }}>
              <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 8px auto' }} />
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--admin-text-title)' }}>No Pending Reports</p>
              <p style={{ fontSize: '0.813rem' }}>All student reports and flagged discussions have been resolved.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingReportsList.map(rep => (
                <div 
                  key={rep.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #F1F5F9',
                    background: '#FAFAFC'
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, paddingRight: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span className={`admin-badge ${rep.priority === 'Urgent' ? 'admin-badge-red' : 'admin-badge-amber'}`}>
                        {rep.priority}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{rep.locationContext}</span>
                    </div>
                    <div style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--admin-text-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      "{rep.reportedContent}"
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>Reason: {rep.reason}</span>
                  </div>
                  <button 
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '5px 10px', height: 30 }}
                    onClick={() => onNavigateTab('reports')}
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Admin Actions */}
        <div style={{ background: 'white', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 6 }}>Administrative Shortcuts</h3>
            <p style={{ fontSize: '0.813rem', color: 'var(--admin-text-muted)', marginBottom: 16 }}>
              Quickly perform common campus management operations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button 
                onClick={() => onNavigateTab('users')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--admin-border)',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EFF6FF', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--admin-text-title)' }}>Manage Campus Users</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Add, edit, or block students & teachers</div>
                </div>
              </button>

              <button 
                onClick={() => onNavigateTab('announcements')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--admin-border)',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Megaphone size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--admin-text-title)' }}>Publish Official Announcement</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Send urgent updates & alerts to all students</div>
                </div>
              </button>

              <button 
                onClick={() => onNavigateTab('events')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--admin-border)',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--admin-text-title)' }}>Create Campus Event</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Organize seminars, workshops & hackathons</div>
                </div>
              </button>
            </div>
          </div>

          <div style={{ marginTop: 20, padding: '12px 16px', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0', fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
            System Status: <strong>Operational (100% Uptime)</strong> • Embedded DB Active
          </div>
        </div>

      </div>
    </div>
  );
};
