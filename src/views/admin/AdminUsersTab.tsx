import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Ban, 
  CheckCircle, 
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
  department?: string;
  studentId?: string;
  avatar?: string;
  isBlocked?: boolean;
  createdAt?: string;
}

export const AdminUsersTab: React.FC = () => {
  const { showToast } = useApp();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'STUDENT' | 'FACULTY' | 'ADMIN'>('STUDENT');
  const [formDepartment, setFormDepartment] = useState('Computer Science');
  const [formStudentId, setFormStudentId] = useState('');

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminUsers();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch {
      // Fallback default users
      setUsers([
        {
          id: 'u-std',
          name: 'Student User',
          email: 'student@university.edu',
          role: 'STUDENT',
          department: 'Computer Science',
          studentId: 'CS-2023-8821',
          isBlocked: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'u-fac',
          name: 'Faculty Professor',
          email: 'faculty@university.edu',
          role: 'FACULTY',
          department: 'Software Engineering',
          studentId: 'FAC-901',
          isBlocked: false,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenAddModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('password123');
    setFormRole('STUDENT');
    setFormDepartment('Computer Science');
    setFormStudentId('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (u: UserRecord) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormRole(u.role);
    setFormDepartment(u.department || 'Computer Science');
    setFormStudentId(u.studentId || '');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      showToast('Name and email are required', 'error');
      return;
    }
    try {
      await api.createAdminUser({
        name: formName,
        email: formEmail,
        password: formPassword || 'password123',
        role: formRole,
        department: formDepartment,
        studentId: formStudentId
      });
      showToast(`User ${formName} created successfully!`, 'success');
      setIsAddModalOpen(false);
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to create user', 'error');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await api.updateAdminUser(editingUser.id, {
        name: formName,
        email: formEmail,
        role: formRole,
        department: formDepartment,
        studentId: formStudentId
      });
      showToast(`User ${formName} updated!`, 'success');
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user', 'error');
    }
  };

  const handleToggleBlock = async (u: UserRecord) => {
    try {
      await api.toggleBlockAdminUser(u.id);
      showToast(`User ${u.name} is now ${u.isBlocked ? 'unblocked' : 'blocked'}!`, 'info');
      setUsers(prev => prev.map(item => item.id === u.id ? { ...item, isBlocked: !item.isBlocked } : item));
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle block status', 'error');
    }
  };

  const handleDeleteUser = async (u: UserRecord) => {
    if (!window.confirm(`Are you sure you want to remove user "${u.name}"? This cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteAdminUser(u.id);
      showToast(`User ${u.name} removed from system`, 'success');
      setUsers(prev => prev.filter(item => item.id !== u.id));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  // Filter
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.studentId && u.studentId.toLowerCase().includes(search.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = 
      statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && !u.isBlocked) || 
      (statusFilter === 'BLOCKED' && u.isBlocked);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div>
          <h2>User Directory & Access Management</h2>
          <p>Oversee registered campus students, faculty members, and administrative staff accounts</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={handleOpenAddModal}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <UserPlus size={16} /> Add New User
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--admin-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name, email, student ID, department..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ height: 40, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border)', background: 'white', fontSize: '0.875rem' }}
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students Only</option>
            <option value="FACULTY">Faculty & Teachers</option>
            <option value="ADMIN">Administrators</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ height: 40, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border)', background: 'white', fontSize: '0.875rem' }}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Users</option>
            <option value="BLOCKED">Blocked Users</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="admin-table-shell">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Department / ID</th>
              <th>Status</th>
              <th>Registered</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--admin-text-muted)' }}>
                  Loading user directory...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--admin-text-muted)' }}>
                  No campus users found matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.id}>
                  {/* User info */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img 
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                        alt={u.name} 
                        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--admin-text-title)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role badge */}
                  <td>
                    <span className={`admin-badge ${
                      u.role === 'STUDENT' ? 'admin-badge-blue' :
                      u.role === 'FACULTY' ? 'admin-badge-amber' : 'admin-badge-green'
                    }`}>
                      {u.role === 'STUDENT' ? 'Student' : u.role === 'FACULTY' ? 'Faculty / Teacher' : 'Admin'}
                    </span>
                  </td>

                  {/* Department & ID */}
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.department || 'Computer Science'}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                      {u.studentId || 'ID: Standard'}
                    </span>
                  </td>

                  {/* Status badge */}
                  <td>
                    {u.isBlocked ? (
                      <span className="admin-badge admin-badge-red">
                        <Ban size={11} /> Blocked
                      </span>
                    ) : (
                      <span className="admin-badge admin-badge-green">
                        <CheckCircle size={11} /> Active
                      </span>
                    )}
                  </td>

                  {/* Registered date */}
                  <td style={{ fontSize: '0.813rem', color: 'var(--admin-text-muted)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button 
                        className="admin-action-btn"
                        onClick={() => handleOpenEditModal(u)}
                        title="Edit User Details"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button 
                        className={`admin-action-btn ${u.isBlocked ? '' : 'danger'}`}
                        onClick={() => handleToggleBlock(u)}
                        title={u.isBlocked ? 'Unblock User' : 'Block User from Campus Portal'}
                        style={u.isBlocked ? { background: '#ECFDF5', color: '#047857', borderColor: '#A7F3D0' } : {}}
                      >
                        <Ban size={14} />
                      </button>

                      <button 
                        className="admin-action-btn danger"
                        onClick={() => handleDeleteUser(u)}
                        title="Delete User Permanently"
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

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <UserPlus size={20} color="var(--admin-blue-primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Add New Campus User</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Full Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ayesha Rahman"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>University Email *</label>
                  <input 
                    type="email" 
                    placeholder="e.g. ayesha.r@university.edu"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Role</label>
                    <select 
                      value={formRole} 
                      onChange={(e) => setFormRole(e.target.value as any)}
                      style={{ width: '100%' }}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="FACULTY">Faculty / Teacher</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Department</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Computer Science"
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Student / Staff ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. CS-2024-1102"
                      value={formStudentId}
                      onChange={(e) => setFormStudentId(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Temporary Password</label>
                    <input 
                      type="password" 
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Edit2 size={18} color="var(--admin-blue-primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Edit User Details</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setEditingUser(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Full Name</label>
                  <input 
                    type="text" 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Email</label>
                  <input 
                    type="email" 
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Role</label>
                    <select 
                      value={formRole} 
                      onChange={(e) => setFormRole(e.target.value as any)}
                      style={{ width: '100%' }}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="FACULTY">Faculty / Teacher</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Department</label>
                    <input 
                      type="text" 
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Student / Staff ID</label>
                  <input 
                    type="text" 
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
