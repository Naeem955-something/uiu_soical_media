import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SellItemModal: React.FC = () => {
  const { isSellModalOpen, setIsSellModalOpen, addMarketplaceItem, user } = useApp();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'Books' | 'Electronics' | 'Hostel Items' | 'Fashion' | 'Other'>('Books');
  const [condition, setCondition] = useState<'NEW' | 'LIKE NEW' | 'USED - GOOD' | 'USED - FAIR'>('LIKE NEW');
  const [location, setLocation] = useState('North Campus');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  if (!isSellModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;

    addMarketplaceItem({
      title: title.trim(),
      price: parseFloat(price) || 0,
      category,
      condition,
      location,
      image: image.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      description: description.trim(),
      sellerName: user.name,
      sellerAvatar: user.avatar
    });

    setTitle('');
    setPrice('');
    setDescription('');
    setImage('');
    setIsSellModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsSellModalOpen(false)}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Sell an Item on Campus</h3>
          <button 
            className="modal-close-btn"
            onClick={() => setIsSellModalOpen(false)}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
                Listing Title *
              </label>
              <input 
                type="text" 
                placeholder="e.g. Calculus Textbook, Desk Lamp, TI-84 Calculator..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
                  Price ($ USD) *
                </label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="25.00" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{ paddingLeft: 34 }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
                  Category
                </label>
                <select value={category} onChange={(e: any) => setCategory(e.target.value)}>
                  <option value="Books">Books</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Hostel Items">Hostel Items</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
                  Condition
                </label>
                <select value={condition} onChange={(e: any) => setCondition(e.target.value)}>
                  <option value="NEW">NEW</option>
                  <option value="LIKE NEW">LIKE NEW</option>
                  <option value="USED - GOOD">USED - GOOD</option>
                  <option value="USED - FAIR">USED - FAIR</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
                  Campus Location
                </label>
                <select value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="North Campus">North Campus</option>
                  <option value="Main Library">Main Library</option>
                  <option value="South Hostel">South Hostel</option>
                  <option value="Student Hub">Student Hub</option>
                  <option value="Science Block">Science Block</option>
                  <option value="East Wing">East Wing</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
                Image URL (Optional)
              </label>
              <input 
                type="url" 
                placeholder="https://images.unsplash.com/..." 
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 6 }}>
                Item Description
              </label>
              <textarea 
                rows={3} 
                placeholder="Details about quality, included accessories, or pickup time..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => setIsSellModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Publish Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
