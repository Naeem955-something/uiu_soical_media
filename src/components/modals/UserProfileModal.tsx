import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  Code,
  Cpu, 
  EyeOff, 
  GraduationCap, 
  Lightbulb, 
  MessageSquare, 
  Send, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  Trophy, 
  User as UserIcon, 
  X 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

export type UserProfileData = Partial<Omit<User, 'role'>> & {
  name: string;
  avatar?: string;
  department?: string;
  role?: 'STUDENT' | 'FACULTY' | 'ADMIN' | 'ALUMNI' | string;
  studentId?: string;
  semester?: string;
  reputationScore?: number;
  bio?: string;
  cgpa?: number;
  hideCgpa?: boolean;
  skills?: string[];
  email?: string;
  communitiesJoined?: string[];
  featuredProject?: {
    title: string;
    description: string;
    link?: string;
    githubUrl?: string;
    stars?: number;
    tags?: string[];
    image?: string;
  };
  researchInterests?: string[];
  achievements?: string[];
  academicLevel?: string;
  major?: string;
};

export interface UserProfileModalProps {
  user?: User | null;
  profile?: UserProfileData | null;
  isOpen?: boolean;
  onClose: () => void;
  onFilterPostsByAuthor?: (authorName: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  user,
  profile,
  isOpen,
  onClose,
  onFilterPostsByAuthor 
}) => {
  const { user: currentUser, setActiveView, showToast, startConversationAndSendMessage } = useApp();

  if (isOpen !== undefined && !isOpen) return null;
  const profileUser = user || profile;
  if (!profileUser) return null;

  const isSelf = currentUser && (currentUser.id === profileUser.id || currentUser.name === profileUser.name);

  const handleSendMessage = () => {
    onClose();
    if (isSelf) {
      showToast('You are viewing your own profile', 'info');
      return;
    }
    // Start direct chat with this user
    startConversationAndSendMessage({
      recipientName: profileUser.name,
      recipientAvatar: profileUser.avatar,
      message: `Hi ${profileUser.name}, connecting with you on UniConnect!`
    }).then(() => {
      setActiveView('chat');
    });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/profile?user=${encodeURIComponent(profileUser.name)}`);
      showToast(`Link to ${profileUser.name}'s profile copied!`, 'info');
    }
  };

  const featuredProj = profileUser.featuredProject || {
    title: `${profileUser.name}'s Academic Research Project`,
    description: `Academic research and development project focused on ${profileUser.department || 'Computer Science'} initiatives.`,
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com',
    stars: 84
  };

  const researchList = profileUser.researchInterests && profileUser.researchInterests.length > 0 
    ? profileUser.researchInterests 
    : [
        { title: 'Academic Research', subtitle: profileUser.department || 'Applied Computing' },
        { title: 'Innovation & Design', subtitle: 'Distributed Systems & Tools' }
      ];

  const honorsList = profileUser.achievements && profileUser.achievements.length > 0
    ? profileUser.achievements
    : [
        { title: 'Campus Scholar', subtitle: 'Academic Excellence Award', date: '2025' },
        { title: 'Peer Mentor', subtitle: 'Student Academic Council', date: '2026' }
      ];

  const skillsList = profileUser.skills && profileUser.skills.length > 0
    ? profileUser.skills
    : ['Python', 'System Architecture', 'Algorithms', 'Research Analysis', 'Collaboration'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 660, maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
      >
        {/* Modal Top Header Bar */}
        <div style={{
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={18} color="#10B981" />
            <span style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              VERIFIED CAMPUS PROFILE
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button 
              className="nav-icon-btn" 
              style={{ width: 30, height: 30 }} 
              onClick={handleShare}
              title="Share Profile Link"
            >
              <Share2 size={16} />
            </button>
            <button 
              className="modal-close-btn" 
              onClick={onClose}
              style={{ width: 30, height: 30 }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Profile Body */}
        <div style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* 1. Hero Card */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.05) 0%, rgba(217, 119, 6, 0.01) 100%)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 20
          }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <img 
                src={profileUser.avatar} 
                alt={profileUser.name} 
                style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    {profileUser.name}
                  </h3>
                  <span className={`badge ${
                    profileUser.role === 'FACULTY' 
                      ? 'badge-faculty' 
                      : (profileUser.role as string) === 'CLUB' 
                      ? 'badge-club' 
                      : 'badge-student'
                  }`}>
                    {profileUser.role || 'STUDENT'}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {profileUser.major || profileUser.department || 'Computer Science'} • {profileUser.semester || 'Senior Standing'}
                </p>
                {profileUser.studentId && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginTop: 2 }}>
                    Campus ID: {profileUser.studentId}
                  </span>
                )}
              </div>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.688rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>REPUTATION</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {profileUser.reputationScore || 910} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 1000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {isSelf ? (
              <button 
                className="btn-primary" 
                style={{ flex: 1, padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onClick={() => {
                  onClose();
                  setActiveView('profile');
                }}
              >
                <UserIcon size={16} />
                <span>Go to My Profile & Settings</span>
              </button>
            ) : (
              <button 
                className="btn-primary" 
                style={{ flex: 1, padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onClick={handleSendMessage}
              >
                <MessageSquare size={16} />
                <span>Send Direct Message</span>
              </button>
            )}

            {onFilterPostsByAuthor && (
              <button 
                className="btn-secondary" 
                style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => {
                  onFilterPostsByAuthor(profileUser.name);
                  onClose();
                }}
              >
                <span>Posts by {profileUser.name.split(' ')[0]}</span>
              </button>
            )}
          </div>

          {/* Bio Block */}
          {profileUser.bio && (
            <div style={{
              background: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              fontSize: '0.875rem',
              color: 'var(--text-body)',
              lineHeight: 1.6
            }}>
              <strong style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                Biography
              </strong>
              {profileUser.bio}
            </div>
          )}

          {/* 2. Academic Standing & Privacy Box */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={18} color="#D97706" />
                <h4 style={{ fontSize: '0.938rem', fontWeight: 700, margin: 0 }}>Academic Standing</h4>
              </div>

              {/* CGPA display or Hidden status */}
              {profileUser.hideCgpa ? (
                <span className="cgpa-pill hidden" title="This student has marked their CGPA private">
                  <EyeOff size={13} /> CGPA Private
                </span>
              ) : (
                <span className="cgpa-pill" title="Cumulative Grade Point Average">
                  CGPA {profileUser.cgpa || 3.86}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>
              <span>Degree Progress</span>
              <span>{profileUser.creditsCompleted || 92} / {profileUser.totalCredits || 120} Credits Completed</span>
            </div>
            <div style={{ height: 7, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  background: 'var(--primary)', 
                  width: `${Math.min(100, ((profileUser.creditsCompleted || 92) / (profileUser.totalCredits || 120)) * 100)}%` 
                }} 
              />
            </div>
          </div>

          {/* 3. Skills Cluster */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Lightbulb size={16} color="#D97706" />
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>Skills & Expertise</h4>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skillsList.map((skill, i) => (
                <span 
                  key={i} 
                  className="skill-pill"
                  style={{
                    background: i % 3 === 0 ? '#FFFBEB' : i % 3 === 1 ? '#EFF6FF' : '#ECFDF5',
                    borderColor: i % 3 === 0 ? '#FDE68A' : i % 3 === 1 ? '#BFDBFE' : '#A7F3D0',
                    color: i % 3 === 0 ? '#B45309' : i % 3 === 1 ? '#1D4ED8' : '#047857',
                    fontSize: '0.78rem',
                    padding: '4px 10px'
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* 4. Featured Project Card */}
          <div style={{
            background: 'var(--bg-page)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: 16,
            display: 'flex',
            gap: 16,
            alignItems: 'center'
          }}>
            <img 
              src={featuredProj.image || "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=200&auto=format&fit=crop&q=80"} 
              alt={featuredProj.title} 
              style={{ width: 80, height: 70, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} 
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <span className="badge badge-new" style={{ fontSize: '0.65rem', padding: '1px 6px', marginBottom: 4, display: 'inline-block' }}>
                FEATURED WORK
              </span>
              <h5 style={{ fontSize: '0.938rem', fontWeight: 700, margin: '2px 0 4px 0' }}>{featuredProj.title}</h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                {featuredProj.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                <a 
                  href={featuredProj.githubUrl || "https://github.com"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  onClick={(e) => {
                    if (!featuredProj.githubUrl || featuredProj.githubUrl === '#') {
                      e.preventDefault();
                      showToast('Repository link', 'info');
                    }
                  }}
                >
                  <Code size={13} /> GitHub Repo
                </a>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Star size={12} color="#D97706" fill="#D97706" /> {featuredProj.stars || 84}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Research Interests & Achievements 2-Column */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Research */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Cpu size={16} color="#D97706" />
                <h5 style={{ fontSize: '0.813rem', fontWeight: 700, margin: 0 }}>Research Focus</h5>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {researchList.map((res, i) => (
                  <div key={i} style={{ borderLeft: '2px solid var(--primary)', paddingLeft: 8 }}>
                    <div style={{ fontSize: '0.813rem', fontWeight: 700 }}>{res.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{res.subtitle}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Honors */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Trophy size={16} color="#D97706" />
                <h5 style={{ fontSize: '0.813rem', fontWeight: 700, margin: 0 }}>Honors & Awards</h5>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {honorsList.map((ach, i) => (
                  <div key={i} style={{ borderLeft: '2px solid #059669', paddingLeft: 8 }}>
                    <div style={{ fontSize: '0.813rem', fontWeight: 700 }}>{ach.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ach.subtitle} • {ach.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'var(--bg-surface)'
        }}>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '6px 18px', fontSize: '0.85rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
