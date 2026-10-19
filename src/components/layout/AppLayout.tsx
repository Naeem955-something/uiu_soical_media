import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../common/ToastContainer';
import { CreatePostModal } from '../modals/CreatePostModal';
import { SellItemModal } from '../modals/SellItemModal';
import { EventTicketModal } from '../modals/EventTicketModal';
import { UserProfileModal } from '../modals/UserProfileModal';

// Views
import { LoginView } from '../../views/LoginView';
import { HomeView } from '../../views/HomeView';
import { ProfileView } from '../../views/ProfileView';
import { CommunitiesView } from '../../views/CommunitiesView';
import { EventsView } from '../../views/EventsView';
import { MarketplaceView } from '../../views/MarketplaceView';
import { LostAndFoundView } from '../../views/LostAndFoundView';
import { ChatView } from '../../views/ChatView';
import { ResourcesView } from '../../views/ResourcesView';
import { AdminView } from '../../views/AdminView';
import { NotificationsView } from '../../views/NotificationsView';
import { SettingsView } from '../../views/SettingsView';

export const AppLayout: React.FC = () => {
  const { 
    activeView, 
    viewingUserProfile, 
    setViewingUserProfile, 
    setFilterAuthorName, 
    setActiveView 
  } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If on login view, render full-screen split login
  if (activeView === 'login') {
    return (
      <div className="app-root">
        <LoginView />
        <ToastContainer />
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'communities':
        return <CommunitiesView />;
      case 'chat':
        return <ChatView />;
      case 'events':
        return <EventsView />;
      case 'resources':
        return <ResourcesView />;
      case 'marketplace':
        return <MarketplaceView />;
      case 'lostfound':
        return <LostAndFoundView />;
      case 'profile':
        return <ProfileView />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <SettingsView />;
      case 'admin':
        return <AdminView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="app-root">
      <TopNav onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      <div className="app-layout-body">
        {activeView !== 'admin' && (
          <Sidebar 
            mobileOpen={mobileSidebarOpen} 
            onCloseMobile={() => setMobileSidebarOpen(false)} 
          />
        )}

        <main className={`app-main-content ${activeView === 'admin' ? 'admin-full-width' : ''}`}>
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <CreatePostModal />
      <SellItemModal />
      <EventTicketModal />
      <UserProfileModal 
        user={viewingUserProfile} 
        onClose={() => setViewingUserProfile(null)} 
        onFilterPostsByAuthor={(authorName) => {
          setFilterAuthorName(authorName);
          setActiveView('home');
        }}
      />
      <ToastContainer />
    </div>
  );
};
