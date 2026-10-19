import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Ban, 
  Users, 
  Edit2, 
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

interface CommunityRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  leaderName: string;
  leaderEmail: string;
  membersCount: number;
  status: 'Approved' | 'Pending' | 'Suspended';
}

export const AdminCommunitiesTab: React.FC = () => {
  const { showToast } = useApp();

  const [communities, setCommunities] = useState<CommunityRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<CommunityRecord | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Academic');
  const [formLeaderName, setFormLeaderName] = useState('');
  const [formLeaderEmail, setFormLeaderEmail] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const loadCommunities = async () => {
    try {
      const data = await api.getAdminCommunities();
      if (Array.isArray(data)) {
        setCommunities(data);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  const handleOpenCreate = () => {
    setEditingCommunity(null);
    setFormName('');
    setFormCategory('Academic');
    setFormLeaderName('');
    setFormLeaderEmail('');
    setFormDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comm: CommunityRecord) => {
    setEditingCommunity(comm);
    setFormName(comm.name);
    setFormCategory(comm.category);
    setFormLeaderName(comm.leaderName);
    setFormLeaderEmail(comm.leaderEmail);
    setFormDescription(comm.description);
    setIsModalOpen(true);
  };

  const handleSaveCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) {
      showToast('Community name is required', 'error');
      return;
    }

    try {
      if (editingCommunity) {
        await api.updateAdminCommunity(editingCommunity.id, {
          name: formName,
          category: formCategory,
          leaderName: formLeaderName,
          leaderEmail: formLeaderEmail,
          description: formDescription
        });
        showToast('Community details updated!', 'success');
      } else {
        await api.createAdminCommunity({
          name: formName,
          category: formCategory,
          leaderName: formLeaderName,
          leaderEmail: formLeaderEmail,
          description: formDescription
        });
        showToast('New campus club registered!', 'success');
      }
      setIsModalOpen(false);
      loadCommunities();
    } catch (err: any) {
      showToast(err.message || 'Failed to save community', 'error');
    }
  };

  const handleToggleStatus = async (comm: CommunityRecord) => {
    const newStatus = comm.status === 'Approved' ? 'Suspended' : 'Approved';
    try {
      await api.updateAdminCommunity(comm.id, { status: newStatus });
      showToast(`Club "${comm.name}" marked as ${newStatus}`, 'info');
      setCommunities(prev => prev.map(c => c.id === comm.id ? { ...c, status: newStatus as any } : c));
    } catch (err: any) {
      showToast(err.message || 'Failed to update club status', 'error');
    }
  };

  const handleDeleteCommunity = async (comm: CommunityRecord) => {
    if (!window.confirm(`Are you sure you want to remove "${comm.name}"?`)) return;
    try {
      await api.deleteAdminCommunity(comm.id);
      showToast('Community removed', 'success');
      setCommunities(prev => prev.filter(c => c.id !== comm.id));
    } catch (err: any) {
      showToast(err.message || 'Failed to remove community', 'error');
    }
  };

  const filteredCommunities = communities.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.leaderName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div>
          <h2>Campus Clubs & Community Societies</h2>
          <p>Review student community applications, verify faculty advisors, and manage organization rosters</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={handleOpenCreate}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} /> Register New Club
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--admin-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search club name, category, or faculty advisor..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ height: 40, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border)', background: 'white', fontSize: '0.875rem' }}
        >
          <option value="ALL">All Status</option>
          <option value="Approved">Approved Clubs</option>
          <option value="Pending">Pending Approval</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Communities Table */}
      <div className="admin-table-shell">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Club / Organization</th>
              <th>Category</th>
              <th>Lead Organizer / Advisor</th>
              <th>Roster Size</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCommunities.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--admin-text-muted)' }}>
                  No campus communities found. Click "Register New Club" to add one.
                </td>
              </tr>
            ) : (
              filteredCommunities.map(comm => (
                <tr key={comm.id}>
                  {/* Name & Desc */}
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--admin-text-title)' }}>{comm.name}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {comm.description || 'Active university student society'}
                    </span>
                  </td>

                  {/* Category */}
                  <td>
                    <span className="admin-badge admin-badge-blue">
                      {comm.category}
                    </span>
                  </td>

                  {/* Leader */}
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.813rem' }}>{comm.leaderName || 'Advisor Assigned'}</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{comm.leaderEmail || 'campus.club@university.edu'}</span>
                  </td>

                  {/* Members */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.813rem' }}>
                      <Users size={14} color="var(--admin-text-muted)" /> {comm.membersCount} members
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`admin-badge ${
                      comm.status === 'Approved' ? 'admin-badge-green' :
                      comm.status === 'Pending' ? 'admin-badge-amber' : 'admin-badge-red'
                    }`}>
                      {comm.status === 'Approved' ? <CheckCircle size={11} /> : <Ban size={11} />} {comm.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button 
                        className="admin-action-btn"
                        onClick={() => handleToggleStatus(comm)}
                        title={comm.status === 'Approved' ? 'Suspend Club' : 'Approve Club'}
                        style={comm.status === 'Approved' ? {} : { color: '#059669', background: '#ECFDF5' }}
                      >
                        {comm.status === 'Approved' ? <Ban size={14} /> : <CheckCircle size={14} />}
                      </button>

                      <button 
                        className="admin-action-btn"
                        onClick={() => handleOpenEdit(comm)}
                        title="Edit Details"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button 
                        className="admin-action-btn danger"
                        onClick={() => handleDeleteCommunity(comm)}
                        title="Remove Club"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Compass size={18} color="var(--admin-blue-primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  {editingCommunity ? 'Edit Community' : 'Register New Club'}
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCommunity}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Club Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Artificial Intelligence Research Club"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Category</label>
                    <select 
                      value={formCategory} 
                      onChange={(e) => setFormCategory(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="Academic">Academic</option>
                      <option value="Technology">Technology</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Sports">Sports</option>
                      <option value="Social">Social</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Faculty / Leader</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dr. Saifur Rahman"
                      value={formLeaderName}
                      onChange={(e) => setFormLeaderName(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Official Contact Email</label>
                  <input 
                    type="email" 
                    placeholder="e.g. ai.club@university.edu"
                    value={formLeaderEmail}
                    onChange={(e) => setFormLeaderEmail(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Brief description of the club's objectives and activities..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingCommunity ? 'Save Changes' : 'Register Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
