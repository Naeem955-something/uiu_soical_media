import React, { useState } from 'react';
import { 
  PlusCircle, 
  MapPin, 
  Heart, 
  Book, 
  Tv, 
  Home, 
  Shirt, 
  Layers, 
  MessageCircle,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MarketplaceItem } from '../types';

export const MarketplaceView: React.FC = () => {
  const { 
    marketplaceItems, 
    toggleBookmarkMarketplace, 
    setIsSellModalOpen, 
    setActiveView,
    setActiveChatId,
    showToast 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All Items');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedItemForModal, setSelectedItemForModal] = useState<MarketplaceItem | null>(null);

  const handleConditionToggle = (cond: string) => {
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter(c => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const filteredItems = marketplaceItems.filter(item => {
    if (selectedCategory !== 'All Items' && item.category !== selectedCategory) return false;
    if (selectedLocation !== 'All Locations' && item.location !== selectedLocation) return false;
    if (minPrice && item.price < parseFloat(minPrice)) return false;
    if (maxPrice && item.price > parseFloat(maxPrice)) return false;
    if (selectedConditions.length > 0 && !selectedConditions.includes(item.condition)) return false;
    return true;
  });

  const handleContactSeller = (item: MarketplaceItem) => {
    setSelectedItemForModal(null);
    setActiveChatId('chat-3'); // open direct message
    setActiveView('chat');
    showToast(`Started conversation with ${item.sellerName} regarding "${item.title}"`, 'info');
  };

  return (
    <div>
      {/* Marketplace Header */}
      <div className="marketplace-header-row">
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Campus Marketplace
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Find the best deals from your fellow students.
          </p>
        </div>

        <button 
          className="btn-primary"
          style={{ padding: '10px 22px', borderRadius: 'var(--radius-full)' }}
          onClick={() => setIsSellModalOpen(true)}
        >
          <PlusCircle size={18} />
          Sell an Item
        </button>
      </div>

      <div className="marketplace-layout">
        {/* Left Filter Sidebar */}
        <aside className="marketplace-filters-panel">
          {/* Categories */}
          <div className="filter-section-block">
            <div className="filter-title">Categories</div>
            <nav className="category-nav-list">
              <button 
                className={`category-nav-item ${selectedCategory === 'All Items' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('All Items')}
              >
                <Layers size={16} /> All Items
              </button>
              <button 
                className={`category-nav-item ${selectedCategory === 'Books' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('Books')}
              >
                <Book size={16} /> Books
              </button>
              <button 
                className={`category-nav-item ${selectedCategory === 'Electronics' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('Electronics')}
              >
                <Tv size={16} /> Electronics
              </button>
              <button 
                className={`category-nav-item ${selectedCategory === 'Hostel Items' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('Hostel Items')}
              >
                <Home size={16} /> Hostel Items
              </button>
              <button 
                className={`category-nav-item ${selectedCategory === 'Fashion' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('Fashion')}
              >
                <Shirt size={16} /> Fashion
              </button>
            </nav>
          </div>

          {/* Price Range */}
          <div className="filter-section-block">
            <div className="filter-title">Price Range</div>
            <div className="price-inputs-row">
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice} 
                onChange={(e) => setMinPrice(e.target.value)} 
              />
              <span style={{ color: 'var(--text-muted)' }}>-</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(e.target.value)} 
              />
            </div>
          </div>

          {/* Location */}
          <div className="filter-section-block">
            <div className="filter-title">Location</div>
            <select 
              value={selectedLocation} 
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="All Locations">All Locations</option>
              <option value="North Campus">North Campus</option>
              <option value="Main Library">Main Library</option>
              <option value="South Hostel">South Hostel</option>
              <option value="Student Hub">Student Hub</option>
              <option value="Science Block">Science Block</option>
              <option value="East Wing">East Wing</option>
            </select>
          </div>

          {/* Condition */}
          <div className="filter-section-block">
            <div className="filter-title">Condition</div>
            <label className="checkbox-label-row">
              <input 
                type="checkbox" 
                checked={selectedConditions.includes('NEW')}
                onChange={() => handleConditionToggle('NEW')}
              />
              New / Unused
            </label>
            <label className="checkbox-label-row">
              <input 
                type="checkbox" 
                checked={selectedConditions.includes('LIKE NEW')}
                onChange={() => handleConditionToggle('LIKE NEW')}
              />
              Like New
            </label>
            <label className="checkbox-label-row">
              <input 
                type="checkbox" 
                checked={selectedConditions.includes('USED - GOOD')}
                onChange={() => handleConditionToggle('USED - GOOD')}
              />
              Used - Good
            </label>
          </div>
        </aside>

        {/* Right Products Grid */}
        <div className="products-grid">
          {filteredItems.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '56px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>No listings found</p>
              <p style={{ fontSize: '0.875rem' }}>There are currently no items listed. Click "Sell an Item" above to create a listing.</p>
            </div>
          ) : (
            filteredItems.map(item => (
            <div key={item.id} className="product-card">
              <div className="product-image-box">
                <img src={item.image} alt={item.title} />
                <div className="price-badge-overlay">
                  ${item.price.toFixed(2)}
                </div>
                <button 
                  className={`bookmark-heart-btn ${item.isBookmarked ? 'active' : ''}`}
                  onClick={() => toggleBookmarkMarketplace(item.id)}
                  aria-label="Save item"
                >
                  <Heart size={18} fill={item.isBookmarked ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="product-card-body">
                <div>
                  <h4 
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedItemForModal(item)}
                  >
                    {item.title}
                  </h4>
                  <div className="product-location">
                    <MapPin size={13} />
                    <span>{item.location}</span>
                  </div>
                </div>

                <div className="product-seller-footer">
                  <div className="seller-profile-row">
                    <img src={item.sellerAvatar} alt={item.sellerName} />
                    <span>{item.sellerName}</span>
                  </div>

                  <span className={`badge ${
                    item.condition === 'NEW' 
                      ? 'badge-new' 
                      : item.condition === 'LIKE NEW' 
                      ? 'badge-likenew' 
                      : 'badge-used'
                  }`}>
                    {item.condition}
                  </span>
                </div>
              </div>
            </div>
          )))}
        </div>
      </div>

      {/* Item Detail & Contact Modal */}
      {selectedItemForModal && (
        <div className="modal-overlay" onClick={() => setSelectedItemForModal(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedItemForModal.title}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedItemForModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ height: 220, borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 16 }}>
                <img 
                  src={selectedItemForModal.image} 
                  alt={selectedItemForModal.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ${selectedItemForModal.price.toFixed(2)}
                </span>
                <span className="badge badge-likenew">{selectedItemForModal.condition}</span>
              </div>

              <p style={{ fontSize: '0.938rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 16 }}>
                {selectedItemForModal.description || 'Quality campus-tested item available for hand-to-hand pickup.'}
              </p>

              <div style={{ background: 'var(--bg-page)', padding: 14, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <img 
                  src={selectedItemForModal.sellerAvatar} 
                  alt={selectedItemForModal.sellerName} 
                  style={{ width: 44, height: 44, borderRadius: '50%' }} 
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.938rem' }}>{selectedItemForModal.sellerName}</h4>
                  <span style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>Location: {selectedItemForModal.location}</span>
                </div>
                <button 
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  onClick={() => handleContactSeller(selectedItemForModal)}
                >
                  <MessageCircle size={16} /> Contact Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
