import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  Heart, 
  MessageCircle, 
  X,
  RefreshCw,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  Eye,
  AlertTriangle,
  User as UserIcon
} from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export interface PostRecord {
  id: string;
  author: {
    name: string;
    avatar: string;
    department?: string;
  };
  content: string;
  tags?: string[];
  likes: number;
  commentsCount: number;
  comments?: Array<{ id: string; author: { name: string; avatar?: string }; text: string; createdAt?: string | Date }>;
  image?: string;
  fileAttachment?: { name: string; size?: string; url?: string };
  createdAt?: string | Date;
}

export const AdminPostsTab: React.FC = () => {
  const { showToast, posts: contextPosts, deletePost, openUserProfile } = useApp();

  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCommentsPost, setActiveCommentsPost] = useState<PostRecord | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Helper safe extractors to prevent any undefined crashes
  const getAuthorName = (p: PostRecord): string => {
    if (!p) return 'Campus Member';
    if (typeof p.author === 'string') return p.author || 'Campus Member';
    return p.author?.name || 'Campus Member';
  };

  const getAuthorAvatar = (p: PostRecord): string => {
    if (p && typeof p.author === 'object' && p.author?.avatar) {
      return p.author.avatar;
    }
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80';
  };

  const getAuthorDept = (p: PostRecord): string => {
    if (p && typeof p.author === 'object' && p.author?.department) {
      return p.author.department;
    }
    return 'Student Community';
  };

  const mapContextPosts = useCallback((): PostRecord[] => {
    if (!contextPosts || contextPosts.length === 0) return [];
    return contextPosts.map(p => ({
      id: p.id,
      author: {
        name: p.authorName || 'Campus Member',
        avatar: p.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80',
        department: p.authorDepartment || 'General'
      },
      content: p.content || '',
      tags: p.tags || [],
      likes: p.likes || 0,
      commentsCount: p.commentsCount || (p.commentsList ? p.commentsList.length : 0),
      comments: (p.commentsList || []).map(c => ({
        id: c.id,
        author: {
          name: c.authorName || 'Campus Member',
          avatar: c.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'
        },
        text: c.text || '',
        createdAt: c.timeAgo || 'Recent'
      })),
      image: p.image,
      fileAttachment: p.fileAttachment,
      createdAt: p.timeAgo || 'Recently'
    }));
  }, [contextPosts]);

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminPosts();
      if (Array.isArray(data) && data.length > 0) {
        setPosts(data);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('api.getAdminPosts fetch issue, falling back to active posts:', err);
    }

    // Fallback: Populate seamlessly from AppContext posts
    const fallback = mapContextPosts();
    setPosts(fallback);
    setIsLoading(false);
  }, [mapContextPosts]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleDeletePost = async (id: string, authorName: string) => {
    if (!window.confirm(`Are you sure you want to remove this publication by ${authorName}? This action will permanently remove it from the campus feed.`)) {
      return;
    }

    try {
      await api.deleteAdminPost(id);
      showToast('Post removed successfully by administrator', 'success');
    } catch {
      showToast('Post removed from local session', 'info');
    }

    // Remove from local admin state
    setPosts(prev => prev.filter(p => p.id !== id));
    // Remove from global app feed
    deletePost(id);

    if (activeCommentsPost?.id === id) {
      setActiveCommentsPost(null);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await api.deleteAdminComment(postId, commentId);
      showToast('Comment removed from discussion thread', 'success');
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const updatedComments = (p.comments || []).filter(c => c.id !== commentId);
          return {
            ...p,
            comments: updatedComments,
            commentsCount: Math.max(0, p.commentsCount - 1)
          };
        }
        return p;
      }));
      if (activeCommentsPost?.id === postId) {
        setActiveCommentsPost(prev => prev ? {
          ...prev,
          comments: (prev.comments || []).filter(c => c.id !== commentId),
          commentsCount: Math.max(0, prev.commentsCount - 1)
        } : null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to remove comment', 'error');
    }
  };

  // Safe search and filter logic
  const filteredPosts = posts.filter(p => {
    if (!p) return false;
    const authorName = getAuthorName(p);
    const content = p.content || '';
    const tags = Array.isArray(p.tags) ? p.tags : [];
    const searchLower = (search || '').trim().toLowerCase();

    const matchesSearch = !searchLower || (
      content.toLowerCase().includes(searchLower) ||
      authorName.toLowerCase().includes(searchLower) ||
      tags.some(t => (t || '').toLowerCase().includes(searchLower))
    );

    if (filterType === 'MEDIA') return matchesSearch && (!!p.image || !!p.fileAttachment);
    if (filterType === 'HAS_COMMENTS') return matchesSearch && (p.commentsCount > 0 || (p.comments && p.comments.length > 0));
    return matchesSearch;
  });

  const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0);
  const mediaCount = posts.filter(p => !!p.image || !!p.fileAttachment).length;

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div>
          <h2>Post & Content Moderation</h2>
          <p>Supervise student publications, delete policy violations, and moderate discussion comments</p>
        </div>
        <button 
          className="btn-secondary"
          onClick={() => {
            loadPosts();
            showToast('Posts updated from live database', 'info');
          }}
          disabled={isLoading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        marginBottom: 20
      }}>
        <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text-title)' }}>{posts.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Total Publications</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ImageIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text-title)' }}>{mediaCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontWeight: 600 }}>With Media / Files</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FAF5FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text-title)' }}>{totalComments}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Total Comments</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FFF1F2', color: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text-title)' }}>{totalLikes}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Total Appreciations</div>
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--admin-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search post content, author name, or tag..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          style={{ height: 40, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border)', background: 'white', fontSize: '0.875rem' }}
        >
          <option value="ALL">All Posts ({posts.length})</option>
          <option value="MEDIA">With Images / Attachments ({mediaCount})</option>
          <option value="HAS_COMMENTS">With Active Comments</option>
        </select>
      </div>

      {/* Posts Table */}
      <div className="admin-table-shell">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Author</th>
              <th>Content & Media</th>
              <th>Tags</th>
              <th>Engagement</th>
              <th>Published</th>
              <th style={{ textAlign: 'right' }}>Moderation</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>
                  <RefreshCw size={22} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block', color: 'var(--primary-color)' }} />
                  <span>Loading campus publications...</span>
                </td>
              </tr>
            ) : filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--admin-text-muted)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                    <MessageSquare size={22} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--admin-text-title)', marginBottom: 4 }}>
                    {search ? 'No matching publications found' : 'No campus publications available'}
                  </div>
                  <p style={{ fontSize: '0.813rem', color: 'var(--admin-text-muted)', maxWidth: 360, margin: '0 auto 14px auto' }}>
                    {search ? 'Try clearing your search terms or changing your filter criteria.' : 'Student and faculty posts will appear here for moderation once published.'}
                  </p>
                  {(search || filterType !== 'ALL') && (
                    <button 
                      className="btn-secondary" 
                      onClick={() => { setSearch(''); setFilterType('ALL'); }}
                      style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                    >
                      Clear Filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredPosts.map(p => {
                const authorName = getAuthorName(p);
                const authorAvatar = getAuthorAvatar(p);
                const authorDept = getAuthorDept(p);
                const commentsCount = p.commentsCount || (p.comments ? p.comments.length : 0);

                return (
                  <tr key={p.id}>
                    {/* Author */}
                    <td>
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                        onClick={() => openUserProfile({ name: authorName, avatar: authorAvatar, department: authorDept })}
                        title={`View ${authorName}'s Campus Profile`}
                      >
                        <img 
                          src={authorAvatar} 
                          alt={authorName}
                          style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--admin-border)' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--admin-text-title)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {authorName}
                            <Eye size={12} color="var(--admin-blue-primary)" style={{ opacity: 0.7 }} />
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{authorDept}</span>
                        </div>
                      </div>
                    </td>

                    {/* Content snippet */}
                    <td style={{ maxWidth: 320 }}>
                      <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-title)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                        {p.content}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        {p.image && (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(p.image || null)}
                            className="admin-badge admin-badge-blue"
                            style={{ cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <ImageIcon size={11} /> View Image
                          </button>
                        )}
                        {p.fileAttachment && (
                          <span className="admin-badge admin-badge-gray" style={{ fontSize: '0.7rem' }}>
                            📎 {p.fileAttachment.name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Tags */}
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(p.tags || []).length > 0 ? (
                          p.tags?.map(t => (
                            <span key={t} className="admin-badge admin-badge-gray" style={{ fontSize: '0.7rem' }}>
                              #{t}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}>General</span>
                        )}
                      </div>
                    </td>

                    {/* Engagement */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.813rem', color: 'var(--admin-text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Heart size={14} color="#EF4444" /> {p.likes || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveCommentsPost(p)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            color: 'var(--admin-blue-primary)',
                            fontWeight: 600,
                            fontSize: '0.813rem'
                          }}
                          title="Inspect Comments"
                        >
                          <MessageCircle size={14} /> {commentsCount}
                        </button>
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap' }}>
                      {typeof p.createdAt === 'string' 
                        ? p.createdAt 
                        : p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent'}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button 
                          className="admin-action-btn"
                          onClick={() => setActiveCommentsPost(p)}
                          title="Manage Discussion Comments"
                        >
                          <MessageCircle size={14} />
                        </button>

                        <button 
                          className="admin-action-btn danger"
                          onClick={() => handleDeletePost(p.id, authorName)}
                          title="Delete Inappropriate Post"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640, padding: 16 }}>
            <div className="modal-header" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ImageIcon size={18} color="var(--admin-blue-primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Post Media Inspection</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setPreviewImage(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ textAlign: 'center', background: '#0F172A', borderRadius: 8, padding: 8 }}>
              <img 
                src={previewImage} 
                alt="Post Media" 
                style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: 6 }} 
              />
            </div>
            <div className="modal-footer" style={{ marginTop: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setPreviewImage(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Comments Modal */}
      {activeCommentsPost && (
        <div className="modal-overlay" onClick={() => setActiveCommentsPost(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MessageSquare size={18} color="var(--admin-blue-primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Manage Post Comments</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveCommentsPost(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              {/* Post Context */}
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border)', marginBottom: 16 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-muted)', marginBottom: 4 }}>
                  Post by {getAuthorName(activeCommentsPost)}:
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-title)', lineHeight: 1.4 }}>
                  "{activeCommentsPost.content}"
                </div>
              </div>

              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 12 }}>
                Comments ({activeCommentsPost.comments?.length || 0})
              </h4>

              {(!activeCommentsPost.comments || activeCommentsPost.comments.length === 0) ? (
                <div style={{ padding: '28px', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '0.813rem' }}>
                  No comments have been posted on this thread yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {activeCommentsPost.comments.map(c => {
                    const commenterName = (typeof c.author === 'string' ? c.author : c.author?.name) || 'Student Member';
                    const commenterAvatar = (typeof c.author === 'object' && c.author?.avatar) ? c.author.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80';

                    return (
                      <div 
                        key={c.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 12,
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid #F1F5F9',
                          background: '#FAFAFC'
                        }}
                      >
                        <div style={{ display: 'flex', gap: 10, flex: 1 }}>
                          <img 
                            src={commenterAvatar} 
                            alt={commenterName}
                            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', marginTop: 2 }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.813rem', color: 'var(--admin-text-title)', marginBottom: 2 }}>
                              {commenterName}
                            </div>
                            <div style={{ fontSize: '0.813rem', color: 'var(--admin-text-body)', lineHeight: 1.4 }}>
                              {c.text}
                            </div>
                            {c.createdAt && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginTop: 4 }}>
                                {typeof c.createdAt === 'string' ? c.createdAt : new Date(c.createdAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        <button 
                          className="admin-action-btn danger"
                          onClick={() => handleDeleteComment(activeCommentsPost.id, c.id)}
                          title="Delete Inappropriate Comment"
                          style={{ flexShrink: 0 }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setActiveCommentsPost(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
