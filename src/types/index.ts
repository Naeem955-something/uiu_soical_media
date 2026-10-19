export type ViewType = 
  | 'home' 
  | 'communities' 
  | 'chat' 
  | 'events' 
  | 'resources' 
  | 'marketplace' 
  | 'lostfound' 
  | 'profile' 
  | 'notifications' 
  | 'settings' 
  | 'admin' 
  | 'login';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN' | 'ALUMNI';
  department: string;
  semester: string;
  studentId: string;
  reputationScore: number;
  cgpa: number;
  hideCgpa?: boolean;
  creditsCompleted: number;
  totalCredits: number;
  bio: string;
  major: string;
  expectedGraduation: string;
  verified: boolean;
  skills: string[];
  tags: string[];
  featuredProject?: {
    title: string;
    description: string;
    image?: string;
    githubUrl?: string;
    stars?: number;
  };
  researchInterests?: Array<{
    title: string;
    subtitle: string;
  }>;
  achievements?: Array<{
    title: string;
    subtitle: string;
    date: string;
  }>;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timeAgo: string;
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
  percentage: number;
}

export interface PollData {
  question?: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId?: string;
  endsIn: string;
}

export interface Post {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorBadge?: 'FACULTY' | 'CLUB' | 'STUDENT';
  authorDepartment: string;
  timeAgo: string;
  title?: string;
  content: string;
  fileAttachment?: {
    name: string;
    size?: string;
    url?: string;
    mimeType?: string;
    extension?: string;
    fileData?: string;
  };
  image?: string;
  imageDataUrl?: string;
  tags?: string[];
  likes: number;
  userLiked?: boolean;
  commentsCount: number;
  commentsList?: Comment[];
  poll?: PollData;
  actionButton?: {
    label: string;
    actionType: string;
  };
}

export interface EventItem {
  id: string;
  title: string;
  typeBadge?: 'SEMINAR' | 'WORKSHOP' | 'HACKATHON';
  date: string;
  time: string;
  location: string;
  description: string;
  image?: string;
  registeredCount: number;
  maxCapacity: number;
  isFeatured?: boolean;
  userRegistered?: boolean;
  userRole?: 'Attendee' | 'Participant' | 'Speaker';
  status?: 'Confirmed' | 'Pending';
  countdownTarget?: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  price: number;
  location: string;
  condition: 'NEW' | 'LIKE NEW' | 'USED - GOOD' | 'USED - FAIR';
  category: 'Books' | 'Electronics' | 'Hostel Items' | 'Fashion' | 'Other';
  sellerName: string;
  sellerAvatar: string;
  image: string;
  isBookmarked: boolean;
  description?: string;
  postedDate: string;
}

export interface LostFoundItem {
  id: string;
  title: string;
  statusType: 'Lost' | 'Found';
  category: 'Wallet' | 'Keys' | 'Electronics' | 'IDs & Cards' | 'Books' | 'Clothing' | 'Other';
  location: string;
  reportedDate: string;
  image: string;
  isBookmarked?: boolean;
  details?: string;
  finderName?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  courseCode: string;
  category: 'Lecture Notes' | 'Research Papers' | 'Exam Prep' | 'Code Templates';
  authorName: string;
  authorAvatar: string;
  fileSize: string;
  timeAgo: string;
  downloads: number;
  rating: number;
  isBookmarked: boolean;
  fileFormat: string;
  description?: string;
  fileName?: string;
  mimeType?: string;
  fileData?: string;
  extension?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
  reactions?: { [emoji: string]: number };
  attachment?: {
    name: string;
    size: string;
    type: 'pdf' | 'doc' | 'image';
    mimeType?: string;
    extension?: string;
    fileData?: string;
  };
  seenBy?: string;
}

export interface ChatConversation {
  id: string;
  name: string;
  type: 'GROUP' | 'DIRECT';
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  avatarText?: string;
  avatarColor?: string;
  avatarImage?: string;
  onlineStatus?: boolean;
  membersOnline?: number;
  topic?: string;
  aboutText?: string;
  membersList?: Array<{ name: string; avatar: string; role?: string; isOnline?: boolean }>;
  sharedFiles?: Array<{ name: string; date: string; size: string; type: string; mimeType?: string; extension?: string; fileData?: string }>;
  recentMedia?: string[];
  messages: ChatMessage[];
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  category: 'academic' | 'social' | 'marketplace';
  isRead: boolean;
  type: 'chat' | 'event' | 'resource' | 'community' | 'market' | 'system';
  actionButton?: {
    label: string;
    viewTarget: ViewType;
  };
  secondaryButton?: {
    label: string;
  };
}

export interface AdminReport {
  id: string;
  reporterInitials: string;
  reporterName: string;
  reporterRole: string;
  reportedContent: string;
  locationContext: string;
  reason: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Normal' | 'Low';
  status: 'Pending' | 'Reviewed' | 'Dismissed';
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'error';
}
