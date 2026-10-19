import React from 'react';
import { X, Calendar, MapPin, CheckCircle, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EventTicketModal: React.FC = () => {
  const { isTicketModalOpen, setIsTicketModalOpen, activeTicketEvent, user } = useApp();

  if (!isTicketModalOpen || !activeTicketEvent) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsTicketModalOpen(false)}>
      <div className="modal-dialog" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirmed Event Pass</h3>
          <button 
            className="modal-close-btn"
            onClick={() => setIsTicketModalOpen(false)}
            aria-label="Close ticket"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--success-bg)',
            color: 'var(--success-text)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700,
            fontSize: '0.875rem',
            marginBottom: 16
          }}>
            <CheckCircle size={18} />
            Registration Confirmed
          </div>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>
            {activeTicketEvent.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={15} color="var(--primary)" /> {activeTicketEvent.date} • {activeTicketEvent.time}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={15} color="var(--primary)" /> {activeTicketEvent.location}
            </span>
          </div>

          {/* SVG QR Code */}
          <div style={{
            background: 'white',
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            display: 'inline-block',
            margin: '0 auto 16px auto',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <svg width="160" height="160" viewBox="0 0 100 100">
              <rect width="100" height="100" fill="white" />
              {/* QR Code matrix pattern */}
              <rect x="10" y="10" width="30" height="30" fill="#111827" />
              <rect x="15" y="15" width="20" height="20" fill="white" />
              <rect x="20" y="20" width="10" height="10" fill="#E08E1B" />

              <rect x="60" y="10" width="30" height="30" fill="#111827" />
              <rect x="65" y="15" width="20" height="20" fill="white" />
              <rect x="70" y="20" width="10" height="10" fill="#E08E1B" />

              <rect x="10" y="60" width="30" height="30" fill="#111827" />
              <rect x="15" y="65" width="20" height="20" fill="white" />
              <rect x="20" y="70" width="10" height="10" fill="#E08E1B" />

              {/* Data modules */}
              <rect x="45" y="15" width="8" height="8" fill="#111827" />
              <rect x="45" y="30" width="8" height="8" fill="#111827" />
              <rect x="15" y="45" width="8" height="8" fill="#111827" />
              <rect x="30" y="45" width="8" height="8" fill="#111827" />
              <rect x="45" y="45" width="10" height="10" fill="#E08E1B" />
              <rect x="60" y="45" width="8" height="8" fill="#111827" />
              <rect x="75" y="45" width="12" height="8" fill="#111827" />
              <rect x="50" y="65" width="12" height="10" fill="#111827" />
              <rect x="70" y="65" width="15" height="8" fill="#111827" />
              <rect x="50" y="80" width="8" height="12" fill="#111827" />
              <rect x="65" y="80" width="20" height="12" fill="#111827" />
            </svg>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 8, fontFamily: 'monospace' }}>
              PASS-ID: UC-EV2026-{activeTicketEvent.id.toUpperCase()}
            </p>
          </div>

          <div style={{
            background: 'var(--bg-page)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            fontSize: '0.813rem',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Attendee</span>
              <strong>{user.name}</strong> ({user.studentId})
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Role</span>
              <strong style={{ color: 'var(--primary)' }}>Confirmed Attendee</strong>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button 
            className="btn-secondary" 
            style={{ fontSize: '0.813rem' }}
            onClick={() => alert('Calendar file (.ics) downloaded!')}
          >
            <Download size={15} /> Save to Wallet
          </button>
          <button 
            className="btn-primary" 
            style={{ fontSize: '0.813rem' }}
            onClick={() => setIsTicketModalOpen(false)}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
