import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Code,
  Cpu, 
  Download, 
  Eye,
  EyeOff,
  GraduationCap,
  Lightbulb, 
  MessageSquare, 
  Pencil, 
  Plus, 
  Send, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  Trash2, 
  Trophy, 
  User as UserIcon, 
  X 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const DEFAULT_PROJECT = {
  title: 'Autonomous Drone Navigation',
  description: 'Developing a pathfinding algorithm for low-power micro-drones using LiDAR sensors and real-time obstacle avoidance.',
  image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500&auto=format&fit=crop&q=80',
  githubUrl: 'https://github.com',
  stars: 128
};

const DEFAULT_RESEARCH = [
  { title: 'Artificial Intelligence', subtitle: 'Neural network optimization' },
  { title: 'Robotics', subtitle: 'Swarm intelligence & edge computing' }
];

const DEFAULT_ACHIEVEMENTS = [
  { title: "Dean's List 2025", subtitle: 'Top 5% Academic Excellence', date: 'Dec 2025' },
  { title: 'Hackathon Winner', subtitle: 'Global Univ. Innovation Meet', date: 'May 2025' },
  { title: 'AWS Certified Cloud', subtitle: 'Credential: AWS-88219', date: 'Feb 2026' }
];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80'
];

export const ProfileView: React.FC = () => {
  const { user, setActiveView, showToast, updateUser, startConversationAndSendMessage } = useApp();

  // Full Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTab, setEditTab] = useState<'identity' | 'academic' | 'skills' | 'project' | 'research' | 'achievements'>('identity');

  // Form Fields State
  const [editName, setEditName] = useState(user.name);
  const [editAvatar, setEditAvatar] = useState(user.avatar);
  const [editStudentId, setEditStudentId] = useState(user.studentId || 'CS-2024-889');
  const [editDepartment, setEditDepartment] = useState(user.department || 'Computer Science');
  const [editMajor, setEditMajor] = useState(user.major || 'Artificial Intelligence & Software Systems');
  const [editSemester, setEditSemester] = useState(user.semester || 'Semester 6th');
  const [editReputation, setEditReputation] = useState<number>(user.reputationScore || 850);
  const [editBio, setEditBio] = useState(user.bio || 'Computer Science undergraduate passionate about distributed systems, machine intelligence, and open-source tooling.');

  // Academic Standing State
  const [editCgpa, setEditCgpa] = useState<number>(user.cgpa || 3.85);
  const [editHideCgpa, setEditHideCgpa] = useState<boolean>(user.hideCgpa || false);
  const [editCreditsCompleted, setEditCreditsCompleted] = useState<number>(user.creditsCompleted || 84);
  const [editTotalCredits, setEditTotalCredits] = useState<number>(user.totalCredits || 120);

  // Skills State
  const [editSkills, setEditSkills] = useState<string[]>(() => {
    return user.skills && user.skills.length > 0 
      ? user.skills 
      : ['Python', 'PyTorch', 'Data Structures & Algorithms', 'React.js', 'Distributed Systems', 'Docker'];
  });
  const [newSkillInput, setNewSkillInput] = useState('');

  // Featured Project State
  const [editProject, setEditProject] = useState(() => user.featuredProject || DEFAULT_PROJECT);

  // Research Interests State
  const [editResearch, setEditResearch] = useState(() => {
    return user.researchInterests && user.researchInterests.length > 0 ? user.researchInterests : DEFAULT_RESEARCH;
  });

  // Achievements State
  const [editAchievements, setEditAchievements] = useState(() => {
    return user.achievements && user.achievements.length > 0 ? user.achievements : DEFAULT_ACHIEVEMENTS;
  });

  // Message modal state
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [msgTopic, setMsgTopic] = useState('Project Collaboration');
  const [messageText, setMessageText] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Open Edit Modal with specified tab
  const handleOpenEdit = (tab: 'identity' | 'academic' | 'skills' | 'project' | 'research' | 'achievements' = 'identity') => {
    setEditName(user.name);
    setEditAvatar(user.avatar);
    setEditStudentId(user.studentId || 'CS-2024-889');
    setEditDepartment(user.department || 'Computer Science');
    setEditMajor(user.major || 'Artificial Intelligence & Software Systems');
    setEditSemester(user.semester || 'Semester 6th');
    setEditReputation(user.reputationScore || 850);
    setEditBio(user.bio || 'Computer Science undergraduate passionate about distributed systems, machine intelligence, and open-source tooling.');
    setEditCgpa(user.cgpa || 3.85);
    setEditHideCgpa(user.hideCgpa || false);
    setEditCreditsCompleted(user.creditsCompleted || 84);
    setEditTotalCredits(user.totalCredits || 120);
    setEditSkills(user.skills && user.skills.length > 0 ? user.skills : ['Python', 'PyTorch', 'Data Structures & Algorithms', 'React.js', 'Distributed Systems', 'Docker']);
    setEditProject(user.featuredProject || DEFAULT_PROJECT);
    setEditResearch(user.researchInterests && user.researchInterests.length > 0 ? user.researchInterests : DEFAULT_RESEARCH);
    setEditAchievements(user.achievements && user.achievements.length > 0 ? user.achievements : DEFAULT_ACHIEVEMENTS);
    setEditTab(tab);
    setIsEditModalOpen(true);
  };

  // Save All Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser({
      name: editName.trim() || user.name,
      avatar: editAvatar.trim() || user.avatar,
      studentId: editStudentId.trim(),
      department: editDepartment.trim(),
      major: editMajor.trim(),
      semester: editSemester.trim(),
      reputationScore: Number(editReputation) || 0,
      bio: editBio.trim(),
      cgpa: Number(editCgpa) || 0,
      hideCgpa: editHideCgpa,
      creditsCompleted: Number(editCreditsCompleted) || 0,
      totalCredits: Number(editTotalCredits) || 120,
      skills: editSkills,
      featuredProject: editProject,
      researchInterests: editResearch,
      achievements: editAchievements
    });
    setIsEditModalOpen(false);
  };

  // Quick 1-click CGPA visibility toggle
  const handleToggleCgpaPrivacy = () => {
    const nextHidden = !user.hideCgpa;
    updateUser({ hideCgpa: nextHidden });
    showToast(nextHidden ? 'CGPA is now hidden from public view' : 'CGPA is now visible on your public profile', 'info');
  };

  // Skill Add / Remove
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    const trimmed = newSkillInput.trim();
    if (!editSkills.includes(trimmed)) {
      setEditSkills([...editSkills, trimmed]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditSkills(editSkills.filter(s => s !== skillToRemove));
  };

  // Research Interests Add / Remove / Edit
  const handleAddResearch = () => {
    setEditResearch([...editResearch, { title: 'New Research Field', subtitle: 'Focus area & topics' }]);
  };

  const handleUpdateResearch = (index: number, field: 'title' | 'subtitle', val: string) => {
    const updated = [...editResearch];
    updated[index] = { ...updated[index], [field]: val };
    setEditResearch(updated);
  };

  const handleRemoveResearch = (index: number) => {
    setEditResearch(editResearch.filter((_, i) => i !== index));
  };

  // Achievements Add / Remove / Edit
  const handleAddAchievement = () => {
    setEditAchievements([...editAchievements, { title: 'Academic Recognition', subtitle: 'Awarding organization', date: '2026' }]);
  };

  const handleUpdateAchievement = (index: number, field: 'title' | 'subtitle' | 'date', val: string) => {
    const updated = [...editAchievements];
    updated[index] = { ...updated[index], [field]: val };
    setEditAchievements(updated);
  };

  const handleRemoveAchievement = (index: number) => {
    setEditAchievements(editAchievements.filter((_, i) => i !== index));
  };

  // Send Message handler
  const handleSendMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setIsSendingMsg(true);
    try {
      await startConversationAndSendMessage({
        recipientName: user.name,
        recipientAvatar: user.avatar,
        senderName: senderName.trim() || undefined,
        senderEmail: senderEmail.trim() || undefined,
        topic: msgTopic,
        message: messageText.trim()
      });
      setSentSuccess(true);
      setMessageText('');
    } catch {
      // toast shown in context
    } finally {
      setIsSendingMsg(false);
    }
  };

  const handleExportCV = () => {
    showToast('Academic Digital Twin CV exported as PDF!', 'success');
  };

  const handleShareProfile = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Verified profile link copied to clipboard!', 'info');
    }
  };

  const activeProject = user.featuredProject || DEFAULT_PROJECT;
  const activeResearch = user.researchInterests && user.researchInterests.length > 0 ? user.researchInterests : DEFAULT_RESEARCH;
  const activeAchievements = user.achievements && user.achievements.length > 0 ? user.achievements : DEFAULT_ACHIEVEMENTS;
  const activeSkills = user.skills && user.skills.length > 0 
    ? user.skills 
    : ['Python', 'PyTorch', 'Data Structures & Algorithms', 'React.js', 'Distributed Systems', 'Docker'];

  return (
    <div className="profile-page-container">
      {/* 1. Profile Hero Card */}
      <div className="profile-hero-card">
        <div className="profile-identity-group">
          <div style={{ position: 'relative' }}>
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="profile-avatar-large" 
            />
            <button
              className="nav-icon-btn"
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 28,
                height: 28,
                background: 'var(--primary)',
                color: 'white',
                border: '2px solid white',
                borderRadius: '50%'
              }}
              onClick={() => handleOpenEdit('identity')}
              title="Change avatar photo"
              aria-label="Edit avatar"
            >
              <Pencil size={13} />
            </button>
          </div>

          <div className="profile-identity-text">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ margin: 0 }}>{user.name}</h2>
              <button
                className="section-edit-btn"
                onClick={() => handleOpenEdit('identity')}
                title="Edit Identity Info"
              >
                <Pencil size={13} /> Edit
              </button>
            </div>
            <p style={{ margin: '4px 0 6px 0' }}>
              {user.major || user.department || 'Computer Science'} • {user.semester || 'Semester 6th'} • ID: {user.studentId || 'CS-2024-889'}
            </p>
            {user.bio && (
              <p style={{ color: 'var(--text-body)', fontSize: '0.875rem', maxWidth: 620, lineHeight: 1.5, margin: 0 }}>
                {user.bio}
              </p>
            )}
          </div>
        </div>

        <div className="profile-reputation-group">
          <div className="reputation-box">
            <div className="reputation-label">REPUTATION SCORE</div>
            <div className="reputation-number">
              {user.reputationScore || 850} <span>/ 1000</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              className="btn-primary"
              style={{ borderRadius: 'var(--radius-full)', padding: '12px 22px', display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={() => setIsMessageModalOpen(true)}
            >
              <MessageSquare size={18} />
              <span>Send Message</span>
            </button>

            <button 
              className="btn-secondary"
              style={{ borderRadius: 'var(--radius-full)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={() => handleOpenEdit('identity')}
            >
              <Pencil size={16} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Academic Standing & Expertise Row */}
      <div className="profile-twin-grid">
        {/* Academic Standing Card */}
        <div className="standing-card">
          <div className="standing-header">
            <h3>
              <Award size={20} color="#D97706" />
              Academic Standing
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* CGPA Display or Hidden Pill */}
              {user.hideCgpa ? (
                <span className="cgpa-pill hidden" title="CGPA is hidden from public view">
                  <EyeOff size={13} /> CGPA Hidden
                </span>
              ) : (
                <span className="cgpa-pill" title="Cumulative Grade Point Average">
                  CGPA {user.cgpa || 3.85}
                </span>
              )}

              {/* 1-Click Quick Toggle for CGPA Privacy */}
              <button 
                className="cgpa-toggle-btn"
                onClick={handleToggleCgpaPrivacy}
                title={user.hideCgpa ? "Click to make CGPA visible" : "Click to hide CGPA"}
                aria-label="Toggle CGPA Privacy"
              >
                {user.hideCgpa ? <Eye size={12} /> : <EyeOff size={12} />}
                <span>{user.hideCgpa ? 'Show' : 'Hide'}</span>
              </button>

              <button
                className="section-edit-btn"
                onClick={() => handleOpenEdit('academic')}
                title="Edit Academic Standing"
              >
                <Pencil size={13} />
              </button>
            </div>
          </div>

          <div className="progress-banner-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                DEGREE PROGRESS
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                {Math.round(((user.creditsCompleted || 84) / (user.totalCredits || 120)) * 100)}% Complete
              </span>
            </div>

            <div className="credits-counter">
              {user.creditsCompleted || 84} <span>/ {user.totalCredits || 120} Credits</span>
            </div>

            <div className="credits-progress-track">
              <div 
                className="credits-progress-bar"
                style={{ width: `${Math.min(100, ((user.creditsCompleted || 84) / (user.totalCredits || 120)) * 100)}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Expertise / Skills Card */}
        <div className="standing-card">
          <div className="standing-header">
            <h3>
              <Lightbulb size={20} color="#D97706" />
              Expertise & Skills
            </h3>
            <button
              className="section-edit-btn"
              onClick={() => handleOpenEdit('skills')}
              title="Edit Skills & Tags"
            >
              <Pencil size={13} /> Edit
            </button>
          </div>

          <div className="skills-tags-cluster">
            {activeSkills.map((skill, index) => (
              <span 
                key={skill + index} 
                className="skill-pill"
                style={{
                  background: index % 3 === 0 ? '#FFFBEB' : index % 3 === 1 ? '#EFF6FF' : '#ECFDF5',
                  borderColor: index % 3 === 0 ? '#FDE68A' : index % 3 === 1 ? '#BFDBFE' : '#A7F3D0',
                  color: index % 3 === 0 ? '#B45309' : index % 3 === 1 ? '#1D4ED8' : '#047857'
                }}
              >
                {index === 0 ? '<> ' : index === 1 ? '⤢ ' : index === 2 ? '🔍 ' : '✦ '}
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Featured Project & Research Interests Row */}
      <div className="profile-twin-grid">
        {/* Featured Project Card */}
        <div className="featured-project-card">
          <div className="project-thumbnail">
            <img 
              src={activeProject.image || "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500&auto=format&fit=crop&q=80"} 
              alt={activeProject.title} 
            />
          </div>

          <div className="project-details-wrap">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-new" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                FEATURED PROJECT
              </span>
              <button
                className="section-edit-btn"
                onClick={() => handleOpenEdit('project')}
                title="Edit Featured Project"
              >
                <Pencil size={13} /> Edit
              </button>
            </div>
            <h4>{activeProject.title}</h4>
            <p>{activeProject.description}</p>
            <a 
              href={activeProject.githubUrl || "https://github.com"} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="project-github-link"
              onClick={(e) => {
                if (!activeProject.githubUrl || activeProject.githubUrl === '#') {
                  e.preventDefault();
                  showToast('Sample repository link', 'info');
                }
              }}
            >
              <Code size={16} />
              <span>GitHub Repository</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, marginLeft: 8, color: 'var(--text-muted)' }}>
                <Star size={14} color="#D97706" fill="#D97706" /> {activeProject.stars || 128}
              </span>
            </a>
          </div>
        </div>

        {/* Research Interests Card */}
        <div className="standing-card">
          <div className="standing-header">
            <h3>
              <Cpu size={20} color="#D97706" />
              Research Interests
            </h3>
            <button
              className="section-edit-btn"
              onClick={() => handleOpenEdit('research')}
              title="Edit Research Interests"
            >
              <Pencil size={13} /> Edit
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeResearch.map((res, i) => (
              <div 
                key={i}
                style={{
                  background: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14
                }}
              >
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-md)',
                  background: i % 2 === 0 ? '#FFFBEB' : '#ECFDF5',
                  color: i % 2 === 0 ? '#D97706' : '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {i % 2 === 0 ? <Cpu size={20} /> : <Sparkles size={20} />}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h5 style={{ fontSize: '0.938rem', fontWeight: 700, margin: 0 }}>{res.title}</h5>
                  <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>{res.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Achievements & Honors Card */}
      <div className="card" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Trophy size={20} color="#D97706" />
            Achievements & Honors
          </h3>
          <button
            className="section-edit-btn"
            onClick={() => handleOpenEdit('achievements')}
            title="Edit Achievements"
          >
            <Pencil size={13} /> Edit All
          </button>
        </div>

        <div className="achievements-grid">
          {activeAchievements.map((ach, i) => (
            <div key={i} className="achievement-card">
              <div 
                className="achievement-icon-circle"
                style={{
                  background: i === 0 ? '#FFFBEB' : i === 1 ? '#ECFDF5' : '#EFF6FF',
                  color: i === 0 ? '#D97706' : i === 1 ? '#059669' : '#1D4ED8'
                }}
              >
                {i === 0 ? <Award size={20} /> : i === 1 ? <Trophy size={20} /> : <CheckCircle2 size={20} />}
              </div>
              <div>
                <h5 style={{ fontSize: '0.938rem', fontWeight: 700, margin: 0 }}>{ach.title}</h5>
                <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', margin: '2px 0' }}>
                  {ach.subtitle}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{ach.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Public Message & Inquiry Option */}
      <div className="card" style={{ marginBottom: 32, background: 'linear-gradient(135deg, #FFFDF9 0%, #FFFBEB 100%)', borderColor: '#FDE68A' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: 'var(--text-main)' }}>
              <MessageSquare size={22} color="var(--primary)" />
              Send a Message to {user.name}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: 600, lineHeight: 1.5, margin: 0 }}>
              Anyone on campus can reach out with project collaboration proposals, coursework questions, or academic inquiries. Direct messages are delivered in real time to this profile's UniConnect chat inbox.
            </p>
          </div>
          <button
            className="btn-primary"
            style={{ borderRadius: 'var(--radius-full)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => setIsMessageModalOpen(true)}
          >
            <Send size={16} />
            <span>Compose Message</span>
          </button>
        </div>
      </div>

      {/* 6. Comprehensive Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Pencil size={20} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Edit Campus Profile</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Tab navigation inside modal */}
            <div className="profile-tab-bar" style={{ padding: '0 24px', borderBottom: '1px solid var(--border-color)' }}>
              <button 
                type="button" 
                className={`profile-tab-item ${editTab === 'identity' ? 'active' : ''}`}
                onClick={() => setEditTab('identity')}
              >
                <UserIcon size={14} /> Identity
              </button>
              <button 
                type="button" 
                className={`profile-tab-item ${editTab === 'academic' ? 'active' : ''}`}
                onClick={() => setEditTab('academic')}
              >
                <GraduationCap size={14} /> Academic & CGPA
              </button>
              <button 
                type="button" 
                className={`profile-tab-item ${editTab === 'skills' ? 'active' : ''}`}
                onClick={() => setEditTab('skills')}
              >
                <Lightbulb size={14} /> Skills
              </button>
              <button 
                type="button" 
                className={`profile-tab-item ${editTab === 'project' ? 'active' : ''}`}
                onClick={() => setEditTab('project')}
              >
                <Code size={14} /> Project
              </button>
              <button 
                type="button" 
                className={`profile-tab-item ${editTab === 'research' ? 'active' : ''}`}
                onClick={() => setEditTab('research')}
              >
                <Cpu size={14} /> Research
              </button>
              <button 
                type="button" 
                className={`profile-tab-item ${editTab === 'achievements' ? 'active' : ''}`}
                onClick={() => setEditTab('achievements')}
              >
                <Trophy size={14} /> Honors
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
              <div className="modal-body" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* TAB 1: IDENTITY */}
                {editTab === 'identity' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Full Name *</label>
                        <input 
                          type="text" 
                          value={editName} 
                          onChange={(e) => setEditName(e.target.value)} 
                          required 
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Student ID *</label>
                        <input 
                          type="text" 
                          value={editStudentId} 
                          onChange={(e) => setEditStudentId(e.target.value)} 
                          placeholder="e.g. CS-2024-889"
                          required 
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Avatar Image URL</label>
                      <input 
                        type="url" 
                        value={editAvatar} 
                        onChange={(e) => setEditAvatar(e.target.value)} 
                        placeholder="https://..." 
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick presets:</span>
                        {AVATAR_PRESETS.map((p, idx) => (
                          <img 
                            key={idx} 
                            src={p} 
                            alt={`Preset ${idx + 1}`}
                            onClick={() => setEditAvatar(p)}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              cursor: 'pointer',
                              border: editAvatar === p ? '2px solid var(--primary)' : '1px solid var(--border-color)'
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Department</label>
                        <input 
                          type="text" 
                          value={editDepartment} 
                          onChange={(e) => setEditDepartment(e.target.value)} 
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Major / Track</label>
                        <input 
                          type="text" 
                          value={editMajor} 
                          onChange={(e) => setEditMajor(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Semester</label>
                        <input 
                          type="text" 
                          value={editSemester} 
                          onChange={(e) => setEditSemester(e.target.value)} 
                          placeholder="e.g. Semester 6th"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Reputation Score (0 - 1000)</label>
                        <input 
                          type="number" 
                          min={0}
                          max={1000}
                          value={editReputation} 
                          onChange={(e) => setEditReputation(Number(e.target.value))} 
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Biography</label>
                      <textarea 
                        rows={3} 
                        value={editBio} 
                        onChange={(e) => setEditBio(e.target.value)} 
                        placeholder="Write a brief academic bio..." 
                      />
                    </div>
                  </>
                )}

                {/* TAB 2: ACADEMIC & CGPA PRIVACY */}
                {editTab === 'academic' && (
                  <>
                    <div style={{
                      background: 'rgba(217, 119, 6, 0.06)',
                      border: '1px solid rgba(217, 119, 6, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      padding: 14,
                      marginBottom: 8
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <strong style={{ fontSize: '0.938rem', color: 'var(--text-main)', display: 'block', marginBottom: 2 }}>
                            Hide CGPA from Public Profile
                          </strong>
                          <span style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>
                            When enabled, visitors will see "CGPA Hidden 🔒" instead of your actual score.
                          </span>
                        </div>
                        <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={editHideCgpa} 
                            onChange={(e) => setEditHideCgpa(e.target.checked)}
                            style={{ width: 20, height: 20, cursor: 'pointer', accentColor: 'var(--primary)' }}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                        Cumulative GPA (CGPA) *
                      </label>
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        max="4.00" 
                        value={editCgpa} 
                        onChange={(e) => setEditCgpa(Number(e.target.value))} 
                        required 
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Credits Completed</label>
                        <input 
                          type="number" 
                          min={0}
                          value={editCreditsCompleted} 
                          onChange={(e) => setEditCreditsCompleted(Number(e.target.value))} 
                          required 
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Total Degree Credits</label>
                        <input 
                          type="number" 
                          min={1}
                          value={editTotalCredits} 
                          onChange={(e) => setEditTotalCredits(Number(e.target.value))} 
                          required 
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 3: SKILLS */}
                {editTab === 'skills' && (
                  <>
                    <div>
                      <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                        Add New Skill Tag
                      </label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input 
                          type="text" 
                          placeholder="e.g. Next.js, TensorFlow, Linear Algebra" 
                          value={newSkillInput} 
                          onChange={(e) => setNewSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSkill();
                            }
                          }}
                        />
                        <button type="button" className="btn-secondary" onClick={handleAddSkill}>
                          <Plus size={16} /> Add
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 8 }}>
                        Current Skills ({editSkills.length})
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {editSkills.map(skill => (
                          <span 
                            key={skill}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '5px 12px',
                              background: '#FFFBEB',
                              border: '1px solid #FDE68A',
                              color: '#B45309',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.813rem',
                              fontWeight: 600
                            }}
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B45309', padding: 0 }}
                              title="Remove skill"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 4: FEATURED PROJECT */}
                {editTab === 'project' && (
                  <>
                    <div>
                      <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Project Title</label>
                      <input 
                        type="text" 
                        value={editProject.title} 
                        onChange={(e) => setEditProject({ ...editProject, title: e.target.value })} 
                        required 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Project Description</label>
                      <textarea 
                        rows={3} 
                        value={editProject.description} 
                        onChange={(e) => setEditProject({ ...editProject, description: e.target.value })} 
                        required 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Thumbnail Image URL</label>
                      <input 
                        type="url" 
                        value={editProject.image || ''} 
                        onChange={(e) => setEditProject({ ...editProject, image: e.target.value })} 
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>GitHub Repository URL</label>
                        <input 
                          type="url" 
                          value={editProject.githubUrl || ''} 
                          onChange={(e) => setEditProject({ ...editProject, githubUrl: e.target.value })} 
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Stars Count</label>
                        <input 
                          type="number" 
                          min={0}
                          value={editProject.stars || 0} 
                          onChange={(e) => setEditProject({ ...editProject, stars: Number(e.target.value) })} 
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 5: RESEARCH INTERESTS */}
                {editTab === 'research' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.813rem', fontWeight: 700 }}>Research Focus Areas ({editResearch.length})</span>
                      <button type="button" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={handleAddResearch}>
                        <Plus size={14} /> Add Interest
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {editResearch.map((res, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg-page)', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <input 
                              type="text" 
                              value={res.title} 
                              onChange={(e) => handleUpdateResearch(i, 'title', e.target.value)} 
                              placeholder="Title (e.g. Machine Learning)" 
                              required 
                            />
                            <input 
                              type="text" 
                              value={res.subtitle} 
                              onChange={(e) => handleUpdateResearch(i, 'subtitle', e.target.value)} 
                              placeholder="Subfield / Description" 
                              required 
                            />
                          </div>
                          <button 
                            type="button" 
                            style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: 4 }} 
                            onClick={() => handleRemoveResearch(i)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* TAB 6: ACHIEVEMENTS */}
                {editTab === 'achievements' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.813rem', fontWeight: 700 }}>Honors & Certifications ({editAchievements.length})</span>
                      <button type="button" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={handleAddAchievement}>
                        <Plus size={14} /> Add Honor
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {editAchievements.map((ach, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg-page)', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: 8 }}>
                            <input 
                              type="text" 
                              value={ach.title} 
                              onChange={(e) => handleUpdateAchievement(i, 'title', e.target.value)} 
                              placeholder="Award / Title" 
                              required 
                            />
                            <input 
                              type="text" 
                              value={ach.subtitle} 
                              onChange={(e) => handleUpdateAchievement(i, 'subtitle', e.target.value)} 
                              placeholder="Organization / Subtitle" 
                              required 
                            />
                            <input 
                              type="text" 
                              value={ach.date} 
                              onChange={(e) => handleUpdateAchievement(i, 'date', e.target.value)} 
                              placeholder="Date (e.g. Dec 2025)" 
                              required 
                            />
                          </div>
                          <button 
                            type="button" 
                            style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: 4 }} 
                            onClick={() => handleRemoveAchievement(i)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {isMessageModalOpen && (
        <div className="modal-overlay" onClick={() => { setIsMessageModalOpen(false); setSentSuccess(false); }}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Message {user.name}</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {user.department || user.major} • Open for messages from anyone
                  </span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => { setIsMessageModalOpen(false); setSentSuccess(false); }}>
                <X size={20} />
              </button>
            </div>

            {sentSuccess ? (
              <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: 8 }}>Message Sent Successfully!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24, maxWidth: 420, margin: '0 auto 24px auto', lineHeight: 1.5 }}>
                  Your message has been delivered to <strong>{user.name}</strong>. It is now saved in their UniConnect inbox and alerts.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setSentSuccess(false);
                      setIsMessageModalOpen(false);
                    }}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      setSentSuccess(false);
                      setIsMessageModalOpen(false);
                      setActiveView('chat');
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <MessageSquare size={16} />
                    <span>Open in Chat</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendMessageSubmit}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name (e.g. Fellow Student / Dr. Smith)"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      Your Contact Email / Student ID <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional for replies)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. sender@university.edu or U-12345"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      Topic / Subject
                    </label>
                    <select
                      value={msgTopic}
                      onChange={(e) => setMsgTopic(e.target.value)}
                    >
                      <option value="Project Collaboration">🚀 Project Collaboration</option>
                      <option value="Coursework & Study Help">📚 Coursework & Study Help</option>
                      <option value="Research Discussion">🔬 Research Discussion</option>
                      <option value="Campus Organization / Club">🏛️ Campus Organization / Club</option>
                      <option value="General Question">💬 General Question</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      Quick Starters
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                      {[
                        "👋 Hi, interested in collaborating on a project with you!",
                        "📚 Quick question about course materials and study resources.",
                        "☕ Would love to connect regarding campus research."
                      ].map((prompt, i) => (
                        <button
                          key={i}
                          type="button"
                          style={{
                            fontSize: '0.75rem',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-page)',
                            color: 'var(--text-body)',
                            cursor: 'pointer'
                          }}
                          onClick={() => setMessageText(prompt)}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>

                    <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      Message Content
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Type your message here..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      required
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsMessageModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSendingMsg || !messageText.trim()}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Send size={16} />
                    <span>{isSendingMsg ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 7. Verification Footer */}
      <footer className="profile-verification-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={16} color="#10B981" />
          <span>Profile verified and synced with UniConnect Academic Ledger</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button 
            style={{ color: 'var(--text-muted)', fontSize: '0.813rem' }} 
            onClick={() => handleOpenEdit('academic')}
          >
            Privacy Settings
          </button>
          <button 
            style={{ color: 'var(--text-muted)', fontSize: '0.813rem', display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={handleExportCV}
          >
            <Download size={14} /> Export CV
          </button>
          <button 
            style={{ color: 'var(--text-muted)', fontSize: '0.813rem', display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={handleShareProfile}
          >
            <Share2 size={14} /> Share Profile
          </button>
        </div>
      </footer>
    </div>
  );
};
