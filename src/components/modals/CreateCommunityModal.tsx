import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Compass, 
  Check
} from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export interface CommunityData {
  id: string;
  name: string;
  description: string;
  category: string;
  leaderName: string;
  leaderEmail: string;
  membersCount: number;
  status?: string;
  bannerImage: string;
  meetingInfo: string;
  tags: string[];
  iconColor: string;
}

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommunityCreated: (newCommunity: CommunityData) => void;
}

const PRESET_BANNER_IMAGES = [
  {
    label: 'Technology & AI',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400'
  },
  {
    label: 'Computer Science',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000'
  },
  {
    label: 'Robotics & Hardware',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1000'
  },
  {
    label: 'Research Lab',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000'
  },
  {
    label: 'Campus Collaborative',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000'
  },
  {
    label: 'Innovation & Design',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000'
  }
];

const PRESET_CATEGORIES = [
  'Academic',
  'Technology',
  'Research',
  'Cultural',
  'Sports',
  'Social',
  'Career & Professional'
];

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  isOpen,
  onClose,
  onCommunityCreated
}) => {
  const { user, showToast } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Technology');
  const [description, setDescription] = useState('');
  const [meetingInfo, setMeetingInfo] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [bannerImage, setBannerImage] = useState(PRESET_BANNER_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a community name', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedImage = customImageUrl.trim() || bannerImage;
      const parsedTags = tagsInput
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const created = await api.createCommunity({
        name: name.trim(),
        description: description.trim() || `Official campus community for ${name.trim()}.`,
        category,
        meetingInfo: meetingInfo.trim() || 'Weekly Campus Meetups',
        tags: parsedTags.length > 0 ? parsedTags : [category, 'Campus'],
        bannerImage: selectedImage,
        leaderName: user?.name || 'Student Organizer',
        leaderEmail: user?.email || ''
      });

      showToast(`🎉 Community "${created.name}" created successfully!`, 'success');
      onCommunityCreated(created);
      onClose();

      // Reset
      setName('');
      setDescription('');
      setMeetingInfo('');
      setTagsInput('');
      setCustomImageUrl('');
    } catch (err: any) {
      showToast(err.message || 'Failed to create community', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 580 }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Compass size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Create a Campus Community</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Establish a new student club, academic society, or campus interest group
              </p>
            </div>
          </div>
          <button 
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Community Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                Community / Club Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input 
                type="text" 
                placeholder="e.g. Google Developer Student Club or Cybersecurity Chapter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', fontSize: '0.9rem' }}
                autoFocus
              />
            </div>

            {/* Category & Lead Organizer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                  Category
                </label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', fontSize: '0.875rem' }}
                >
                  {PRESET_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                  Lead Organizer
                </label>
                <input 
                  type="text" 
                  value={user?.name || 'Student Organizer'}
                  disabled
                  style={{ width: '100%', fontSize: '0.875rem', background: 'var(--bg-page)', color: 'var(--text-muted)' }}
                />
              </div>
            </div>

            {/* Mission & Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                Description & Mission Statement
              </label>
              <textarea 
                rows={3}
                placeholder="Describe the goals, workshops, projects, and activities of this community..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', fontSize: '0.875rem' }}
              />
            </div>

            {/* Meeting Schedule & Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                  Meeting Schedule & Venue
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Fridays 4:00 PM • Lab 402"
                  value={meetingInfo}
                  onChange={(e) => setMeetingInfo(e.target.value)}
                  style={{ width: '100%', fontSize: '0.813rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-main)' }}>
                  Tags / Keywords
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. AI, Python, Coding, Cloud"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  style={{ width: '100%', fontSize: '0.813rem' }}
                />
              </div>
            </div>

            {/* Banner Cover Image Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>
                Choose Cover Banner Theme
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                {PRESET_BANNER_IMAGES.map((img) => {
                  const isSelected = bannerImage === img.url && !customImageUrl.trim();
                  return (
                    <div 
                      key={img.label}
                      onClick={() => {
                        setBannerImage(img.url);
                        setCustomImageUrl('');
                      }}
                      style={{
                        position: 'relative',
                        height: 64,
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        boxShadow: isSelected ? '0 0 0 2px rgba(224, 142, 27, 0.2)' : 'none'
                      }}
                    >
                      <img 
                        src={img.url} 
                        alt={img.label} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        padding: 2
                      }}>
                        {img.label}
                      </div>
                      {isSelected && (
                        <div style={{ position: 'absolute', top: 4, right: 4, background: 'var(--primary)', color: 'white', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Or custom URL */}
              <input 
                type="url" 
                placeholder="Or paste a custom image URL (optional)..."
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                style={{ width: '100%', fontSize: '0.813rem' }}
              />
            </div>

            {/* Live Preview Card */}
            <div style={{ padding: '12px 14px', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                Preview
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {name.trim() || 'New Campus Community'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {category} • 1 Member (You as Founder)
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting || !name.trim()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              {isSubmitting ? (
                'Creating Community...'
              ) : (
                <>
                  <Compass size={16} /> Create Community
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
