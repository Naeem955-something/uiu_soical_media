import React from 'react';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Calendar, 
  Folder, 
  User as UserIcon, 
  ShoppingBag, 
  Compass, 
  Plus, 
  Bell, 
  Settings, 
  LogOut,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ViewType } from '../../types';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { 
    activeView, 
    setActiveView, 
    setIsCreatePostModalOpen, 
    unreadNotificationsCount,
    logout
  } = useApp();

  const handleNavClick = (view: ViewType) => {
    setActiveView(view);
    onCloseMobile();
  };

  const navItems: Array<{ id: ViewType; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'Home', icon: <Home size={19} /> },
    { id: 'communities', label: 'Communities', icon: <Users size={19} /> },
    { id: 'chat', label: 'Chat', icon: <MessageSquare size={19} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={19} /> },
    { id: 'resources', label: 'Resources', icon: <Folder size={19} /> },
    { id: 'profile', label: 'Campus Profile', icon: <UserIcon size={19} /> },
    { id: 'marketplace', label: 'Marketplace', icon: <ShoppingBag size={19} /> },
    { id: 'lostfound', label: 'Lost & Found', icon: <Compass size={19} /> },
  ];

  return (
    <aside className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div>
        <div className="sidebar-brand-badge">
          <div className="brand-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm-7.5 9.5v5C4.5 19.5 8 22 12 22s7.5-2.5 7.5-5.5v-5L12 16.5 4.5 11.5z"/>
            </svg>
          </div>
          <div className="brand-text-block">
            <h2>UniConnect</h2>
            <span>Academic Ecosystem</span>
          </div>

          {mobileOpen && (
            <button 
              onClick={onCloseMobile} 
              style={{ marginLeft: 'auto', padding: 4, color: 'var(--text-muted)' }}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav-list">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button 
          className="sidebar-create-post-btn"
          onClick={() => {
            setIsCreatePostModalOpen(true);
            onCloseMobile();
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          Create Post
        </button>
      </div>

      <div className="sidebar-bottom-group">
        <button
          className={`sidebar-nav-item ${activeView === 'notifications' ? 'active' : ''}`}
          onClick={() => handleNavClick('notifications')}
        >
          <Bell size={19} />
          <span>Notifications</span>
          {unreadNotificationsCount > 0 && (
            <span style={{
              marginLeft: 'auto',
              background: 'var(--lost-badge)',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '999px'
            }}>
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        <button
          className={`sidebar-nav-item ${activeView === 'settings' ? 'active' : ''}`}
          onClick={() => handleNavClick('settings')}
        >
          <Settings size={19} />
          <span>Settings</span>
        </button>

        <button
          className="sidebar-nav-item logout-btn"
          onClick={() => {
            logout();
            onCloseMobile();
          }}
          title="Sign out of your account"
        >
          <LogOut size={19} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
