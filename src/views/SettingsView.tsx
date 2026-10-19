import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Lock, 
  Bell, 
  Shield, 
  Palette, 
  Pencil, 
  LogOut,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const { user, updateUser, setActiveView, showToast, logout } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'notifications' | 'security' | 'theme'>('profile');

  const [fullName, setFullName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio);
  const [major, setMajor] = useState(user.major);
  const [graduation, setGraduation] = useState(user.expectedGraduation);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  // Theme state
  const [themeMode, setThemeMode] = useState<'light' | 'system' | 'dark'>('light');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: fullName,
      email,
      bio,
      major,
      expectedGraduation: graduation
    });
  };

  const handleDiscard = () => {
    setFullName(user.name);
    setEmail(user.email);
    setBio(user.bio);
    setMajor(user.major);
    setGraduation(user.expectedGraduation);
    showToast('Changes discarded', 'info');
  };

  const handleDeactivate = () => {
    setShowDeactivateModal(false);
    showToast('Account deactivated. Redirecting to login...', 'error');
    setTimeout(() => {
      setActiveView('login');
    }, 1200);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Settings</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Manage your account preferences and security settings.
        </p>
      </div>

      <div className="settings-grid-layout">
        {/* Left Settings Nav Panel */}
        <aside className="settings-nav-panel">
          <button 
            className={`settings-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <UserIcon size={18} /> Profile
          </button>
          <button 
            className={`settings-nav-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <Lock size={18} /> Privacy
          </button>
          <button 
            className={`settings-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} /> Notifications
          </button>
          <button 
            className={`settings-nav-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={18} /> Security
          </button>
          <button 
            className={`settings-nav-btn ${activeTab === 'theme' ? 'active' : ''}`}
            onClick={() => setActiveTab('theme')}
          >
            <Palette size={18} /> Theme Preferences
          </button>

          <div style={{ height: 1, background: 'var(--border-subtle)', margin: '10px 0' }} />

          <button 
            type="button"
            className="settings-nav-btn"
            style={{ color: '#DC2626' }}
            onClick={logout}
            title="Sign out of UniConnect"
          >
            <LogOut size={18} /> Log Out
          </button>
        </aside>

        {/* Right Settings Form Container */}
        <div>
          {activeTab === 'profile' && (
            <>
              <form onSubmit={handleSave} className="settings-form-card">
                {/* Profile Header Block */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28 }}>
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      style={{ width: 90, height: 90, borderRadius: 'var(--radius-lg)', objectFit: 'cover' }} 
                    />
                    <button 
                      type="button" 
                      style={{
                        position: 'absolute',
                        bottom: -6,
                        right: -6,
                        width: 28,
                        height: 28,
                        background: '#D97706',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      onClick={() => showToast('Avatar upload dialog opened', 'info')}
                    >
                      <Pencil size={14} />
                    </button>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{user.name}</h3>
                      <span className="badge badge-club" style={{ fontSize: '0.7rem' }}>
                        ✔ VERIFIED {user.role}
                      </span>
                    </div>

                    <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                      "{user.bio.substring(0, 75)}..."
                    </p>

                    <div style={{ display: 'flex', gap: 8 }}>
                      {user.tags.map(t => (
                        <span key={t} style={{ background: '#FFFBEB', color: '#B45309', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                  <div>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      University Email
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ background: 'var(--bg-page)' }}
                      required 
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Bio
                  </label>
                  <textarea 
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 28 }}>
                  <div>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      Major
                    </label>
                    <input 
                      type="text" 
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      Expected Graduation
                    </label>
                    <select 
                      value={graduation} 
                      onChange={(e) => setGraduation(e.target.value)}
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button type="button" className="btn-secondary" onClick={handleDiscard}>
                    Discard
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    style={{ background: '#78350F' }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>

              {/* Danger Zone */}
              <div className="danger-zone-box">
                <div>
                  <h4 style={{ color: '#DC2626', fontSize: '1rem', fontWeight: 800, marginBottom: 4 }}>
                    Danger Zone
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: 460 }}>
                    Deactivating your account will remove your data from the community feed and marketplace permanently.
                  </p>
                </div>

                <button 
                  type="button" 
                  className="btn-secondary"
                  style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
                  onClick={() => setShowDeactivateModal(true)}
                >
                  Deactivate Account
                </button>
              </div>
            </>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-form-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Privacy Preferences</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label className="checkbox-label-row">
                  <input type="checkbox" defaultChecked />
                  Make Academic Digital Twin publicly visible to university recruiters
                </label>
                <label className="checkbox-label-row">
                  <input type="checkbox" defaultChecked />
                  Show course schedule to peer project teammates
                </label>
                <label className="checkbox-label-row">
                  <input type="checkbox" />
                  Hide online activity status on campus messenger
                </label>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-form-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Notification Alerts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label className="checkbox-label-row">
                  <input type="checkbox" defaultChecked />
                  Email alerts for faculty announcements & rubric updates
                </label>
                <label className="checkbox-label-row">
                  <input type="checkbox" defaultChecked />
                  Direct message push notifications
                </label>
                <label className="checkbox-label-row">
                  <input type="checkbox" defaultChecked />
                  Marketplace inquiry notifications
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-form-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Security & Password</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
                <div>
                  <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Current Password</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <div>
                  <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>New Password</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ marginTop: 8 }}
                  onClick={() => showToast('Password updated successfully', 'success')}
                >
                  Update Password
                </button>
              </div>

              <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border-subtle)', maxWidth: 450 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 6, color: 'var(--text-main)' }}>Account Session</h4>
                <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                  Log out of your active university session on this device.
                </p>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#DC2626', borderColor: '#FECACA', background: '#FEF2F2' }}
                  onClick={logout}
                  title="Sign out of UniConnect"
                >
                  <LogOut size={16} /> Log Out from UniConnect
                </button>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="settings-form-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Theme & Visual Preferences</h3>
              <div style={{ display: 'flex', gap: 16 }}>
                {(['light', 'system'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    className={`btn-secondary ${themeMode === mode ? 'active' : ''}`}
                    style={{
                      border: themeMode === mode ? '2px solid var(--primary)' : undefined,
                      padding: '12px 24px',
                      textTransform: 'capitalize'
                    }}
                    onClick={() => {
                      setThemeMode(mode);
                      showToast(`Theme switched to ${mode}`, 'info');
                    }}
                  >
                    {mode} Mode
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="modal-overlay" onClick={() => setShowDeactivateModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: '#DC2626' }}>Confirm Account Deactivation</h3>
              <button className="modal-close-btn" onClick={() => setShowDeactivateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.938rem', lineHeight: 1.6, color: 'var(--text-body)' }}>
                Are you sure you want to deactivate your UniConnect account? Your listings, uploaded resources, and verified academic credentials will be archived.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeactivateModal(false)}>Cancel</button>
              <button 
                className="btn-primary" 
                style={{ background: '#DC2626' }}
                onClick={handleDeactivate}
              >
                Yes, Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
