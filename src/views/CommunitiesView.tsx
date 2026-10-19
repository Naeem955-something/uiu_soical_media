import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Share2, 
  ArrowRight, 
  Bell, 
  Paperclip, 
  Image as ImageIcon, 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Send, 
  Plus,
  Compass,
  Clock,
  Tag,
  UserCheck,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { CreateCommunityModal, CommunityData } from '../components/modals/CreateCommunityModal';
import { UserProfileModal, UserProfileData } from '../components/modals/UserProfileModal';

const PROFILES_CATALOG: Record<string, UserProfileData> = {
  'Nazmul Haque': {
    name: 'Nazmul Haque',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    email: 'nazmul.h@university.edu',
    studentId: 'CS-2023-4412',
    semester: '7th Semester • Senior',
    reputationScore: 92,
    bio: 'Machine learning researcher and student developer. Interested in generative models, computer vision, and open source campus tools.',
    skills: ['Deep Learning', 'PyTorch', 'Computer Vision', 'Python'],
    communitiesJoined: ['Machine Learning Club', 'AI Research Lab', 'Robotics Society']
  },
  'Dr. Saifur Rahman': {
    name: 'Dr. Saifur Rahman',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role: 'FACULTY',
    department: 'Computer Science & Engineering',
    email: 's.rahman@university.edu',
    semester: 'Associate Professor & Advisor',
    reputationScore: 98,
    bio: 'Associate Professor of Computer Science. Faculty Advisor for Machine Learning Club. Research focus: probabilistic graphical models and NLP.',
    skills: ['NLP', 'Machine Learning', 'Research', 'Python', 'Algorithms'],
    communitiesJoined: ['Machine Learning Club', 'CSE Department Association', 'AI Research Lab']
  },
  'Prof. Robert Davis': {
    name: 'Prof. Robert Davis',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    role: 'FACULTY',
    department: 'Software Engineering',
    email: 'r.davis@university.edu',
    semester: 'Department Chair & Professor',
    reputationScore: 99,
    bio: 'Department Chair of Software Engineering. Overseeing university curriculum, capstone evaluations, and student industry internships.',
    skills: ['Software Architecture', 'Distributed Systems', 'Agile'],
    communitiesJoined: ['CSE Department Association', 'Robotics Society']
  },
  'Fahima Tonni': {
    name: 'Fahima Tonni',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    role: 'STUDENT',
    department: 'Computer Science',
    email: 'fahima.t@university.edu',
    studentId: 'CS-2023-8821',
    semester: '8th Semester • Senior',
    reputationScore: 95,
    bio: 'Lead organizer of AI Research Lab. Published paper on LLM quantization. Teaching assistant for Data Structures.',
    skills: ['Large Language Models', 'Transformers', 'C++', 'Data Structures'],
    communitiesJoined: ['AI Research Lab', 'Machine Learning Club']
  },
  'Alex Rivera': {
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'STUDENT',
    department: 'Electrical & Computer Engineering',
    email: 'alex.r@university.edu',
    studentId: 'EE-2024-5109',
    semester: '6th Semester • Junior',
    reputationScore: 89,
    bio: 'Robotics enthusiast and hardware hacker. Leads university robot combat team and autonomous vehicle projects.',
    skills: ['ROS', 'Embedded Systems', 'C/C++', 'PCB Design'],
    communitiesJoined: ['Robotics & Automation Society', 'CSE Department Association']
  },
  'Ayesha Begum': {
    name: 'Ayesha Begum',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    email: 'ayesha.b@university.edu',
    studentId: 'CS-2023-3104',
    semester: '7th Semester • Senior',
    reputationScore: 91,
    bio: 'Student Coordinator for campus clubs. Event organizer for annual campus tech fest and hackathon logistics.',
    skills: ['Event Management', 'Public Relations', 'Python', 'Web Dev'],
    communitiesJoined: ['Machine Learning Club', 'CSE Department Association']
  },
  'Nafe Islam': {
    name: 'Nafe Islam',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80',
    role: 'STUDENT',
    department: 'Software Engineering',
    email: 'nafe.i@university.edu',
    studentId: 'SE-2024-7712',
    semester: '5th Semester • Junior',
    reputationScore: 86,
    bio: 'Community Moderator and full-stack web developer. Maintains club resources repo and discord bot integrations.',
    skills: ['TypeScript', 'React', 'Node.js', 'DevOps'],
    communitiesJoined: ['Machine Learning Club', 'Robotics Society']
  }
};

const DEFAULT_COMMUNITIES: CommunityData[] = [
  {
    id: 'comm-1',
    name: 'Machine Learning Club',
    description: 'Exploring the frontiers of neural networks, deep learning, and ethical AI in the heart of our campus.',
    category: 'Technology',
    leaderName: 'Dr. Saifur Rahman',
    leaderEmail: 's.rahman@university.edu',
    membersCount: 1200,
    status: 'Approved',
    bannerImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&auto=format&fit=crop&q=80',
    meetingInfo: 'Fridays at 4:00 PM • Lab 402',
    tags: ['AI', 'Python', 'DeepLearning'],
    iconColor: '#2563EB'
  },
  {
    id: 'comm-2',
    name: 'CSE Department Association',
    description: 'Official student and alumni community of the Computer Science & Engineering department.',
    category: 'Academic',
    leaderName: 'Prof. Robert Davis',
    leaderEmail: 'r.davis@university.edu',
    membersCount: 4500,
    status: 'Approved',
    bannerImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000',
    meetingInfo: 'Monthly General Assembly',
    tags: ['ComputerScience', 'Engineering', 'Alumni'],
    iconColor: '#7C3AED'
  },
  {
    id: 'comm-3',
    name: 'AI Research Lab',
    description: 'Undergraduate and postgraduate research group focusing on computer vision and LLMs.',
    category: 'Research',
    leaderName: 'Fahima Tonni',
    leaderEmail: 'fahima.t@university.edu',
    membersCount: 820,
    status: 'Approved',
    bannerImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000',
    meetingInfo: 'Wednesdays at 5:00 PM • Research Center',
    tags: ['Research', 'Papers', 'NLP'],
    iconColor: '#059669'
  },
  {
    id: 'comm-4',
    name: 'Robotics & Automation Society',
    description: 'Hardware prototyping, autonomous systems, and embedded robotics sprint competitions.',
    category: 'Technology',
    leaderName: 'Alex Rivera',
    leaderEmail: 'alex.r@university.edu',
    membersCount: 1800,
    status: 'Approved',
    bannerImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1000',
    meetingInfo: 'Saturdays at 11:00 AM • Robotics Lab',
    tags: ['Robotics', 'Arduino', 'Hardware'],
    iconColor: '#D97706'
  }
];

interface DiscussionComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timeAgo: string;
}

interface CommunityDiscussion {
  id: string;
  author: string;
  avatar: string;
  time: string;
  category: string;
  content: string;
  likes: number;
  liked: boolean;
  comments: number;
  commentsList?: DiscussionComment[];
}

export const CommunitiesView: React.FC = () => {
  const { user, setActiveView, showToast, ensureCommunityChat, conversations } = useApp();

  const [communities, setCommunities] = useState<CommunityData[]>(DEFAULT_COMMUNITIES);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('comm-1');
  const [joinedCommunities, setJoinedCommunities] = useState<Set<string>>(new Set(['comm-1']));
  const [savedDiscussions, setSavedDiscussions] = useState<Set<string>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Profile modal state
  const [viewingProfile, setViewingProfile] = useState<UserProfileData | null>(null);

  // Discussions state
  const [discussionText, setDiscussionText] = useState('');
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const [discussions, setDiscussions] = useState<CommunityDiscussion[]>([]);

  // Load from API
  useEffect(() => {
    api.getCommunities()
      .then((data: CommunityData[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setCommunities(data);
          setSelectedCommunityId(prev => (data.some(c => c.id === prev) ? prev : data[0].id));
        }
      })
      .catch(() => {
        // Keep fallback
      });
  }, []);

  const currentCommunity = communities.find(c => c.id === selectedCommunityId) || communities[0] || DEFAULT_COMMUNITIES[0];
  const isJoined = joinedCommunities.has(currentCommunity.id);

  // Load discussions for active community from database
  useEffect(() => {
    if (!currentCommunity?.id) return;
    api.getCommunityDiscussions(currentCommunity.id)
      .then((data: CommunityDiscussion[]) => {
        if (Array.isArray(data)) {
          setDiscussions(data);
        }
      })
      .catch(() => {
        // silent
      });
  }, [currentCommunity?.id]);

  // Profile Lookup Handler
  const handleShowProfile = (
    name?: string, 
    avatar?: string, 
    role?: 'STUDENT' | 'FACULTY' | 'ADMIN' | 'ALUMNI', 
    dept?: string, 
    title?: string
  ) => {
    const targetName = name || 'Campus Member';
    // 1. Check current logged in user
    if (user && (targetName === user.name || targetName.toLowerCase() === user.name?.toLowerCase())) {
      setViewingProfile({
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        department: user.department,
        email: user.email,
        studentId: user.studentId,
        semester: user.semester,
        reputationScore: user.reputationScore,
        bio: user.bio,
        skills: user.skills || ['Python', 'Web Dev', 'Campus Collaboration'],
        communitiesJoined: [currentCommunity.name, 'CSE Department Association']
      });
      return;
    }

    // 2. Check catalog
    if (PROFILES_CATALOG[targetName]) {
      setViewingProfile(PROFILES_CATALOG[targetName]);
      return;
    }

    // 3. Fallback generated profile
    setViewingProfile({
      name: targetName,
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      role: role || (title?.includes('Professor') || title?.includes('Advisor') ? 'FACULTY' : 'STUDENT'),
      department: dept || 'Computer Science & Engineering',
      email: `${targetName.toLowerCase().replace(/\s+/g, '.')}@university.edu`,
      semester: title || (role === 'FACULTY' ? 'Faculty Advisor' : 'Enrolled Student'),
      reputationScore: 88,
      bio: `${targetName} is an active member and contributor in ${currentCommunity.name} and campus activities.`,
      skills: ['Academic Collaboration', 'Campus Projects'],
      communitiesJoined: [currentCommunity.name]
    });
  };

  const handleToggleJoin = async () => {
    const nextJoined = !isJoined;
    setJoinedCommunities(prev => {
      const next = new Set(prev);
      if (nextJoined) next.add(currentCommunity.id);
      else next.delete(currentCommunity.id);
      return next;
    });

    setCommunities(prev => prev.map(c => {
      if (c.id === currentCommunity.id) {
        return {
          ...c,
          membersCount: nextJoined ? c.membersCount + 1 : Math.max(1, c.membersCount - 1)
        };
      }
      return c;
    }));

    showToast(
      nextJoined ? `Joined ${currentCommunity.name}! You are now an active member.` : `Left ${currentCommunity.name}`,
      'success'
    );

    try {
      await api.joinCommunity(currentCommunity.id, nextJoined);
    } catch {
      // silent
    }
  };

  const handlePostDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussionText.trim() || !currentCommunity?.id) return;

    const text = discussionText.trim();
    setDiscussionText('');

    try {
      const createdDisc = await api.createCommunityDiscussion(currentCommunity.id, {
        content: text,
        category: 'Discussion',
        author: user.name,
        avatar: user.avatar
      });
      setDiscussions(prev => [createdDisc, ...prev]);
      showToast(`Discussion published to ${currentCommunity.name} feed!`, 'success');
    } catch {
      const newDisc: CommunityDiscussion = {
        id: `d-${Date.now()}`,
        author: user.name,
        avatar: user.avatar,
        time: 'Just now',
        category: 'Discussion',
        content: text,
        likes: 0,
        liked: false,
        comments: 0,
        commentsList: []
      };
      setDiscussions(prev => [newDisc, ...prev]);
      showToast(`Discussion published to ${currentCommunity.name} feed!`, 'success');
    }
  };

  const handleLikeDiscussion = async (id: string) => {
    setDiscussions(discussions.map(d => {
      if (d.id === id) {
        return {
          ...d,
          liked: !d.liked,
          likes: d.liked ? d.likes - 1 : d.likes + 1
        };
      }
      return d;
    }));
    try {
      if (currentCommunity?.id) {
        await api.likeCommunityDiscussion(currentCommunity.id, id);
      }
    } catch {
      // silent
    }
  };

  const handleToggleSaveDiscussion = (id: string) => {
    setSavedDiscussions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast('Removed discussion from bookmarks', 'info');
      } else {
        next.add(id);
        showToast('Saved discussion to bookmarks!', 'success');
      }
      return next;
    });
  };

  const handleToggleComments = (id: string) => {
    setExpandedCommentsPostId(prev => (prev === id ? null : id));
  };

  const handleAddComment = async (discId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = (commentInputs[discId] || '').trim();
    if (!text || !currentCommunity?.id) return;

    setCommentInputs(prev => ({ ...prev, [discId]: '' }));

    try {
      const updatedDisc = await api.addCommunityComment(currentCommunity.id, discId, {
        text,
        authorName: user.name,
        authorAvatar: user.avatar
      });
      setDiscussions(prev => prev.map(d => d.id === discId ? updatedDisc : d));
      showToast('Comment posted!', 'success');
    } catch {
      const newComment: DiscussionComment = {
        id: `c-${Date.now()}`,
        authorName: user.name,
        authorAvatar: user.avatar,
        text,
        timeAgo: 'Just now'
      };

      setDiscussions(prev => prev.map(d => {
        if (d.id === discId) {
          const updatedList = [...(d.commentsList || []), newComment];
          return {
            ...d,
            comments: updatedList.length,
            commentsList: updatedList
          };
        }
        return d;
      }));
      showToast('Comment posted!', 'success');
    }
  };

  const handleCommunityCreated = (newCommunity: CommunityData) => {
    setCommunities(prev => [newCommunity, ...prev]);
    setSelectedCommunityId(newCommunity.id);
    setJoinedCommunities(prev => new Set([...prev, newCommunity.id]));
  };

  const filteredCommunities = communities.filter(c => {
    if (selectedCategory === 'ALL') return true;
    return c.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div>
      {/* Top Header Row with Breadcrumbs & "Create Community" Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div className="community-breadcrumb" style={{ margin: 0 }}>
          <span>Communities</span> &gt; <strong style={{ color: 'var(--text-main)' }}>{currentCommunity.name}</strong>
        </div>

        <button 
          className="btn-primary" 
          onClick={() => setIsCreateModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', boxShadow: 'var(--primary-shadow)' }}
        >
          <Plus size={18} strokeWidth={2.5} /> Create a Community
        </button>
      </div>

      {/* Hero Banner for Active Community */}
      <div className="community-hero-banner">
        <img 
          src={currentCommunity.bannerImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400'} 
          alt={currentCommunity.name} 
          className="community-hero-bg" 
        />
        <div className="community-hero-overlay">
          <div className="community-hero-info">
            <div className="community-icon-box" style={{ background: currentCommunity.iconColor || 'var(--primary)' }}>
              <Compass size={36} color="white" />
            </div>
            <div className="community-hero-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                <span className="badge badge-new" style={{ textTransform: 'uppercase' }}>{currentCommunity.category}</span>
                <span style={{ fontSize: '0.813rem', color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={14} /> {currentCommunity.membersCount} Members
                </span>
                {currentCommunity.meetingInfo && (
                  <span style={{ fontSize: '0.813rem', color: '#FDE68A', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} /> {currentCommunity.meetingInfo}
                  </span>
                )}
              </div>
              <h2>{currentCommunity.name}</h2>
              <p>{currentCommunity.description}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              className="btn-primary" 
              onClick={handleToggleJoin}
              style={{
                backgroundColor: isJoined ? '#10B981' : undefined,
                padding: '12px 24px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              {isJoined ? <Check size={18} /> : <Users size={18} />}
              {isJoined ? 'Joined Community' : 'Join Community'}
            </button>
            <button 
              className="nav-icon-btn" 
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
              onClick={() => {
                if (navigator.clipboard) navigator.clipboard.writeText(window.location.href);
                showToast('Community link copied to clipboard!', 'info');
              }}
              title="Share Community"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Browse & Create Other Communities Section */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Explore Campus Communities ({communities.length})</h3>
            <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>Browse student-led academic clubs, societies, and research hubs</p>
          </div>

          {/* Category Filter Pills & Create Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['ALL', 'Technology', 'Academic', 'Research'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    border: '1px solid var(--border-color)',
                    background: selectedCategory === cat ? 'var(--primary)' : 'white',
                    color: selectedCategory === cat ? 'white' : 'var(--text-body)',
                    borderRadius: 999,
                    padding: '4px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {cat === 'ALL' ? 'All' : cat}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                color: 'var(--primary)',
                background: 'var(--primary-light)',
                border: '1px solid var(--primary-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '5px 12px',
                fontWeight: 700,
                fontSize: '0.813rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Plus size={14} /> Start a Club
            </button>
          </div>
        </div>

        {/* Communities Horizontal Cards Grid with Create Card First */}
        <div className="browse-communities-row">
          {/* 1. "Create Community" Action Card */}
          <div 
            className="community-card-mini" 
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              border: '2px dashed var(--primary)',
              background: 'var(--primary-light)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              minHeight: 120,
              cursor: 'pointer',
              padding: 16
            }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8
            }}>
              <Plus size={22} strokeWidth={2.5} />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
              Create a Community
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Start a new club or study society
            </span>
          </div>

          {/* 2. Dynamic Community Cards */}
          {filteredCommunities.map(c => {
            const isSelected = c.id === currentCommunity.id;
            return (
              <div 
                key={c.id} 
                className="community-card-mini" 
                onClick={() => {
                  setSelectedCommunityId(c.id);
                  showToast(`Viewing ${c.name}`, 'info');
                }}
                style={isSelected ? {
                  border: '2px solid var(--primary)',
                  boxShadow: '0 4px 12px rgba(224, 142, 27, 0.15)'
                } : {}}
              >
                <img 
                  src={c.bannerImage || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500'} 
                  alt={c.name} 
                  className="community-card-img" 
                />
                <div className="community-card-body">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span className="badge badge-student" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                        {c.category}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.name}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {c.membersCount} members
                    </span>
                  </div>
                  <ArrowRight size={18} color="var(--primary)" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Content Grid: Feed & Community Sidebar */}
      <div className="home-layout-grid">
        {/* Left: Feed & Discussions */}
        <div>
          {/* Latest Announcement Banner */}
          <div className="announcement-banner-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em' }}>
              <Bell size={14} /> LATEST CLUB ANNOUNCEMENT
            </div>
            <h4>Upcoming Session: Transformers & Deep Learning Architectures</h4>
            <p>
              Join us this Friday at 4:00 PM in Lab 402 for our weekly {currentCommunity.name} practical workshop session. Guest mentors attending!
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                className="btn-secondary" 
                style={{ color: '#D97706', fontWeight: 700 }}
                onClick={() => showToast(`Registered for ${currentCommunity.name} Session!`, 'success')}
              >
                Register Now
              </button>
              <button 
                className="btn-outline-primary" 
                style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                onClick={() => showToast('Calendar reminder set!', 'info')}
              >
                Set Reminder
              </button>
            </div>
          </div>

          {/* Discussion Input */}
          <form onSubmit={handlePostDiscussion} className="card" style={{ padding: 18, marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <img 
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                alt={user?.name}
                onClick={() => handleShowProfile(user?.name, user?.avatar, user?.role, user?.department)}
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                title="View your profile"
              />
              <input 
                type="text" 
                placeholder={`Start a discussion or share a resource in #${currentCommunity.name}...`}
                value={discussionText}
                onChange={(e) => setDiscussionText(e.target.value)}
                style={{ flex: 1, borderRadius: 'var(--radius-full)', background: 'var(--bg-page)' }}
              />
              <button 
                type="button" 
                className="composer-tool-btn" 
                onClick={() => showToast('Attach image to club post', 'info')}
                title="Attach Image"
              >
                <ImageIcon size={18} />
              </button>
              <button 
                type="button" 
                className="composer-tool-btn" 
                onClick={() => showToast('Attach document to club post', 'info')}
                title="Attach Document"
              >
                <Paperclip size={18} />
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>
                <Send size={16} />
              </button>
            </div>
          </form>

          {/* Community Discussion Feed */}
          {discussions.map(disc => (
            <article key={disc.id} className="post-card" style={{ marginBottom: 20 }}>
              {/* Clickable Profile Author Row */}
              <header className="post-header">
                <div 
                  className="post-author-row" 
                  onClick={() => handleShowProfile(disc.author, disc.avatar, 'STUDENT', 'Computer Science & Engineering')}
                  style={{ cursor: 'pointer', transition: 'opacity 0.15s ease' }}
                  title={`View ${disc.author}'s profile`}
                >
                  <img src={disc.avatar} alt={disc.author} className="post-author-avatar" />
                  <div className="post-author-info">
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{disc.author}</span>
                      <UserCheck size={14} color="var(--primary)" />
                    </h4>
                    <p>{disc.time} • {disc.category} in {currentCommunity.name}</p>
                  </div>
                </div>
              </header>

              <p className="post-content-body" style={{ marginTop: 8 }}>{disc.content}</p>

              {/* Clean Non-Overlapping Actions Footer */}
              <footer className="post-actions-footer">
                <div className="post-action-group">
                  {/* Like Button */}
                  <button 
                    type="button"
                    className={`post-action-btn ${disc.liked ? 'liked' : ''}`}
                    onClick={() => handleLikeDiscussion(disc.id)}
                    title={disc.liked ? 'Unlike' : 'Like'}
                  >
                    <Heart size={18} fill={disc.liked ? '#EF4444' : 'none'} color={disc.liked ? '#EF4444' : 'currentColor'} />
                    <span>{disc.likes}</span>
                  </button>

                  {/* Comment Button */}
                  <button 
                    type="button"
                    className="post-action-btn"
                    onClick={() => handleToggleComments(disc.id)}
                    title="View & Post Comments"
                  >
                    <MessageSquare size={18} />
                    <span>{(disc.commentsList ? disc.commentsList.length : disc.comments)} Comments</span>
                  </button>

                  {/* Share Button */}
                  <button 
                    type="button"
                    className="post-action-btn"
                    onClick={() => {
                      if (navigator.clipboard) navigator.clipboard.writeText(window.location.href);
                      showToast('Discussion link copied to clipboard!', 'info');
                    }}
                    title="Share discussion"
                  >
                    <Share2 size={18} />
                  </button>
                </div>

                {/* Save / Bookmark Button on Right */}
                <button 
                  type="button"
                  className={`post-action-btn ${savedDiscussions.has(disc.id) ? 'saved' : ''}`}
                  onClick={() => handleToggleSaveDiscussion(disc.id)}
                  title={savedDiscussions.has(disc.id) ? 'Saved' : 'Save discussion'}
                >
                  <Bookmark size={18} fill={savedDiscussions.has(disc.id) ? 'var(--primary)' : 'none'} color={savedDiscussions.has(disc.id) ? 'var(--primary)' : 'currentColor'} />
                  <span>{savedDiscussions.has(disc.id) ? 'Saved' : 'Save'}</span>
                </button>
              </footer>

              {/* Interactive Comments Drawer */}
              {expandedCommentsPostId === disc.id && (
                <div className="comments-section" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                  {/* Comment Form */}
                  <form 
                    onSubmit={(e) => handleAddComment(disc.id, e)} 
                    style={{ display: 'flex', gap: 10, marginBottom: 14 }}
                  >
                    <img 
                      src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                      alt={user?.name}
                      onClick={() => handleShowProfile(user?.name, user?.avatar, user?.role, user?.department)}
                      style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                      title="View your profile"
                    />
                    <input 
                      type="text" 
                      placeholder="Write a comment or question..."
                      value={commentInputs[disc.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [disc.id]: e.target.value })}
                      style={{ flex: 1, borderRadius: 'var(--radius-full)', background: 'var(--bg-page)', padding: '8px 16px', fontSize: '0.875rem' }}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>
                      <Send size={15} />
                    </button>
                  </form>

                  {/* Comments List */}
                  {(!disc.commentsList || disc.commentsList.length === 0) ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                      No comments yet. Be the first to share your thoughts!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {disc.commentsList.map(c => (
                        <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <img 
                            src={c.authorAvatar} 
                            alt={c.authorName} 
                            onClick={() => handleShowProfile(c.authorName, c.authorAvatar)}
                            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                            title={`View ${c.authorName}'s profile`}
                          />
                          <div style={{ background: 'var(--bg-page)', padding: '10px 14px', borderRadius: 'var(--radius-md)', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                              <strong 
                                onClick={() => handleShowProfile(c.authorName, c.authorAvatar)}
                                style={{ fontSize: '0.813rem', color: 'var(--text-main)', cursor: 'pointer' }}
                                title={`View ${c.authorName}'s profile`}
                              >
                                {c.authorName}
                              </strong>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{c.timeAgo}</span>
                            </div>
                            <p style={{ fontSize: '0.813rem', color: 'var(--text-body)', margin: 0 }}>{c.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Right Sidebar: About Community & Clickable Leadership Profiles */}
        <aside>
          {/* About Box */}
          <div className="widget-card" style={{ marginBottom: 24 }}>
            <div className="widget-header">
              <h3>About {currentCommunity.name}</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
              {currentCommunity.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.813rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag size={16} color="var(--primary)" />
                <span>Category: <strong>{currentCommunity.category}</strong></span>
              </div>
              {currentCommunity.meetingInfo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={16} color="var(--primary)" />
                  <span>{currentCommunity.meetingInfo}</span>
                </div>
              )}
            </div>

            {/* Tags chips */}
            {currentCommunity.tags && currentCommunity.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                {currentCommunity.tags.map(t => (
                  <span key={t} className="badge badge-student" style={{ fontSize: '0.7rem' }}>
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Lead Organizer & Moderators Box with Clickable Profiles */}
          <div className="widget-card" style={{ marginBottom: 24 }}>
            <div className="widget-header">
              <h3>Club Leadership & Advisors</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Leader / Advisor Profile Card */}
              <div 
                onClick={() => handleShowProfile(
                  currentCommunity.leaderName, 
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80',
                  'FACULTY',
                  currentCommunity.category,
                  'Lead Organizer / Advisor'
                )}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10, 
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-md)',
                  transition: 'background 0.15s ease'
                }}
                className="conversation-item"
                title={`Click to view ${currentCommunity.leaderName}'s profile`}
              >
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80" 
                  alt={currentCommunity.leaderName} 
                  style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div>
                  <h5 style={{ fontSize: '0.875rem', fontWeight: 700 }}>{currentCommunity.leaderName}</h5>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>Lead Organizer / Advisor</span>
                </div>
              </div>

              {/* Student Coordinator Profile Card */}
              <div 
                onClick={() => handleShowProfile(
                  'Ayesha Begum',
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80',
                  'STUDENT',
                  'Computer Science & Engineering',
                  'Student Coordinator'
                )}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10, 
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-md)',
                  transition: 'background 0.15s ease'
                }}
                className="conversation-item"
                title="Click to view Ayesha Begum's profile"
              >
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80" 
                  alt="Ayesha Begum" 
                  style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div>
                  <h5 style={{ fontSize: '0.875rem' }}>Ayesha Begum</h5>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student Coordinator</span>
                </div>
              </div>

              {/* Moderator Profile Card */}
              <div 
                onClick={() => handleShowProfile(
                  'Nafe Islam',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80',
                  'STUDENT',
                  'Software Engineering',
                  'Community Moderator'
                )}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10, 
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-md)',
                  transition: 'background 0.15s ease'
                }}
                className="conversation-item"
                title="Click to view Nafe Islam's profile"
              >
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80" 
                  alt="Nafe Islam" 
                  style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div>
                  <h5 style={{ fontSize: '0.875rem' }}>Nafe Islam</h5>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Community Moderator</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 14, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: '0.813rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Members</span>
              <strong>{currentCommunity.membersCount}</strong>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="widget-card">
            <div className="widget-header">
              <h3>Upcoming Club Events</h3>
            </div>

            <div className="widget-event-item">
              <div className="event-date-badge">
                <span className="event-date-month">OCT</span>
                <span className="event-date-day">24</span>
              </div>
              <div className="event-info-block">
                <h4>{currentCommunity.name} Sprint Kickoff</h4>
                <p>6:00 PM • Campus Hub</p>
              </div>
            </div>

            <button 
              className="view-all-online-btn" 
              style={{ marginTop: 12 }}
              onClick={() => setActiveView('events')}
            >
              View Calendar
            </button>
          </div>
        </aside>
      </div>

      {/* Modal: Create a Community */}
      <CreateCommunityModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCommunityCreated={handleCommunityCreated}
      />

      {/* Modal: View User Profile */}
      <UserProfileModal
        isOpen={!!viewingProfile}
        onClose={() => setViewingProfile(null)}
        profile={viewingProfile}
      />
    </div>
  );
};
