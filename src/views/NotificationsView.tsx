import React, { useState } from 'react';
import { 
  Check, 
  Settings, 
  MessageSquare, 
  Calendar, 
  Folder, 
  Users, 
  ShoppingBag, 
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NotificationItem } from '../types';

export const NotificationsView: React.FC = () => {
  const { 
    notifications, 
    markAllNotificationsRead, 
    markNotificationRead, 
    setActiveView,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'academic' | 'social' | 'marketplace'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    return n.category === activeTab;
  });

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'chat':
        return <div className="notif-icon-circle" style={{ background: '#FFFBEB', color: '#D97706' }}><MessageSquare size={20} /></div>;
      case 'event':
        return <div className="notif-icon-circle" style={{ background: '#ECFDF5', color: '#059669' }}><Calendar size={20} /></div>;
      case 'resource':
        return <div className="notif-icon-circle" style={{ background: '#FFF7ED', color: '#EA580C' }}><Folder size={20} /></div>;
      case 'community':
        return <div className="notif-icon-circle" style={{ background: '#F0FDFA', color: '#0D9488' }}><Users size={20} /></div>;
      case 'market':
        return <div className="notif-icon-circle" style={{ background: '#EFF6FF', color: '#2563EB' }}><ShoppingBag size={20} /></div>;
      case 'system':
      default:
        return <div className="notif-icon-circle" style={{ background: '#FEF2F2', color: '#DC2626' }}><AlertTriangle size={20} /></div>;
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Notification Center</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Stay updated with your academic and social life.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            style={{ color: '#D97706', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={markAllNotificationsRead}
          >
            <Check size={16} /> Mark all as read
          </button>
          <button 
            className="nav-icon-btn" 
            onClick={() => setActiveView('settings')}
            title="Notification Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="notifications-tabs-bar">
        {(['all', 'academic', 'social', 'marketplace'] as const).map(tab => (
          <button
            key={tab}
            className={`notif-tab-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Notification Rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {filteredNotifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}>No notifications</p>
            <p style={{ fontSize: '0.875rem' }}>You're all caught up with your campus alerts and messages.</p>
          </div>
        ) : (
          filteredNotifications.map(item => (
          <div 
            key={item.id} 
            className="notification-row-card"
            onClick={() => markNotificationRead(item.id)}
          >
            {getNotificationIcon(item.type)}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {item.title}
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                  {item.timeAgo}
                </span>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: item.actionButton ? 12 : 0 }}>
                {item.description}
              </p>

              {item.actionButton && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button 
                    className="btn-primary" 
                    style={{ padding: '6px 14px', fontSize: '0.813rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationRead(item.id);
                      if (item.actionButton) setActiveView(item.actionButton.viewTarget);
                    }}
                  >
                    {item.actionButton.label}
                  </button>

                  {item.secondaryButton && (
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '6px 14px', fontSize: '0.813rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast(`Muted notifications for ${item.title}`, 'info');
                      }}
                    >
                      {item.secondaryButton.label}
                    </button>
                  )}
                </div>
              )}
            </div>

            {!item.isRead && (
              <span className="unread-orange-dot" title="Unread" />
            )}
          </div>
        )))}
      </div>

      <div style={{ textAlign: 'center', margin: '36px 0' }}>
        <button 
          className="btn-secondary"
          style={{ padding: '10px 28px', borderRadius: 'var(--radius-full)' }}
          onClick={() => showToast('Loaded earlier notifications from the semester', 'info')}
        >
          Load older notifications
        </button>
      </div>

      <footer style={{ textAlign: 'center', fontSize: '0.813rem', color: 'var(--text-light)', borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
        © 2024 UniConnect University Ecosystem. All rights reserved.
      </footer>
    </div>
  );
};
