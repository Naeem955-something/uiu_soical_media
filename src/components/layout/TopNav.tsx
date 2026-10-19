import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Grid, 
  Menu, 
  Home, 
  Users, 
  MessageSquare, 
  Calendar, 
  Folder, 
  ShoppingBag, 
  Compass, 
  User as UserIcon, 
  Shield,
  Settings,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ViewType } from '../../types';

interface TopNavProps {
  onToggleMobileSidebar: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onToggleMobileSidebar }) => {
  const { activeView, setActiveView, user, unreadNotificationsCount, logout } = useApp();
  const [showAppsMenu, setShowAppsMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const appTiles: Array<{ label: string; view: ViewType; icon: React.ReactNode }> = [
    { label: 'Home', view: 'home', icon: <Home size={18} /> },
    { label: 'Communities', view: 'communities', icon: <Users size={18} /> },
    { label: 'Chat', view: 'chat', icon: <MessageSquare size={18} /> },
    { label: 'Events', view: 'events', icon: <Calendar size={18} /> },
    { label: 'Resources', view: 'resources', icon: <Folder size={18} /> },
    { label: 'Marketplace', view: 'marketplace', icon: <ShoppingBag size={18} /> },
    { label: 'Lost & Found', view: 'lostfound', icon: <Compass size={18} /> },
    { label: 'Profile', view: 'profile', icon: <UserIcon size={18} /> },
  ];

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (q.includes('event') || q.includes('hackathon') || q.includes('seminar')) setActiveView('events');
      else if (q.includes('book') || q.includes('chair') || q.includes('buy') || q.includes('price')) setActiveView('marketplace');
      else if (q.includes('lost') || q.includes('found') || q.includes('wallet') || q.includes('key')) setActiveView('lostfound');
      else if (q.includes('note') || q.includes('paper') || q.includes('cs-') || q.includes('code')) setActiveView('resources');
      else if (q.includes('chat') || q.includes('message') || q.includes('team')) setActiveView('chat');
      else if (q.includes('club') || q.includes('communit')) setActiveView('communities');
      else setActiveView('home');
    }
  };

  return (
    <header className="top-navbar">
      <div className="top-nav-left">
        <button 
          className="mobile-menu-toggle"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="brand-logo-text" onClick={() => setActiveView('home')}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm-7.5 9.5v5C4.5 19.5 8 22 12 22s7.5-2.5 7.5-5.5v-5L12 16.5 4.5 11.5z"/>
          </svg>
          UniConnect
        </div>

        <div className="top-search-wrapper">
          <Search className="top-search-icon" size={18} />
          <input 
            type="text" 
            className="top-search-input" 
            placeholder="Search campus courses, events, items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
      </div>

      <div className="top-nav-right">
        <button 
          className={`nav-icon-btn ${activeView === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveView('notifications')}
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadNotificationsCount > 0 && (
            <span className="nav-badge-count">{unreadNotificationsCount}</span>
          )}
        </button>

        <div style={{ position: 'relative' }}>
          <button 
            className="nav-icon-btn" 
            onClick={() => setShowAppsMenu(!showAppsMenu)}
            aria-label="All Apps"
          >
            <Grid size={20} />
          </button>

          {showAppsMenu && (
            <div className="apps-launcher-menu">
              {appTiles.map(tile => (
                <button
                  key={tile.label}
                  className="app-tile"
                  onClick={() => {
                    setActiveView(tile.view);
                    setShowAppsMenu(false);
                  }}
                >
                  <div className="app-tile-icon">
                    {tile.icon}
                  </div>
                  <span>{tile.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button 
            className="user-avatar-btn" 
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowAppsMenu(false);
            }}
            title={`${user.name} (Account Menu)`}
            aria-label="User account menu"
          >
            <img src={user.avatar} alt={user.name} />
          </button>

          {showUserMenu && (
            <div className="user-profile-menu">
              <div className="user-profile-menu-header">
                <img src={user.avatar} alt={user.name} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.email || 'student@university.edu'}
                  </div>
                </div>
              </div>

              <button 
                className="user-profile-menu-item"
                onClick={() => {
                  setActiveView('profile');
                  setShowUserMenu(false);
                }}
              >
                <UserIcon size={16} />
                <span>Campus Profile</span>
              </button>

              <button 
                className="user-profile-menu-item"
                onClick={() => {
                  setActiveView('settings');
                  setShowUserMenu(false);
                }}
              >
                <Settings size={16} />
                <span>Account Settings</span>
              </button>

              {user.role === 'ADMIN' && (
                <button 
                  className="user-profile-menu-item"
                  style={{ color: '#2563EB', fontWeight: 700 }}
                  onClick={() => {
                    setActiveView('admin');
                    setShowUserMenu(false);
                  }}
                >
                  <Shield size={16} />
                  <span>Admin Panel</span>
                </button>
              )}

              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '6px 0' }} />

              <button 
                className="user-profile-menu-item logout"
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>

        <button 
          className="nav-icon-btn logout-header-btn" 
          onClick={logout}
          title="Sign out of UniConnect"
          aria-label="Log Out"
          style={{ color: '#DC2626' }}
        >
          <LogOut size={19} />
        </button>
      </div>
    </header>
  );
};
