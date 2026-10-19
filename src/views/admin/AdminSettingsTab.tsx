import React, { useState, useEffect } from 'react';
import { 
  School, 
  UserCheck, 
  Sliders, 
  Save, 
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const AdminSettingsTab: React.FC = () => {
  const { user, showToast } = useApp();

  const [universityName, setUniversityName] = useState('Metropolitan University');
  const [campusLocation, setCampusLocation] = useState('Dhaka, Bangladesh');
  const [academicSession, setAcademicSession] = useState('Fall 2026');
  const [contactEmail, setContactEmail] = useState('registrar@university.edu');

  // Platform switches
  const [allowStudentPosts, setAllowStudentPosts] = useState(true);
  const [moderationEnabled, setModerationEnabled] = useState(true);
  const [allowStudentRegistration, setAllowStudentRegistration] = useState(true);
  const [systemNotice, setSystemNotice] = useState('Welcome to the university unified digital campus portal.');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.getAdminSettings()
      .then((data: any) => {
        if (data) {
          if (data.universityName) setUniversityName(data.universityName);
          if (data.campusLocation) setCampusLocation(data.campusLocation);
          if (data.academicSession) setAcademicSession(data.academicSession);
          if (data.contactEmail) setContactEmail(data.contactEmail);
          if (data.allowStudentPosts !== undefined) setAllowStudentPosts(data.allowStudentPosts);
          if (data.moderationEnabled !== undefined) setModerationEnabled(data.moderationEnabled);
          if (data.allowStudentRegistration !== undefined) setAllowStudentRegistration(data.allowStudentRegistration);
          if (data.systemNotice) setSystemNotice(data.systemNotice);
        }
      })
      .catch(() => {
        // Keep defaults
      });
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateAdminSettings({
        universityName,
        campusLocation,
        academicSession,
        contactEmail,
        allowStudentPosts,
        moderationEnabled,
        allowStudentRegistration,
        systemNotice
      });
      showToast('University settings saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div>
          <h2>University & Platform Settings</h2>
          <p>Configure institutional metadata, administrator profile credentials, and global platform policies</p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* 1. University Information */}
        <div style={{ background: 'white', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, borderBottom: '1px solid var(--admin-border)', paddingBottom: 14 }}>
            <School size={20} color="var(--admin-blue-primary)" />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Institutional Information</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>Official university records displayed across the portal</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>
                University Name
              </label>
              <input 
                type="text" 
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>
                Academic Session
              </label>
              <input 
                type="text" 
                value={academicSession}
                onChange={(e) => setAcademicSession(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>
                Campus Location / Address
              </label>
              <input 
                type="text" 
                value={campusLocation}
                onChange={(e) => setCampusLocation(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>
                Official Administration Email
              </label>
              <input 
                type="email" 
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* 2. Basic Platform Settings */}
        <div style={{ background: 'white', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, borderBottom: '1px solid var(--admin-border)', paddingBottom: 14 }}>
            <Sliders size={20} color="var(--admin-blue-primary)" />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Platform & Moderation Policies</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>Global controls governing student interactions</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Allow Student Community Posts</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Students can publish posts and start discussions on the campus feed</div>
              </div>
              <input 
                type="checkbox" 
                checked={allowStudentPosts}
                onChange={(e) => setAllowStudentPosts(e.target.checked)}
                style={{ width: 20, height: 20, cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Strict Content Auto-Moderation</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Automatically flag inappropriate keywords and notify moderators</div>
              </div>
              <input 
                type="checkbox" 
                checked={moderationEnabled}
                onChange={(e) => setModerationEnabled(e.target.checked)}
                style={{ width: 20, height: 20, cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Allow Self-Registration</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>New students with approved university domain emails can self-register</div>
              </div>
              <input 
                type="checkbox" 
                checked={allowStudentRegistration}
                onChange={(e) => setAllowStudentRegistration(e.target.checked)}
                style={{ width: 20, height: 20, cursor: 'pointer' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>
                Global Campus Portal Notice
              </label>
              <input 
                type="text" 
                value={systemNotice}
                onChange={(e) => setSystemNotice(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* 3. Admin Profile */}
        <div style={{ background: 'white', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, borderBottom: '1px solid var(--admin-border)', paddingBottom: 14 }}>
            <UserCheck size={20} color="var(--admin-blue-primary)" />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Administrator Profile</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>Current logged-in administrator credentials</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img 
              src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120'} 
              alt={user?.name || 'Admin'} 
              style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-text-title)' }}>
                {user?.name || 'Principal Administrator'}
              </div>
              <div style={{ fontSize: '0.813rem', color: 'var(--admin-text-muted)' }}>
                {user?.email || 'admin@university.edu'} • <span className="admin-badge admin-badge-blue">System Administrator</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontWeight: 700 }}>
                <ShieldCheck size={14} /> Full Administrative Privileges Active
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSaving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}
          >
            <Save size={16} /> {isSaving ? 'Saving Changes...' : 'Save All Platform Settings'}
          </button>
        </div>

      </form>
    </div>
  );
};
