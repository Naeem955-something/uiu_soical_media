// src/services/api.ts

const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('uniconnect_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers as Record<string, string> || {}),
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth - returns { token, user }
  register: (data: { name: string; email: string; password: string; role?: string; department?: string; studentId?: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),
  updateMe: (data: Record<string, unknown>) =>
    request('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),
  getCampusUsers: () => request('/auth/users'),
  getUserProfile: (idOrName: string) => request(`/auth/profile/${encodeURIComponent(idOrName)}`),

  // Posts - returns Post[]
  getPosts: () => request('/posts'),
  createPost: (data: { content: string; image?: string; imageDataUrl?: string; fileAttachment?: object; title?: string; tags?: string[] }) =>
    request('/posts', { method: 'POST', body: JSON.stringify(data) }),
  likePost: (id: string) => request(`/posts/${id}/like`, { method: 'PUT' }),
  addComment: (id: string, data: { text: string }) =>
    request(`/posts/${id}/comments`, { method: 'POST', body: JSON.stringify(data) }),
  votePoll: (id: string, data: { optionId: string }) =>
    request(`/posts/${id}/vote`, { method: 'PUT', body: JSON.stringify(data) }),

  // Events - returns EventItem[]
  getEvents: () => request('/events'),
  createEvent: (data: Record<string, unknown>) =>
    request('/events', { method: 'POST', body: JSON.stringify(data) }),
  registerEvent: (id: string) => request(`/events/${id}/register`, { method: 'PUT' }),

  // Marketplace - returns MarketplaceItem[]
  getMarketplaceItems: () => request('/marketplace'),
  createMarketplaceItem: (data: Record<string, unknown>) =>
    request('/marketplace', { method: 'POST', body: JSON.stringify(data) }),
  bookmarkMarketplaceItem: (id: string) =>
    request(`/marketplace/${id}/bookmark`, { method: 'PUT' }),

  // Lost & Found - returns LostFoundItem[]
  getLostFoundItems: () => request('/lostfound'),
  createLostFoundItem: (data: Record<string, unknown>) =>
    request('/lostfound', { method: 'POST', body: JSON.stringify(data) }),

  // Resources - returns ResourceItem[]
  getResources: () => request('/resources'),
  createResource: (data: Record<string, unknown>) =>
    request('/resources', { method: 'POST', body: JSON.stringify(data) }),
  bookmarkResource: (id: string) =>
    request(`/resources/${id}/bookmark`, { method: 'PUT' }),
  incrementResourceDownloads: (id: string) =>
    request(`/resources/${id}/download`, { method: 'PUT' }),

  // Communities
  getCommunities: () => request('/communities'),
  createCommunity: (data: {
    name: string;
    description?: string;
    category?: string;
    meetingInfo?: string;
    tags?: string[];
    bannerImage?: string;
    iconColor?: string;
    leaderName?: string;
    leaderEmail?: string;
  }) => request('/communities', { method: 'POST', body: JSON.stringify(data) }),
  joinCommunity: (id: string, isJoining: boolean) =>
    request(`/communities/${id}/join`, { method: 'POST', body: JSON.stringify({ isJoining }) }),
  getCommunityDiscussions: (communityId: string) =>
    request(`/communities/${communityId}/discussions`),
  createCommunityDiscussion: (communityId: string, data: { content: string; category?: string; author?: string; avatar?: string }) =>
    request(`/communities/${communityId}/discussions`, { method: 'POST', body: JSON.stringify(data) }),
  addCommunityComment: (communityId: string, discId: string, data: { text: string; authorName?: string; authorAvatar?: string }) =>
    request(`/communities/${communityId}/discussions/${discId}/comments`, { method: 'POST', body: JSON.stringify(data) }),
  likeCommunityDiscussion: (communityId: string, discId: string) =>
    request(`/communities/${communityId}/discussions/${discId}/like`, { method: 'PUT' }),

  // Chat - returns ChatConversation[]
  getConversations: () => request('/chat'),
  createConversation: (data: {
    name?: string;
    type?: string;
    topic?: string;
    initialMessage?: string;
    senderName?: string;
    senderEmail?: string;
    recipientName?: string;
    recipientAvatar?: string;
    membersList?: Array<{ name: string; avatar?: string; role?: string; isOnline?: boolean }>;
    avatarColor?: string;
    avatarText?: string;
    aboutText?: string;
  }) => request('/chat', { method: 'POST', body: JSON.stringify(data) }),
  addGroupMembers: (id: string, data: { members: Array<{ name: string; avatar?: string; role?: string }> }) =>
    request(`/chat/${id}/members`, { method: 'POST', body: JSON.stringify(data) }),
  getConversationMessages: (id: string) => request(`/chat/${id}`),
  sendMessage: (id: string, data: { content: string; attachment?: object }) =>
    request(`/chat/${id}/messages`, { method: 'POST', body: JSON.stringify(data) }),

  // Notifications - returns NotificationItem[]
  getNotifications: () => request('/notifications'),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),
  markNotificationRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PUT' }),

  // Admin - 9 Modules
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: () => request('/admin/users'),
  createAdminUser: (data: { name: string; email: string; password?: string; role?: string; department?: string; studentId?: string }) =>
    request('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminUser: (id: string, data: Record<string, unknown>) =>
    request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleBlockAdminUser: (id: string) =>
    request(`/admin/users/${id}/block`, { method: 'PUT' }),
  deleteAdminUser: (id: string) =>
    request(`/admin/users/${id}`, { method: 'DELETE' }),
  
  getAdminPosts: () => request('/admin/posts'),
  deleteAdminPost: (id: string) =>
    request(`/admin/posts/${id}`, { method: 'DELETE' }),
  deleteAdminComment: (postId: string, commentId: string) =>
    request(`/admin/posts/${postId}/comments/${commentId}`, { method: 'DELETE' }),

  getAdminReports: () => request('/admin/reports'),
  resolveAdminReport: (id: string, data: { status: string }) =>
    request(`/admin/reports/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminReport: (id: string) => request(`/admin/reports/${id}`, { method: 'DELETE' }),

  getAdminEvents: () => request('/admin/events'),
  createAdminEvent: (data: Record<string, unknown>) =>
    request('/admin/events', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminEvent: (id: string, data: Record<string, unknown>) =>
    request(`/admin/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminEvent: (id: string) =>
    request(`/admin/events/${id}`, { method: 'DELETE' }),

  getAdminCommunities: () => request('/admin/communities'),
  createAdminCommunity: (data: Record<string, unknown>) =>
    request('/admin/communities', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminCommunity: (id: string, data: Record<string, unknown>) =>
    request(`/admin/communities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminCommunity: (id: string) =>
    request(`/admin/communities/${id}`, { method: 'DELETE' }),

  getAdminAnnouncements: () => request('/admin/announcements'),
  createAdminAnnouncement: (data: Record<string, unknown>) =>
    request('/admin/announcements', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminAnnouncement: (id: string, data: Record<string, unknown>) =>
    request(`/admin/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminAnnouncement: (id: string) =>
    request(`/admin/announcements/${id}`, { method: 'DELETE' }),

  getAdminNotifications: () => request('/admin/notifications'),
  sendAdminNotification: (data: { title: string; description?: string; category?: string; targetRole?: string }) =>
    request('/admin/notifications', { method: 'POST', body: JSON.stringify(data) }),

  getAdminSettings: () => request('/admin/settings'),
  updateAdminSettings: (data: Record<string, unknown>) =>
    request('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
