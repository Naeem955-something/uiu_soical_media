import React, { useState } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Clock, 
  FileText, 
  Image as ImageIcon, 
  BarChart2, 
  Send,
  X,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Post } from '../types';
import { triggerDownload, sanitizeFileName, inferExtension } from '../utils/fileUtils';

export const HomeView: React.FC = () => {
  const { 
    posts, 
    user, 
    likePost, 
    votePoll, 
    addComment, 
    setIsCreatePostModalOpen, 
    setActiveView,
    showToast,
    openUserProfile,
    filterAuthorName,
    setFilterAuthorName
  } = useApp();

  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentInputTexts, setCommentInputTexts] = useState<{ [postId: string]: string }>({});

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputTexts[postId] || '';
    if (text.trim()) {
      addComment(postId, text);
      setCommentInputTexts(prev => ({ ...prev, [postId]: '' }));
    }
  };

  const handleShare = (title?: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast(`Link to "${title || 'Campus Post'}" copied!`, 'info');
    }
  };

  const handleAttachmentDownload = (post: Post) => {
    const att = post.fileAttachment;
    if (!att) return;
    const ext = att.extension || inferExtension(att.name, '.txt');
    const fileName = sanitizeFileName(att.name, `attachment_${post.id}${ext}`);
    if (att.fileData) {
      triggerDownload(fileName, att.fileData, { asBase64: true, mimeType: att.mimeType || undefined });
    } else {
      const content = [
        `# ${att.name}`,
        `From post by ${post.authorName} (${post.authorDepartment})`,
        `Posted: ${post.timeAgo}`,
        '',
        post.content
      ].join('\n');
      const mime = ext === '.pdf' ? 'application/pdf' : ext === '.md' ? 'text/markdown' : 'text/plain';
      const actualName = fileName.endsWith(ext) ? fileName : `${fileName}${ext === '.pdf' ? '.txt' : ext}`;
      triggerDownload(actualName, content, { mimeType: mime });
    }
    showToast(`Downloaded ${att.name}`, 'success');
  };

  const resolvePostImage = (post: Post): string | undefined => {
    return post.imageDataUrl || post.image;
  };

  const displayedPosts = filterAuthorName 
    ? posts.filter(p => p.authorName.toLowerCase() === filterAuthorName.toLowerCase())
    : posts;

  const ONLINE_USERS = [
    { name: 'Amena Akter', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', dept: 'Software Engineering', badge: 'STUDENT' },
    { name: 'Saidul Islam', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', dept: 'Data Science', badge: 'STUDENT' },
    { name: 'Fahima Tonni', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80', dept: 'Electrical Engineering', badge: 'STUDENT' },
    { name: 'Tanvir Sarker', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80', dept: 'Computer Science', badge: 'STUDENT' }
  ];

  return (
    <div className="home-layout-grid">
      {/* Left Column: Post Composer & Main Feed */}
      <div className="feed-column">
        {/* Post Composer Card */}
        <div className="post-composer-card">
          <div className="composer-top">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="composer-avatar"
              style={{ cursor: 'pointer' }}
              onClick={() => openUserProfile(user)}
              title="Click to view your profile"
            />
            <div 
              className="composer-input-placeholder"
              onClick={() => setIsCreatePostModalOpen(true)}
            >
              What's happening in your academic world?
            </div>
          </div>

          <div className="composer-actions-bar">
            <div className="composer-buttons-group">
              <button 
                type="button" 
                className="composer-tool-btn"
                onClick={() => setIsCreatePostModalOpen(true)}
              >
                <ImageIcon size={18} color="#D97706" />
                <span>Image</span>
              </button>
              <button 
                type="button" 
                className="composer-tool-btn"
                onClick={() => setIsCreatePostModalOpen(true)}
              >
                <BarChart2 size={18} color="#10B981" />
                <span>Poll</span>
              </button>
              <button 
                type="button" 
                className="composer-tool-btn"
                onClick={() => setIsCreatePostModalOpen(true)}
              >
                <FileText size={18} color="#3B82F6" />
                <span>File</span>
              </button>
            </div>

            <button 
              type="button" 
              className="btn-primary"
              style={{ padding: '8px 22px', borderRadius: 'var(--radius-full)' }}
              onClick={() => setIsCreatePostModalOpen(true)}
            >
              Post
            </button>
          </div>
        </div>

        {/* Filter by Author Active Banner */}
        {filterAuthorName && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(217, 119, 6, 0.08)',
            border: '1px solid rgba(217, 119, 6, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            marginBottom: 20,
            fontSize: '0.875rem',
            color: '#B45309'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={16} />
              <span>
                Showing posts created by <strong>{filterAuthorName}</strong> ({displayedPosts.length} found)
              </span>
            </div>
            <button 
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 12px' }}
              onClick={() => setFilterAuthorName(null)}
            >
              Clear Filter (Show All Posts)
            </button>
          </div>
        )}

        {/* Dynamic Feed Posts */}
        {displayedPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>
              {filterAuthorName ? `No posts found by ${filterAuthorName}` : 'No posts yet'}
            </p>
            <p style={{ fontSize: '0.875rem', marginBottom: 16 }}>
              {filterAuthorName ? 'Click the button below to view all posts from the campus community.' : 'Be the first to share an update with your campus community!'}
            </p>
            {filterAuthorName && (
              <button className="btn-secondary" onClick={() => setFilterAuthorName(null)}>
                Show All Community Posts
              </button>
            )}
          </div>
        ) : (
          displayedPosts.map(post => (
          <article key={post.id} className="post-card">
            <header className="post-header">
              <div 
                className="post-author-row"
                onClick={() => openUserProfile({
                  name: post.authorName,
                  avatar: post.authorAvatar,
                  department: post.authorDepartment,
                  badge: post.authorBadge,
                  id: (post as any).authorId
                })}
                title={`Click to view ${post.authorName}'s Campus Profile`}
              >
                <img 
                  src={post.authorAvatar} 
                  alt={post.authorName} 
                  className="post-author-avatar" 
                />
                <div className="post-author-info">
                  <h4>
                    <span className="post-author-name-link">{post.authorName}</span>
                    {post.authorBadge && (
                      <span className={`badge ${
                        post.authorBadge === 'FACULTY' 
                          ? 'badge-faculty' 
                          : post.authorBadge === 'CLUB' 
                          ? 'badge-club' 
                          : 'badge-student'
                      }`}>
                        {post.authorBadge}
                      </span>
                    )}
                  </h4>
                  <p>{post.authorDepartment} • {post.timeAgo}</p>
                </div>
              </div>
            </header>

            {post.title && (
              <h3 className="post-title-text">{post.title}</h3>
            )}

            <p className="post-content-body">{post.content}</p>

            {/* Attached PDF / File */}
            {post.fileAttachment && (
              <div className="file-attachment-box">
                <div className="file-info-left">
                  <FileText size={20} color="#D97706" />
                  <span>{post.fileAttachment.name}</span>
                </div>
                <button 
                  className="file-download-link"
                  onClick={() => handleAttachmentDownload(post)}
                >
                  Download
                </button>
              </div>
            )}

            {/* Embedded Photo */}
            {resolvePostImage(post) && (
              <div className="post-image-container">
                <img src={resolvePostImage(post)} alt="Post media" />
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="post-tags-row">
                {post.tags.map(tag => (
                  <span key={tag} className="post-tag">{tag}</span>
                ))}
              </div>
            )}

            {/* Interactive Poll */}
            {post.poll && (
              <div className="poll-container">
                {post.poll.options.map(option => {
                  const hasVoted = post.poll?.userVotedOptionId !== undefined;
                  const isSelected = post.poll?.userVotedOptionId === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      className="poll-option-btn"
                      onClick={() => votePoll(post.id, option.id)}
                      disabled={hasVoted}
                      style={{
                        borderColor: isSelected ? 'var(--primary)' : undefined,
                        borderWidth: isSelected ? 2 : 1
                      }}
                    >
                      <div 
                        className="poll-progress-fill" 
                        style={{ width: `${option.percentage}%` }} 
                      />
                      <div className="poll-option-content">
                        <span>{option.label}</span>
                        <span style={{ fontWeight: 700 }}>{option.percentage}%</span>
                      </div>
                    </button>
                  );
                })}

                <div className="poll-meta-text">
                  {post.poll.totalVotes.toLocaleString()} votes • {post.poll.endsIn}
                </div>
              </div>
            )}

            {/* Post Actions Footer */}
            <footer className="post-actions-footer">
              <div className="post-action-group">
                <button 
                  className={`post-action-btn ${post.userLiked ? 'liked' : ''}`}
                  onClick={() => likePost(post.id)}
                  aria-label="Like post"
                >
                  <Heart size={18} fill={post.userLiked ? 'currentColor' : 'none'} />
                  <span>{post.likes}</span>
                </button>

                <button 
                  className="post-action-btn"
                  onClick={() => setExpandedCommentsPostId(
                    expandedCommentsPostId === post.id ? null : post.id
                  )}
                  aria-label="Comments"
                >
                  <MessageSquare size={18} />
                  <span>{post.commentsCount}</span>
                </button>

                <button 
                  className="post-action-btn"
                  onClick={() => handleShare(post.title || post.content.substring(0, 30))}
                  aria-label="Share post"
                >
                  <Share2 size={18} />
                </button>
              </div>

              {post.actionButton && (
                <button 
                  className="btn-primary"
                  style={{ padding: '6px 18px', fontSize: '0.85rem' }}
                  onClick={() => {
                    setActiveView('events');
                    showToast('Navigated to Events registration', 'info');
                  }}
                >
                  {post.actionButton.label}
                </button>
              )}
            </footer>

            {/* Expandable Comments Drawer */}
            {expandedCommentsPostId === post.id && (
              <div className="comments-section">
                <form 
                  onSubmit={(e) => handleCommentSubmit(post.id, e)} 
                  className="comment-input-row"
                >
                  <input 
                    type="text" 
                    placeholder="Write a comment or question..."
                    value={commentInputTexts[post.id] || ''}
                    onChange={(e) => setCommentInputTexts({ ...commentInputTexts, [post.id]: e.target.value })}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '8px 14px' }}>
                    <Send size={16} />
                  </button>
                </form>

                {post.commentsList && post.commentsList.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <img 
                      src={comment.authorAvatar} 
                      alt={comment.authorName} 
                      style={{ cursor: 'pointer' }}
                      onClick={() => openUserProfile({ name: comment.authorName, avatar: comment.authorAvatar })}
                      title={`Click to view ${comment.authorName}'s Profile`}
                    />
                    <div className="comment-bubble">
                      <div className="comment-author">
                        <span 
                          className="comment-author-name-link"
                          onClick={() => openUserProfile({ name: comment.authorName, avatar: comment.authorAvatar })}
                          title={`Click to view ${comment.authorName}'s Profile`}
                        >
                          {comment.authorName}
                        </span>
                        <span className="comment-time">{comment.timeAgo}</span>
                      </div>
                      <div>{comment.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        )))}
      </div>

      {/* Right Column: Widgets */}
      <aside className="home-widgets-column">
        {/* Upcoming Events Card */}
        <div className="widget-card">
          <div className="widget-header">
            <h3>Upcoming Events</h3>
            <button className="widget-see-all" onClick={() => setActiveView('events')}>
              See all
            </button>
          </div>

          <div className="widget-event-item">
            <div className="event-date-badge">
              <span className="event-date-month">OCT</span>
              <span className="event-date-day">24</span>
            </div>
            <div className="event-info-block">
              <h4>Hackathon 2026</h4>
              <p>Main Engineering Hall</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <div style={{ display: 'flex', marginLeft: -2 }}>
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" 
                    alt="Attendee" 
                    style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid white' }} 
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50" 
                    alt="Attendee" 
                    style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid white', marginLeft: -4 }} 
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>+120 joined</span>
              </div>
            </div>
          </div>

          <div className="widget-event-item">
            <div className="event-date-badge">
              <span className="event-date-month">NOV</span>
              <span className="event-date-day">02</span>
            </div>
            <div className="event-info-block">
              <h4>Career Fair</h4>
              <p>University Sports Complex</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Clock size={12} /> 09:00 AM - 05:00 PM
              </span>
            </div>
          </div>
        </div>

        {/* Trending Topics Card */}
        <div className="widget-card">
          <div className="widget-header">
            <h3>Trending Topics</h3>
          </div>

          <div className="trending-item" onClick={() => showToast('Filtered feed by #ExamPrep', 'info')}>
            <div className="trending-tag-name">#ExamPrep</div>
            <div className="trending-posts-count">2.4k students discussing</div>
          </div>

          <div className="trending-item" onClick={() => showToast('Filtered feed by #CampusLife', 'info')}>
            <div className="trending-tag-name">#CampusLife</div>
            <div className="trending-posts-count">1.8k posts today</div>
          </div>

          <div className="trending-item" onClick={() => showToast('Filtered feed by #RoboticsBattle24', 'info')}>
            <div className="trending-tag-name">#RoboticsBattle24</div>
            <div className="trending-posts-count">Just started trending</div>
          </div>

          <div className="trending-item" onClick={() => showToast('Filtered feed by #InternshipSeason', 'info')}>
            <div className="trending-tag-name">#InternshipSeason</div>
            <div className="trending-posts-count">950 new listings</div>
          </div>
        </div>

        {/* Online Now Card */}
        <div className="widget-card">
          <div className="widget-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3>Online Now</h3>
              <span className="online-now-header-dot" />
            </div>
          </div>

          <div className="online-users-row">
            {ONLINE_USERS.map(u => (
              <div 
                key={u.name}
                className="online-avatar-wrap" 
                title={`Click to view ${u.name}'s Profile (${u.dept})`}
                onClick={() => openUserProfile({ name: u.name, avatar: u.avatar, department: u.dept, badge: u.badge })}
              >
                <img src={u.avatar} alt={u.name} />
                <span className="online-dot-badge" />
              </div>
            ))}
          </div>

          <button 
            type="button" 
            className="view-all-online-btn"
            onClick={() => setActiveView('chat')}
          >
            View All in Chat (342)
          </button>
        </div>
      </aside>
    </div>
  );
};
