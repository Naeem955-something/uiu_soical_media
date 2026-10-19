import React, { useState } from 'react';
import { Shield, Users, Mail, Lock, Eye, EyeOff, School, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginView: React.FC = () => {
  const { setActiveView, login, registerUser, showToast } = useApp();

  // Mode: 'campus' (Students & Faculty) vs 'admin' (Dedicated Administrator Portal)
  const [portalMode, setPortalMode] = useState<'campus' | 'admin'>('campus');
  const [campusRole, setCampusRole] = useState<'student' | 'faculty'>('student');
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (portalMode === 'admin') {
        await login(email.trim(), password);
        showToast('Admin access granted. Loading admin panel...', 'success');
        // Admin goes directly to the admin panel
        setActiveView('admin');
        return;
      }

      if (isRegister) {
        await registerUser({
          name: fullName.trim(),
          email: email.trim(),
          password,
          role: campusRole === 'faculty' ? 'FACULTY' : 'STUDENT',
          department: campusRole === 'faculty' ? 'Department of Advanced Robotics' : 'Computer Science',
        });
        setActiveView('home');
      } else {
        const loggedUser = await login(email.trim(), password);
        // If an admin user logged in via campus form, also route them directly to admin
        if (loggedUser?.role === 'ADMIN') {
          setActiveView('admin');
        } else {
          setActiveView('home');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication failed. Please verify your credentials.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-split-page">
      {/* Left Brand Side */}
      <div className="login-brand-side">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'white',
              color: '#E08E1B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm-7.5 9.5v5C4.5 19.5 8 22 12 22s7.5-2.5 7.5-5.5v-5L12 16.5 4.5 11.5z"/>
              </svg>
            </div>
            <h1 style={{ fontSize: '1.6rem', color: 'white', fontWeight: 800 }}>UniConnect</h1>
          </div>

          <h2 style={{
            fontSize: '2.75rem',
            lineHeight: 1.15,
            color: 'white',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: 20
          }}>
            Welcome to UniConnect – Your Academic Universe
          </h2>

          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: 1.6,
            maxWidth: '520px',
            marginBottom: 40
          }}>
            Join over 50,000 students and faculty in a unified digital ecosystem. Manage courses, discover communities, and stay connected with campus life—all in one secure place.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, maxWidth: '520px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Users size={20} color="white" />
                <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>Communities</h4>
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.85rem' }}>
                Engage in 200+ active student organizations.
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Shield size={20} color="white" />
                <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>Secure</h4>
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.85rem' }}>
                End-to-end encrypted academic data.
              </p>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.813rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          © 2024 University Academic Systems. All Rights Reserved.
        </div>
      </div>

      {/* Right Form Side */}
      <div className="login-form-side">
        <div className="login-form-container">
          {/* Main Portal Switcher: Campus vs Admin */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-page)',
            padding: 4,
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            marginBottom: 24,
            gap: 4
          }}>
            <button
              type="button"
              onClick={() => {
                setPortalMode('campus');
                setEmail('');
                setPassword('');
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 700,
                border: 'none',
                background: portalMode === 'campus' ? 'white' : 'transparent',
                color: portalMode === 'campus' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: portalMode === 'campus' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <School size={16} />
              <span>Campus Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPortalMode('admin');
                setIsRegister(false);
                setEmail('');
                setPassword('');
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 700,
                border: 'none',
                background: portalMode === 'admin' ? '#1E293B' : 'transparent',
                color: portalMode === 'admin' ? '#F8FAFC' : 'var(--text-muted)',
                boxShadow: portalMode === 'admin' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ShieldAlert size={16} color={portalMode === 'admin' ? '#F59E0B' : undefined} />
              <span>Admin Portal</span>
            </button>
          </div>

          {/* Form Header */}
          <div style={{ marginBottom: 24 }}>
            {portalMode === 'admin' ? (
              <>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 800, marginBottom: 10 }}>
                  <Shield size={13} />
                  CENTRAL ADMINISTRATION ACCESS
                </div>
                <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
                  Admin Sign In
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Sign in with authorized administrative credentials to manage campus settings, users, events, and reports.
                </p>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
                  {isRegister ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  {isRegister ? 'Register your university profile to get started' : 'Sign in with your university credentials'}
                </p>
              </>
            )}
          </div>

          {/* Student vs Faculty segmented control (only for Campus Portal) */}
          {portalMode === 'campus' && (
            <div className="role-segmented-control" style={{ marginBottom: 20 }}>
              <button
                type="button"
                className={`segment-btn ${campusRole === 'student' ? 'active' : ''}`}
                onClick={() => setCampusRole('student')}
              >
                Student Access
              </button>
              <button
                type="button"
                className={`segment-btn ${campusRole === 'faculty' ? 'active' : ''}`}
                onClick={() => setCampusRole('faculty')}
              >
                Faculty Access
              </button>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {portalMode === 'campus' && isRegister && (
              <div>
                <label style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
                  Full Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Abdur Rahman"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
                {portalMode === 'admin' ? 'Administrator Email Address' : 'University Email Address'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 14, top: 12, color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  placeholder={portalMode === 'admin' ? 'admin@university.edu' : 'e.g. name@university.edu'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: 42 }}
                  required
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Password
                </label>
                {!isRegister && portalMode === 'campus' && (
                  <a 
                    href="#forgot" 
                    onClick={(e) => { e.preventDefault(); showToast('Password reset link sent to your email', 'info'); }}
                    style={{ fontSize: '0.813rem', color: '#D97706', fontWeight: 600 }}
                  >
                    Forgot password?
                  </a>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: 12, color: 'var(--text-muted)' }} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {portalMode === 'admin' && (
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5
              }}>
                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: 2 }}>Audited Session:</strong>
                All administrative actions and logins are logged for platform audit and governance.
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} 
                />
                Keep me logged in
              </label>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{
                width: '100%', 
                padding: '13px', 
                fontSize: '1rem', 
                marginTop: 6,
                background: portalMode === 'admin' ? '#1E293B' : undefined,
                borderColor: portalMode === 'admin' ? '#0F172A' : undefined
              }}
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Authenticating...' 
                : portalMode === 'admin'
                  ? 'Sign In to Admin Panel'
                  : isRegister 
                    ? 'Create Account' 
                    : 'Secure Sign In'
              }
            </button>
          </form>

          {/* Switcher Footer */}
          {portalMode === 'campus' ? (
            <div style={{ textAlign: 'center', marginTop: 22, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                style={{ color: '#D97706', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {isRegister ? 'Sign In' : 'Create an Account'}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginTop: 22, fontSize: '0.875rem' }}>
              <button
                type="button"
                onClick={() => setPortalMode('campus')}
                style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                ← Return to Student & Faculty Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
