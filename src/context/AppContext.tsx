import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  ViewType, 
  User, 
  Post, 
  EventItem, 
  MarketplaceItem, 
  LostFoundItem, 
  ResourceItem, 
  ChatConversation, 
  ChatMessage, 
  NotificationItem, 
  AdminReport, 
  ToastMessage 
} from '../types';
import { 
  initialUser, 
  initialPosts, 
  initialMarketplaceItems, 
  initialEvents, 
  initialLostFoundItems, 
  initialResources, 
  initialConversations, 
  initialNotifications, 
  initialAdminReports 
} from '../data/mockData';

interface AppContextType {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  user: User;
  updateUser: (fields: Partial<User>) => void;
  posts: Post[];
  createPost: (content: string, image?: string, file?: { name: string; size?: string; mimeType?: string; extension?: string; fileData?: string }, imageDataUrl?: string) => void;
  deletePost: (postId: string) => Promise<void>;
  likePost: (postId: string) => void;
  votePoll: (postId: string, optionId: string) => void;
  addComment: (postId: string, text: string) => void;
  marketplaceItems: MarketplaceItem[];
  addMarketplaceItem: (item: Omit<MarketplaceItem, 'id' | 'postedDate' | 'isBookmarked'>) => void;
  toggleBookmarkMarketplace: (itemId: string) => void;
  events: EventItem[];
  registerForEvent: (eventId: string) => void;
  addEvent: (event: Omit<EventItem, 'id' | 'registeredCount'>) => void;
  lostFoundItems: LostFoundItem[];
  addLostFoundItem: (item: Omit<LostFoundItem, 'id' | 'reportedDate'>) => void;
  resources: ResourceItem[];
  toggleBookmarkResource: (resId: string) => void;
  addResource: (res: Omit<ResourceItem, 'id' | 'downloads' | 'rating' | 'isBookmarked' | 'timeAgo'>) => void;
  incrementResourceDownload: (resId: string) => void;
  conversations: ChatConversation[];
  activeChatId: string;
  setActiveChatId: (id: string) => void;
  typingUsers: Record<string, string>;
  sendMessage: (convId: string, content: string, attachment?: { name: string; size: string; type: 'pdf' | 'doc' | 'image'; mimeType?: string; extension?: string; fileData?: string }) => void;
  startConversationAndSendMessage: (data: {
    recipientName?: string;
    recipientAvatar?: string;
    senderName?: string;
    senderEmail?: string;
    topic?: string;
    message: string;
  }) => Promise<void>;
  createGroup: (data: {
    name: string;
    topic?: string;
    aboutText?: string;
    avatarColor?: string;
    members: Array<{ name: string; avatar?: string; role?: string; isOnline?: boolean }>;
    initialMessage?: string;
  }) => Promise<string>;
  addGroupMembers: (
    chatId: string,
    members: Array<{ name: string; avatar?: string; role?: string; isOnline?: boolean }>
  ) => Promise<void>;
  ensureCommunityChat: (community: { id: string; name: string; description?: string; bannerImage?: string; iconColor?: string; leaderName?: string; leaderEmail?: string }) => Promise<string>;
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  adminReports: AdminReport[];
  resolveAdminReport: (id: string, action: 'Reviewed' | 'Dismissed') => void;
  deleteAdminReport: (id: string) => void;
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  isCreatePostModalOpen: boolean;
  setIsCreatePostModalOpen: (open: boolean) => void;
  isSellModalOpen: boolean;
  setIsSellModalOpen: (open: boolean) => void;
  isTicketModalOpen: boolean;
  setIsTicketModalOpen: (open: boolean) => void;
  activeTicketEvent: EventItem | null;
  setActiveTicketEvent: (ev: EventItem | null) => void;
  viewingUserProfile: User | null;
  setViewingUserProfile: (u: User | null) => void;
  openUserProfile: (authorOrUser: { name: string; avatar?: string; department?: string; badge?: string; id?: string }) => Promise<void>;
  filterAuthorName: string | null;
  setFilterAuthorName: (name: string | null) => void;
  login: (email: string, password: string) => Promise<User>;
  registerUser: (data: { name: string; email: string; password: string; role?: string; department?: string; studentId?: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const VALID_VIEWS: Record<string, ViewType> = {
  home: 'home',
  communities: 'communities',
  communties: 'communities',
  community: 'communities',
  chat: 'chat',
  chats: 'chat',
  messages: 'chat',
  message: 'chat',
  events: 'events',
  event: 'events',
  resources: 'resources',
  resource: 'resources',
  marketplace: 'marketplace',
  market: 'marketplace',
  shop: 'marketplace',
  lostfound: 'lostfound',
  'lost-found': 'lostfound',
  'lost_found': 'lostfound',
  lost: 'lostfound',
  found: 'lostfound',
  profile: 'profile',
  user: 'profile',
  notifications: 'notifications',
  notification: 'notifications',
  notif: 'notifications',
  settings: 'settings',
  setting: 'settings',
  admin: 'admin',
  'admin-panel': 'admin',
  login: 'login',
  signin: 'login',
  signup: 'login'
};

const VIEW_TITLES: Record<ViewType, string> = {
  home: 'UniConnect | Academic Ecosystem',
  communities: 'Communities | UniConnect',
  chat: 'Chat & Discussions | UniConnect',
  events: 'Campus Events | UniConnect',
  resources: 'Academic Resources | UniConnect',
  marketplace: 'Student Marketplace | UniConnect',
  lostfound: 'Lost & Found | UniConnect',
  profile: 'Campus Profile | UniConnect',
  notifications: 'Notifications | UniConnect',
  settings: 'Account Settings | UniConnect',
  admin: 'Admin Panel | UniConnect',
  login: 'Sign In | UniConnect'
};

function getViewFromPath(pathname: string): ViewType {
  // Strip origin, hash, query params, and slashes
  const clean = pathname.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '').toLowerCase().split('/')[0];
  return VALID_VIEWS[clean] || 'home';
}

function updatePageTitle(view: ViewType) {
  if (typeof document !== 'undefined') {
    document.title = VIEW_TITLES[view] || 'UniConnect | Academic Ecosystem';
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveViewState] = useState<ViewType>(() => {
    if (typeof window !== 'undefined') {
      const view = getViewFromPath(window.location.pathname);
      updatePageTitle(view);
      return view;
    }
    return 'home';
  });

  const setActiveView = (view: ViewType) => {
    setActiveViewState(view);
    updatePageTitle(view);
    if (typeof window !== 'undefined') {
      const targetPath = `/${view}`;
      if (window.location.pathname.toLowerCase() !== targetPath.toLowerCase()) {
        window.history.pushState({ view }, '', targetPath);
      }
    }
  };

  // Sync with browser Back/Forward navigation buttons
  useEffect(() => {
    const handlePopState = () => {
      const view = getViewFromPath(window.location.pathname);
      setActiveViewState(view);
      updatePageTitle(view);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Normalize initial URL path if on root or alias
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentView = getViewFromPath(window.location.pathname);
      const currentPath = window.location.pathname.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
      if (!currentPath || currentPath.toLowerCase() !== currentView) {
        window.history.replaceState({ view: currentView }, '', `/${currentView}`);
      }
      updatePageTitle(currentView);
    }
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [user, setUser] = useState<User>(initialUser);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>(initialMarketplaceItems);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [lostFoundItems, setLostFoundItems] = useState<LostFoundItem[]>(initialLostFoundItems);
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [conversations, setConversations] = useState<ChatConversation[]>(initialConversations);
  const [activeChatId, setActiveChatId] = useState<string>('chat-1');
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [adminReports, setAdminReports] = useState<AdminReport[]>(initialAdminReports);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [activeTicketEvent, setActiveTicketEvent] = useState<EventItem | null>(null);
  const [viewingUserProfile, setViewingUserProfile] = useState<User | null>(null);
  const [filterAuthorName, setFilterAuthorName] = useState<string | null>(null);

  const openUserProfile = async (authorOrUser: { name: string; avatar?: string; department?: string; badge?: string; id?: string }) => {
    if (user && (authorOrUser.name === user.name || (authorOrUser.id && authorOrUser.id === user.id))) {
      setViewingUserProfile(user);
      return;
    }

    try {
      const lookup = authorOrUser.id || authorOrUser.name;
      const profileData = await api.getUserProfile(lookup);
      if (profileData && profileData.name) {
        setViewingUserProfile(profileData);
        return;
      }
    } catch {
      // continue to fallback
    }

    setViewingUserProfile({
      id: authorOrUser.id || `user-${encodeURIComponent(authorOrUser.name)}`,
      name: authorOrUser.name,
      email: `${authorOrUser.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@university.edu`,
      avatar: authorOrUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      role: (authorOrUser.badge as any) || (authorOrUser.name.toLowerCase().includes('dr.') || authorOrUser.name.toLowerCase().includes('prof') ? 'FACULTY' : authorOrUser.name.toLowerCase().includes('club') ? 'CLUB' : 'STUDENT'),
      department: authorOrUser.department || 'Computer Science & Engineering',
      semester: 'Senior Standing',
      studentId: 'UNI-' + Math.floor(1000 + Math.random() * 9000),
      reputationScore: 910,
      cgpa: 3.88,
      hideCgpa: false,
      creditsCompleted: 98,
      totalCredits: 120,
      bio: `Campus community member in ${authorOrUser.department || 'Computer Science & Engineering'}. Active contributor to UniConnect academic discussions, student projects, and peer mentorship.`,
      major: authorOrUser.department || 'Computer Science',
      expectedGraduation: '2026',
      verified: true,
      skills: ['Python', 'System Architecture', 'Algorithms', 'Research Analysis', 'Collaboration'],
      tags: ['Campus Member', 'Verified'],
      featuredProject: {
        title: `${authorOrUser.name}'s Campus Project`,
        description: `Academic research and development project focused on ${authorOrUser.department || 'Computer Science'} initiatives.`,
        image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500',
        githubUrl: 'https://github.com',
        stars: 76
      },
      researchInterests: [
        { title: 'Academic Research', subtitle: authorOrUser.department || 'Applied Sciences' },
        { title: 'Innovation', subtitle: 'Technology & Design' }
      ],
      achievements: [
        { title: 'Campus Scholar', subtitle: 'Top Academic Standing', date: '2025' },
        { title: 'Peer Mentor', subtitle: 'Student Academic Council', date: '2026' }
      ]
    });
  };

  // Load all data from API
  const loadAllData = async () => {
    try {
      const [postsRes, eventsRes, marketRes, lfRes, resRes] = await Promise.all([
        api.getPosts().catch(() => null),
        api.getEvents().catch(() => null),
        api.getMarketplaceItems().catch(() => null),
        api.getLostFoundItems().catch(() => null),
        api.getResources().catch(() => null),
      ]);

      if (postsRes && Array.isArray(postsRes)) setPosts(postsRes);
      if (eventsRes && Array.isArray(eventsRes)) setEvents(eventsRes);
      if (marketRes && Array.isArray(marketRes)) setMarketplaceItems(marketRes);
      if (lfRes && Array.isArray(lfRes)) setLostFoundItems(lfRes);
      if (resRes && Array.isArray(resRes)) setResources(resRes);
    } catch (error) {
      console.error('Failed to load public data', error);
    }
  };

  // Load auth-required data
  const loadAuthData = async () => {
    try {
      const [chatRes, notifRes, adminRes] = await Promise.all([
        api.getConversations().catch(() => null),
        api.getNotifications().catch(() => null),
        api.getAdminReports().catch(() => null),
      ]);

      if (chatRes && Array.isArray(chatRes) && chatRes.length > 0) {
        setConversations(chatRes);
        setActiveChatId(prev => chatRes.some(c => c.id === prev) ? prev : chatRes[0].id);
      }
      if (notifRes && Array.isArray(notifRes)) setNotifications(notifRes);
      if (adminRes && Array.isArray(adminRes)) setAdminReports(adminRes);
    } catch (error) {
      console.error('Failed to load auth data', error);
    }
  };

  // Initialize app
  useEffect(() => {
    const init = async () => {
      let token = localStorage.getItem('uniconnect_token');
      if (token) {
        try {
          const userData = await api.getMe();
          if (userData && userData.id) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            token = null;
            localStorage.removeItem('uniconnect_token');
          }
        } catch {
          token = null;
          localStorage.removeItem('uniconnect_token');
        }
      }

      // If no active token, automatically log in with the default student account
      if (!token) {
        try {
          const authRes = await api.login({ email: 'student@university.edu', password: 'password123' });
          if (authRes?.token) {
            localStorage.setItem('uniconnect_token', authRes.token);
            setUser(authRes.user);
            setIsAuthenticated(true);
          }
        } catch (authErr) {
          console.warn('Initial student auto-authentication fallback:', authErr);
        }
      }

      await Promise.all([
        loadAllData(),
        loadAuthData()
      ]);
      setIsLoading(false);
    };
    init();
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // ===== AUTH =====
  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.login({ email, password });
    localStorage.setItem('uniconnect_token', res.token);
    setUser(res.user);
    setIsAuthenticated(true);
    showToast('Welcome back to UniConnect!', 'success');
    await Promise.all([loadAuthData(), loadAllData()]);
    return res.user;
  };

  const registerUser = async (data: { name: string; email: string; password: string; role?: string; department?: string; studentId?: string }) => {
    const res = await api.register(data);
    localStorage.setItem('uniconnect_token', res.token);
    setUser(res.user);
    setIsAuthenticated(true);
    showToast('Registration successful! Welcome to UniConnect.', 'success');
    await Promise.all([loadAuthData(), loadAllData()]);
  };

  const logout = () => {
    localStorage.removeItem('uniconnect_token');
    setUser(initialUser);
    setIsAuthenticated(false);
    setActiveView('login');
    setConversations(initialConversations);
    setNotifications(initialNotifications);
    setAdminReports(initialAdminReports);
    showToast('Logged out successfully', 'info');
  };

  // ===== USER =====
  const updateUser = async (fields: Partial<User>) => {
    try {
      const updated = await api.updateMe(fields as Record<string, unknown>);
      setUser(prev => ({ ...prev, ...(updated || fields) }));
      showToast('Profile updated successfully!', 'success');
    } catch {
      setUser(prev => ({ ...prev, ...fields }));
      showToast('Profile updated locally', 'info');
    }
  };

  // ===== POSTS =====
  const createPost = async (content: string, image?: string, file?: { name: string; size?: string; mimeType?: string; extension?: string; fileData?: string }, imageDataUrl?: string) => {
    try {
      const newPost = await api.createPost({
        content,
        image,
        imageDataUrl,
        fileAttachment: file ? { name: file.name, size: file.size, mimeType: file.mimeType, extension: file.extension, fileData: file.fileData } : undefined
      });
      setPosts(prev => [newPost, ...prev]);
      showToast('Your post has been published to campus feed!', 'success');
    } catch (err: any) {
      console.error('Create post error:', err);
      const fallbackPost: Post = {
        id: `post-${Date.now()}`,
        authorName: user.name,
        authorAvatar: user.avatar,
        authorBadge: user.role === 'STUDENT' ? 'STUDENT' : 'FACULTY',
        authorDepartment: user.department,
        timeAgo: 'Just now',
        content,
        image,
        imageDataUrl,
        fileAttachment: file,
        likes: 0,
        userLiked: false,
        commentsCount: 0,
        commentsList: []
      };
      setPosts(prev => [fallbackPost, ...prev]);
      showToast('Your post has been published to campus feed!', 'success');
    }
  };

  const likePost = async (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isLiked = !p.userLiked;
        return {
          ...p,
          userLiked: isLiked,
          likes: isLiked ? p.likes + 1 : Math.max(0, p.likes - 1)
        };
      }
      return p;
    }));
    try {
      const updated = await api.likePost(postId);
      if (updated && updated.id) {
        setPosts(prev => prev.map(p => p.id === postId ? updated : p));
      }
    } catch {
      // silent
    }
  };

  const votePoll = async (postId: string, optionId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId && p.poll) {
        if (p.poll.userVotedOptionId) return p;
        const newTotal = p.poll.totalVotes + 1;
        const newOptions = p.poll.options.map(opt => {
          const newVotes = opt.id === optionId ? opt.votes + 1 : opt.votes;
          return {
            ...opt,
            votes: newVotes,
            percentage: Math.round((newVotes / newTotal) * 100)
          };
        });
        return {
          ...p,
          poll: {
            ...p.poll,
            options: newOptions,
            totalVotes: newTotal,
            userVotedOptionId: optionId
          }
        };
      }
      return p;
    }));
    showToast('Vote recorded!', 'info');
    try {
      const updated = await api.votePoll(postId, { optionId });
      if (updated && updated.id) {
        setPosts(prev => prev.map(p => p.id === postId ? updated : p));
      }
    } catch { /* silent */ }
  };

  const addComment = async (postId: string, text: string) => {
    if (!text.trim()) return;
    try {
      const updated = await api.addComment(postId, { text: text.trim() });
      if (updated && updated.id) {
        setPosts(prev => prev.map(p => p.id === postId ? updated : p));
      }
      showToast('Comment added!', 'success');
    } catch {
      const newComment = {
        id: `comm-${Date.now()}`,
        authorName: user.name,
        authorAvatar: user.avatar,
        text: text.trim(),
        timeAgo: 'Just now'
      };
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            commentsList: [...(p.commentsList || []), newComment]
          };
        }
        return p;
      }));
      showToast('Comment added!', 'success');
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await api.deleteAdminPost(postId);
    } catch {
      // Keep optimistic removal
    }
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  // ===== MARKETPLACE =====
  const addMarketplaceItem = async (item: Omit<MarketplaceItem, 'id' | 'postedDate' | 'isBookmarked'>) => {
    try {
      const newItem = await api.createMarketplaceItem(item);
      setMarketplaceItems(prev => [newItem, ...prev]);
      showToast('Listing published to Marketplace!', 'success');
    } catch (err: any) {
      console.error('Marketplace listing error:', err);
      const fallbackItem: MarketplaceItem = {
        ...item,
        id: `item-${Date.now()}`,
        postedDate: 'Today',
        isBookmarked: false
      };
      setMarketplaceItems(prev => [fallbackItem, ...prev]);
      showToast('Listing published to Marketplace!', 'success');
    }
  };

  const toggleBookmarkMarketplace = async (itemId: string) => {
    setMarketplaceItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const bookmarked = !item.isBookmarked;
        showToast(bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks', 'info');
        return { ...item, isBookmarked: bookmarked };
      }
      return item;
    }));
    try {
      await api.bookmarkMarketplaceItem(itemId);
    } catch { /* silent */ }
  };

  // ===== EVENTS =====
  const registerForEvent = async (eventId: string) => {
    try {
      const updated = await api.registerEvent(eventId);
      if (updated && updated.id) {
        setEvents(prev => prev.map(ev => ev.id === eventId ? updated : ev));
        if (updated.userRegistered) {
          setActiveTicketEvent(updated);
          setIsTicketModalOpen(true);
          showToast(`Registered for ${updated.title}!`, 'success');
        } else {
          showToast(`Registration cancelled for ${updated.title}`, 'info');
        }
        return;
      }
    } catch { /* fallback */ }

    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        const isRegistered = !ev.userRegistered;
        const newCount = isRegistered ? ev.registeredCount + 1 : Math.max(0, ev.registeredCount - 1);
        if (isRegistered) {
          setActiveTicketEvent(ev);
          setIsTicketModalOpen(true);
          showToast(`Registered for ${ev.title}!`, 'success');
        } else {
          showToast(`Registration cancelled for ${ev.title}`, 'info');
        }
        return {
          ...ev,
          userRegistered: isRegistered,
          registeredCount: newCount,
          status: isRegistered ? 'Confirmed' : undefined
        };
      }
      return ev;
    }));
  };

  const addEvent = async (ev: Omit<EventItem, 'id' | 'registeredCount'>) => {
    try {
      const newEvent = await api.createEvent(ev);
      setEvents(prev => [newEvent, ...prev]);
      showToast('Campus event successfully submitted!', 'success');
    } catch (err: any) {
      console.error('Create event error:', err);
      const fallbackEvent: EventItem = {
        ...ev,
        id: `ev-${Date.now()}`,
        registeredCount: 1,
        userRegistered: true,
        status: 'Confirmed'
      };
      setEvents(prev => [fallbackEvent, ...prev]);
      showToast('Campus event successfully submitted!', 'success');
    }
  };

  // ===== LOST & FOUND =====
  const addLostFoundItem = async (item: Omit<LostFoundItem, 'id' | 'reportedDate'>) => {
    try {
      const newItem = await api.createLostFoundItem(item);
      setLostFoundItems(prev => [newItem, ...prev]);
      showToast(`${item.statusType} item reported successfully!`, 'success');
    } catch (err: any) {
      console.error('Lost & found report error:', err);
      const fallbackItem: LostFoundItem = {
        ...item,
        id: `lf-${Date.now()}`,
        reportedDate: 'Today'
      };
      setLostFoundItems(prev => [fallbackItem, ...prev]);
      showToast(`${item.statusType} item reported successfully!`, 'success');
    }
  };

  // ===== RESOURCES =====
  const toggleBookmarkResource = async (resId: string) => {
    setResources(prev => prev.map(res => {
      if (res.id === resId) {
        const bookmarked = !res.isBookmarked;
        showToast(bookmarked ? 'Bookmarked resource!' : 'Removed bookmark', 'info');
        return { ...res, isBookmarked: bookmarked };
      }
      return res;
    }));
    try {
      await api.bookmarkResource(resId);
    } catch { /* silent */ }
  };

  const addResource = async (res: Omit<ResourceItem, 'id' | 'downloads' | 'rating' | 'isBookmarked' | 'timeAgo'>) => {
    try {
      const newRes = await api.createResource(res);
      setResources(prev => [newRes, ...prev]);
      showToast('Resource uploaded to Academic Hub! Earned +25 reputation.', 'success');
    } catch (err: any) {
      console.error('Resource upload error:', err);
      const fallbackRes: ResourceItem = {
        ...res,
        id: `res-${Date.now()}`,
        downloads: 1,
        rating: 5.0,
        isBookmarked: false,
        timeAgo: 'Just now'
      };
      setResources(prev => [fallbackRes, ...prev]);
      showToast('Resource uploaded to Academic Hub! Earned +25 reputation.', 'success');
    }
  };

  const incrementResourceDownload = async (resId: string) => {
    setResources(prev => prev.map(res =>
      res.id === resId ? { ...res, downloads: (res.downloads || 0) + 1 } : res
    ));
    try {
      await api.incrementResourceDownloads(resId);
    } catch { /* silent */ }
  };

  // ===== CHAT =====
  const sendMessage = async (
    convId: string, 
    content: string, 
    attachment?: { name: string; size: string; type: 'pdf' | 'doc' | 'image'; mimeType?: string; extension?: string; fileData?: string }
  ) => {
    if (!content.trim() && !attachment) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id || 'current-user',
      senderName: user.name,
      senderAvatar: user.avatar,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true,
      attachment
    };

    const sharedFileEntry = attachment
      ? {
          name: attachment.name,
          date: 'Just now',
          size: attachment.size,
          type: attachment.type,
          mimeType: attachment.mimeType,
          extension: attachment.extension,
          fileData: attachment.fileData
        }
      : null;

    const existingShared: NonNullable<ChatConversation['sharedFiles']> = [];

    setConversations(prev => prev.map(conv => {
      if (conv.id === convId) {
        const shared = sharedFileEntry
          ? [sharedFileEntry, ...(conv.sharedFiles || existingShared)].slice(0, 25)
          : conv.sharedFiles;
        return {
          ...conv,
          lastMessage: `${user.name.split(' ')[0]}: ${content || 'Sent an attachment'}`,
          lastMessageTime: 'Just now',
          messages: [...conv.messages, newMsg],
          sharedFiles: shared as NonNullable<ChatConversation['sharedFiles']>
        };
      }
      return conv;
    }));

    try {
      const updatedConv = await api.sendMessage(convId, { content, attachment });
      if (updatedConv && updatedConv.id) {
        setConversations(prev => prev.map(c => c.id === convId ? updatedConv : c));
      }
    } catch (err) {
      console.warn('API sendMessage fallback:', err);
    }
  };

  const startConversationAndSendMessage = async (data: {
    recipientName?: string;
    recipientAvatar?: string;
    senderName?: string;
    senderEmail?: string;
    topic?: string;
    message: string;
  }) => {
    const authorName = data.senderName || user.name || 'Campus Student';
    const authorAvatar = user.avatar || '';
    const convTitle = data.recipientName ? `Chat with ${data.recipientName}` : `Message from ${authorName}`;

    try {
      const createdConv = await api.createConversation({
        name: convTitle,
        type: 'DIRECT',
        topic: data.topic || 'Profile Message',
        initialMessage: data.message,
        senderName: authorName,
        senderEmail: data.senderEmail,
        recipientName: data.recipientName,
        recipientAvatar: data.recipientAvatar
      });
      setConversations(prev => [createdConv, ...prev]);
      setActiveChatId(createdConv.id);
      showToast(`Message sent to ${data.recipientName || 'user'}!`, 'success');
    } catch (err: any) {
      console.error('Start conversation error:', err);
      const fallbackConv: ChatConversation = {
        id: `conv-${Date.now()}`,
        name: convTitle,
        type: 'DIRECT',
        unreadCount: 0,
        lastMessage: `${authorName.split(' ')[0]}: ${data.message}`,
        lastMessageTime: 'Just now',
        avatarText: authorName.substring(0, 2).toUpperCase(),
        avatarColor: '#2563EB',
        avatarImage: data.recipientAvatar,
        onlineStatus: true,
        topic: data.topic || 'Direct Message',
        aboutText: 'Direct conversation started from profile.',
        messages: [{
          id: `msg-${Date.now()}`,
          senderId: user.id || 'current-user',
          senderName: authorName,
          senderAvatar: authorAvatar,
          content: data.senderEmail ? `${data.message}\n\n[Contact Email: ${data.senderEmail}]` : data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isCurrentUser: true
        }]
      };
      setConversations(prev => [fallbackConv, ...prev]);
      setActiveChatId(fallbackConv.id);
      showToast(`Message sent to ${data.recipientName || 'user'}!`, 'success');
    }
  };

  const createGroup = async (data: {
    name: string;
    topic?: string;
    aboutText?: string;
    avatarColor?: string;
    members: Array<{ name: string; avatar?: string; role?: string; isOnline?: boolean }>;
    initialMessage?: string;
  }): Promise<string> => {
    const authorName = user.name || 'Campus Student';
    const authorAvatar = user.avatar || '';
    const initials = data.name.split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'GP';

    const finalMembers = [...data.members];
    if (!finalMembers.some(m => m.name === authorName)) {
      finalMembers.unshift({
        name: authorName,
        avatar: authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        role: 'Admin',
        isOnline: true
      });
    }

    try {
      const created = await api.createConversation({
        name: data.name,
        type: 'GROUP',
        topic: data.topic || 'Project & Study Discussion',
        aboutText: data.aboutText || `Collaborative campus group for ${data.name}.`,
        avatarColor: data.avatarColor || '#2563EB',
        avatarText: initials,
        membersList: finalMembers,
        initialMessage: data.initialMessage
      });
      setConversations(prev => [created, ...prev]);
      setActiveChatId(created.id);
      showToast(`Group "${data.name}" created successfully!`, 'success');
      return created.id;
    } catch (err: any) {
      console.error('Create group error:', err);
      const fallbackGroup: ChatConversation = {
        id: `conv-grp-${Date.now()}`,
        name: data.name,
        type: 'GROUP',
        unreadCount: 0,
        lastMessage: `${authorName.split(' ')[0]} created group "${data.name}"`,
        lastMessageTime: 'Just now',
        avatarText: initials,
        avatarColor: data.avatarColor || '#2563EB',
        onlineStatus: true,
        membersOnline: finalMembers.length,
        topic: data.topic || 'Project & Study Discussion',
        membersList: finalMembers.map(m => ({
          name: m.name,
          avatar: m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          role: m.role || 'Member',
          isOnline: m.isOnline ?? true
        })),
        messages: [{
          id: `msg-${Date.now()}`,
          senderId: 'system',
          senderName: 'System',
          senderAvatar: '',
          content: `🎉 ${authorName} created the group "${data.name}". Welcome all members!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isCurrentUser: false
        }]
      };
      setConversations(prev => [fallbackGroup, ...prev]);
      setActiveChatId(fallbackGroup.id);
      showToast(`Group "${data.name}" created!`, 'success');
      return fallbackGroup.id;
    }
  };

  const addGroupMembers = async (
    chatId: string,
    newMembers: Array<{ name: string; avatar?: string; role?: string; isOnline?: boolean }>
  ) => {
    if (!newMembers || newMembers.length === 0) return;
    try {
      const updatedConv = await api.addGroupMembers(chatId, { members: newMembers });
      if (updatedConv && updatedConv.id) {
        setConversations(prev => prev.map(c => c.id === chatId ? updatedConv : c));
      }
      showToast(`Added ${newMembers.length} member${newMembers.length > 1 ? 's' : ''} to group`, 'success');
    } catch (err: any) {
      console.warn('addGroupMembers fallback:', err);
      setConversations(prev => prev.map(c => {
        if (c.id === chatId) {
          const existingNames = new Set((c.membersList || []).map(m => m.name));
          const toAdd = newMembers.filter(m => !existingNames.has(m.name)).map(m => ({
            name: m.name,
            avatar: m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
            role: m.role || 'Member',
            isOnline: m.isOnline ?? true
          }));
          const updatedMembers = [...(c.membersList || []), ...toAdd];
          return {
            ...c,
            membersList: updatedMembers,
            membersOnline: (c.membersOnline || 0) + toAdd.length
          };
        }
        return c;
      }));
      showToast(`Added ${newMembers.length} member${newMembers.length > 1 ? 's' : ''} to group`, 'success');
    }
  };

  const ensureCommunityChat = async (community: {
    id: string; name: string; description?: string; bannerImage?: string; iconColor?: string; leaderName?: string; leaderEmail?: string
  }): Promise<string> => {
    const expectedName = `${community.name} [Community]`;
    const existing = conversations.find(c => c.type === 'GROUP' && (c.name === expectedName || (c as any).communityId === community.id));
    if (existing) {
      setActiveChatId(existing.id);
      setActiveView('chat');
      return existing.id;
    }

    const authorName = user.name || 'Campus Student';
    const authorAvatar = user.avatar || '';
    const initials = (community.name || 'C').split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'CC';
    const finalMembers: Array<{ name: string; avatar?: string; role?: string; isOnline?: boolean }> = [
      { name: authorName, avatar: authorAvatar, role: 'Admin', isOnline: true }
    ];
    if (community.leaderName && community.leaderName !== authorName) {
      finalMembers.push({
        name: community.leaderName,
        avatar: authorAvatar,
        role: 'Moderator',
        isOnline: true
      });
    }

    try {
      const created = await api.createConversation({
        name: expectedName,
        type: 'GROUP',
        topic: `Official ${community.name} community workspace`,
        aboutText: community.description || `Community chat for ${community.name}.`,
        avatarColor: community.iconColor || '#2563EB',
        avatarText: initials,
        membersList: finalMembers,
        initialMessage: `Welcome to the official ${community.name} community chat! Discuss events, questions, and collaborate here.`
      });
      if (created && created.id) {
        setConversations(prev => {
          const already = prev.find(c => c.id === created.id);
          if (already) return prev;
          return [created, ...prev];
        });
        setActiveChatId(created.id);
        setActiveView('chat');
        return created.id;
      }
    } catch (err) {
      console.warn('ensureCommunityChat API fallback:', err);
    }

    const fallbackId = `conv-comm-${community.id}-${Date.now()}`;
    const fallbackGroup: ChatConversation = {
      id: fallbackId,
      name: expectedName,
      type: 'GROUP',
      unreadCount: 0,
      lastMessage: `Welcome to ${community.name}!`,
      lastMessageTime: 'Just now',
      avatarText: initials,
      avatarColor: community.iconColor || '#2563EB',
      onlineStatus: true,
      membersOnline: finalMembers.length,
      topic: `Official ${community.name} community workspace`,
      aboutText: community.description || `Community chat for ${community.name}.`,
      membersList: finalMembers.map(m => ({
        name: m.name,
        avatar: m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        role: m.role || 'Member',
        isOnline: m.isOnline ?? true
      })),
      sharedFiles: [],
      recentMedia: [],
      messages: [{
        id: `msg-${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        senderAvatar: '',
        content: `🎉 Welcome to the official ${community.name} community chat. Introduce yourself and enjoy collaborating!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCurrentUser: false
      }]
    };
    setConversations(prev => [fallbackGroup, ...prev]);
    setActiveChatId(fallbackGroup.id);
    setActiveView('chat');
    return fallbackGroup.id;
  };

  // ===== NOTIFICATIONS =====
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await api.markAllNotificationsRead();
      showToast('All notifications marked as read', 'info');
    } catch { /* silent */ }
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await api.markNotificationRead(id);
    } catch { /* silent */ }
  };

  // ===== ADMIN =====
  const resolveAdminReport = async (id: string, action: 'Reviewed' | 'Dismissed') => {
    setAdminReports(prev => prev.map(rep => rep.id === id ? { ...rep, status: action } : rep));
    showToast(`Report marked as ${action}`, 'info');
    if (isAuthenticated) {
      try { await api.resolveAdminReport(id, { status: action }); } catch { /* silent */ }
    }
  };

  const deleteAdminReport = async (id: string) => {
    setAdminReports(prev => prev.filter(r => r.id !== id));
    showToast('Report deleted from moderation queue', 'info');
    if (isAuthenticated) {
      try { await api.deleteAdminReport(id); } catch { /* silent */ }
    }
  };

  return (
    <AppContext.Provider value={{
      activeView,
      setActiveView,
      user,
      updateUser,
      posts,
      createPost,
      deletePost,
      likePost,
      votePoll,
      addComment,
      marketplaceItems,
      addMarketplaceItem,
      toggleBookmarkMarketplace,
      events,
      registerForEvent,
      addEvent,
      lostFoundItems,
      addLostFoundItem,
      resources,
      toggleBookmarkResource,
      addResource,
      incrementResourceDownload,
      conversations,
      activeChatId,
      setActiveChatId,
      typingUsers,
      sendMessage,
      startConversationAndSendMessage,
      createGroup,
      addGroupMembers,
      ensureCommunityChat,
      notifications,
      unreadNotificationsCount,
      markAllNotificationsRead,
      markNotificationRead,
      adminReports,
      resolveAdminReport,
      deleteAdminReport,
      toasts,
      showToast,
      isCreatePostModalOpen,
      setIsCreatePostModalOpen,
      isSellModalOpen,
      setIsSellModalOpen,
      isTicketModalOpen,
      setIsTicketModalOpen,
      activeTicketEvent,
      setActiveTicketEvent,
      viewingUserProfile,
      setViewingUserProfile,
      openUserProfile,
      filterAuthorName,
      setFilterAuthorName,
      login,
      registerUser,
      logout,
      isAuthenticated,
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
