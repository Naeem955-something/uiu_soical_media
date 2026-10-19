import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Flag, 
  Calendar, 
  Compass, 
  Megaphone, 
  Bell, 
  Settings,
  Shield,
  ShieldAlert,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { AdminDashboardTab } from './admin/AdminDashboardTab';
import { AdminUsersTab } from './admin/AdminUsersTab';
import { AdminPostsTab } from './admin/AdminPostsTab';
import { AdminReportsTab } from './admin/AdminReportsTab';
import { AdminEventsTab } from './admin/AdminEventsTab';
import { AdminCommunitiesTab } from './admin/AdminCommunitiesTab';
import { AdminAnnouncementsTab } from './admin/AdminAnnouncementsTab';
import { AdminNotificationsTab } from './admin/AdminNotificationsTab';
import { AdminSettingsTab } from './admin/AdminSettingsTab';

type AdminTab = 
  | 'dashboard' 
  | 'users' 
  | 'posts' 
  | 'reports' 
  | 'events' 
  | 'communities' 
  | 'announcements' 
  | 'notifications' 
  | 'settings';

export const AdminView: React.FC = () => {
  const { adminReports, setActiveView, user, updateUser, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  if (user?.role !== 'ADMIN') {
    return (
      <div style={{
        padding: '60px 24px',
        maxWidth: 520,
        margin: '40px auto',
        textAlign: 'center',
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{
          width: 58,
          height: 58,
          borderRadius: 16,
          background: '#FEF2F2',
          color: '#DC2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px auto'
        }}>
          <ShieldAlert size={30} />
        </div>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>
          Access Restricted
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
          This console is strictly restricted to university administrators. Please authenticate with administrator credentials to view and manage campus operations.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn-secondary"
            onClick={() => setActiveView('home')}
            style={{ padding: '10px 22px' }}
          >
            Return to Campus Feed
          </button>
          <button
            className="btn-primary"
            onClick={async () => {
              try {
                const res = await api.login({ email: 'admin@university.edu', password: 'password123' });
                if (res?.token) {
                  localStorage.setItem('uniconnect_token', res.token);
                  if (res.user) {
                    updateUser(res.user);
                  }
                  showToast('Logged in as University Administrator', 'success');
                }
              } catch (e: any) {
                showToast(e.message || 'Failed to authenticate as administrator', 'error');
              }
            }}
            style={{ padding: '10px 22px', background: '#0F172A', borderColor: '#0F172A' }}
          >
            Switch to Admin Account
          </button>
        </div>
      </div>
    );
  }

  const pendingReportsCount = adminReports.filter(r => r.status !== 'Reviewed').length;

  return (
    <div className="admin-portal-wrapper">
      {/* 1. Admin Top Brand & Status Bar */}
      <header className="admin-portal-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div>
            <div className="admin-portal-badge">
              <Shield size={12} /> University Administration
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text-title)', margin: '2px 0 0 0' }}>
              Campus Operations & Control Center
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => setActiveView('home')}
            className="btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.813rem',
              padding: '7px 14px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <span>Exit to Student View</span>
            <ExternalLink size={13} />
          </button>
        </div>
      </header>

      {/* 2. Horizontal Navigation Tabs Bar */}
      <nav className="admin-nav-tabs-bar">
        <button 
          type="button"
          className={`admin-tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={15} />
          <span>Dashboard</span>
        </button>

        <button 
          type="button"
          className={`admin-tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={15} />
          <span>User Management</span>
        </button>

        <button 
          type="button"
          className={`admin-tab-button ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <MessageSquare size={15} />
          <span>Post Management</span>
        </button>

        <button 
          type="button"
          className={`admin-tab-button ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <Flag size={15} />
          <span>Reports</span>
          {pendingReportsCount > 0 && (
            <span className="nav-badge">{pendingReportsCount}</span>
          )}
        </button>

        <button 
          type="button"
          className={`admin-tab-button ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <Calendar size={15} />
          <span>Event Management</span>
        </button>

        <button 
          type="button"
          className={`admin-tab-button ${activeTab === 'communities' ? 'active' : ''}`}
          onClick={() => setActiveTab('communities')}
        >
          <Compass size={15} />
          <span>Community & Clubs</span>
        </button>

        <button 
          type="button"
          className={`admin-tab-button ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          <Megaphone size={15} />
          <span>Announcements</span>
        </button>

        <button 
          type="button"
          className={`admin-tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={15} />
          <span>Notifications</span>
        </button>

        <button 
          type="button"
          className={`admin-tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={15} />
          <span>Settings</span>
        </button>
      </nav>

      {/* 3. Main Content Viewport */}
      <main className="admin-main-viewport">
        {activeTab === 'dashboard' && <AdminDashboardTab onNavigateTab={(tab) => setActiveTab(tab as AdminTab)} />}
        {activeTab === 'users' && <AdminUsersTab />}
        {activeTab === 'posts' && <AdminPostsTab />}
        {activeTab === 'reports' && <AdminReportsTab />}
        {activeTab === 'events' && <AdminEventsTab />}
        {activeTab === 'communities' && <AdminCommunitiesTab />}
        {activeTab === 'announcements' && <AdminAnnouncementsTab />}
        {activeTab === 'notifications' && <AdminNotificationsTab />}
        {activeTab === 'settings' && <AdminSettingsTab />}
      </main>
    </div>
  );
};
