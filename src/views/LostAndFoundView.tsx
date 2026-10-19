import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Bookmark, 
  X, 
  Layers, 
  CreditCard, 
  Key, 
  Tv, 
  Book, 
  Shirt
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LostFoundItem } from '../types';

export const LostAndFoundView: React.FC = () => {
  const { lostFoundItems, addLostFoundItem, showToast } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('All Items');
  const [reportModalType, setReportModalType] = useState<'Lost' | 'Found' | null>(null);
  const [claimItemTarget, setClaimItemTarget] = useState<LostFoundItem | null>(null);
  const [detailsItemTarget, setDetailsItemTarget] = useState<LostFoundItem | null>(null);

  // Report Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('Wallet');
  const [location, setLocation] = useState('Student Union Cafeteria');
  const [details, setDetails] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Claim verification state
  const [claimProof, setClaimProof] = useState('');

  const categories = [
    { label: 'All Items', icon: <Layers size={15} /> },
    { label: 'Wallet', icon: <CreditCard size={15} /> },
    { label: 'Keys', icon: <Key size={15} /> },
    { label: 'Electronics', icon: <Tv size={15} /> },
    { label: 'IDs & Cards', icon: <CreditCard size={15} /> },
    { label: 'Books', icon: <Book size={15} /> },
    { label: 'Clothing', icon: <Shirt size={15} /> },
  ];

  const filteredItems = lostFoundItems.filter(item => {
    if (activeCategory === 'All Items') return true;
    return item.category === activeCategory;
  });

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reportModalType) return;

    addLostFoundItem({
      title: title.trim(),
      statusType: reportModalType,
      category,
      location,
      details: details.trim(),
      image: imageUrl.trim() || (reportModalType === 'Lost' 
        ? 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500' 
        : 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500')
    });

    setTitle('');
    setDetails('');
    setImageUrl('');
    setReportModalType(null);
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimItemTarget || !claimProof.trim()) return;

    showToast(`Claim verification submitted for "${claimItemTarget.title}". You will receive an SMS/email once verified.`, 'success');
    setClaimProof('');
    setClaimItemTarget(null);
  };

  return (
    <div>
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Lost & Found</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 640 }}>
            Reconnecting the campus community with their belongings. Report lost items or browse found objects reported by fellow students.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="btn-secondary"
            style={{ color: '#D97706', borderColor: '#FDE68A', background: '#FFFDF9' }}
            onClick={() => setReportModalType('Lost')}
          >
            <AlertCircle size={16} /> Report Lost Item
          </button>
          <button 
            className="btn-primary"
            onClick={() => setReportModalType('Found')}
          >
            <CheckCircle2 size={16} /> Report Found Item
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="lostfound-pills-row">
        {categories.map(cat => (
          <button
            key={cat.label}
            className={`lf-pill-btn ${activeCategory === cat.label ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.label)}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Lost & Found Cards Grid */}
      <div className="lostfound-grid">
        {filteredItems.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '56px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>No items reported</p>
            <p style={{ fontSize: '0.875rem' }}>No lost or found items in this category. Click "Report Lost" or "Report Found" above to submit one.</p>
          </div>
        ) : (
          filteredItems.map(item => (
          <div key={item.id} className="lf-card">
            <div className="lf-card-image-box">
              <img src={item.image} alt={item.title} />
              <div className="lf-status-badge">
                <span className={`badge ${item.statusType === 'Lost' ? 'badge-lost' : 'badge-found'}`}>
                  {item.statusType}
                </span>
              </div>
            </div>

            <div className="lf-card-body">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{item.title}</h4>
                  <button 
                    style={{ color: 'var(--text-light)', padding: 2 }}
                    onClick={() => showToast('Saved to your watch list', 'info')}
                    aria-label="Bookmark"
                  >
                    <Bookmark size={16} />
                  </button>
                </div>

                <div className="lf-meta-item">
                  <MapPin size={14} color="#D97706" />
                  <span>{item.location}</span>
                </div>

                <div className="lf-meta-item">
                  <Calendar size={14} color="var(--text-light)" />
                  <span>Reported: {item.reportedDate}</span>
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                {item.statusType === 'Found' ? (
                  <button 
                    className="btn-primary"
                    style={{ width: '100%', padding: '10px' }}
                    onClick={() => setClaimItemTarget(item)}
                  >
                    Claim Item
                  </button>
                ) : (
                  <button 
                    className="btn-secondary"
                    style={{ width: '100%', padding: '10px' }}
                    onClick={() => setDetailsItemTarget(item)}
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          </div>
        )))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 36 }}>
        <button 
          className="btn-secondary"
          style={{ padding: '10px 28px', borderRadius: 'var(--radius-full)' }}
          onClick={() => showToast('All current lost and found items loaded', 'info')}
        >
          Load More Items
        </button>
      </div>

      {/* Report Modal (Lost or Found) */}
      {reportModalType && (
        <div className="modal-overlay" onClick={() => setReportModalType(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Report {reportModalType} Object</h3>
              <button className="modal-close-btn" onClick={() => setReportModalType(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleReportSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Item Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Blue Hydroflask, Apple Pencil, Student Card..." 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Wallet">Wallet</option>
                      <option value="Keys">Keys</option>
                      <option value="Electronics">Electronics</option>
                      <option value="IDs & Cards">IDs & Cards</option>
                      <option value="Books">Books</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Location Spotted / Lost</label>
                    <input 
                      type="text" 
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Photo URL (Optional)</label>
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/..." 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Identifying Details</label>
                  <textarea 
                    rows={3} 
                    placeholder="Scratches, stickers, brand, or unique marks that prove ownership..." 
                    value={details} 
                    onChange={(e) => setDetails(e.target.value)} 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setReportModalType(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Claim Verification Modal */}
      {claimItemTarget && (
        <div className="modal-overlay" onClick={() => setClaimItemTarget(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Claim: {claimItemTarget.title}</h3>
              <button className="modal-close-btn" onClick={() => setClaimItemTarget(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleClaimSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  To prevent unauthorized pickups, please provide identifying proof (e.g. lock code hint, specific stickers, contents) before claiming.
                </p>
                <div>
                  <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Proof of Ownership *
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Describe unique details only the true owner would know..."
                    value={claimProof}
                    onChange={(e) => setClaimProof(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setClaimItemTarget(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Verify & Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {detailsItemTarget && (
        <div className="modal-overlay" onClick={() => setDetailsItemTarget(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{detailsItemTarget.title}</h3>
              <button className="modal-close-btn" onClick={() => setDetailsItemTarget(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ height: 200, borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 14 }}>
                <img src={detailsItemTarget.image} alt={detailsItemTarget.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 14 }}>
                {detailsItemTarget.details || 'Reported lost on campus grounds.'}
              </p>
              <div style={{ background: 'var(--bg-page)', padding: 12, borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                <div><strong>Location:</strong> {detailsItemTarget.location}</div>
                <div><strong>Reported:</strong> {detailsItemTarget.reportedDate}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setDetailsItemTarget(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
