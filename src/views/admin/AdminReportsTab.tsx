import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Eye, 
  X,
  Flag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminReport } from '../../types';

export const AdminReportsTab: React.FC = () => {
  const { adminReports, resolveAdminReport, deleteAdminReport, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);

  const handleResolve = (id: string) => {
    resolveAdminReport(id, 'Reviewed');
    showToast('Report marked as Resolved & Reviewed', 'success');
    if (selectedReport?.id === id) {
      setSelectedReport(prev => prev ? { ...prev, status: 'Reviewed' } : null);
    }
  };

  const handleDismiss = (id: string) => {
    resolveAdminReport(id, 'Dismissed');
    showToast('Report dismissed without penalty', 'info');
    if (selectedReport?.id === id) {
      setSelectedReport(prev => prev ? { ...prev, status: 'Dismissed' } : null);
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this incident report?')) return;
    deleteAdminReport(id);
    showToast('Report removed from audit records', 'success');
    if (selectedReport?.id === id) {
      setSelectedReport(null);
    }
  };

  const filteredReports = adminReports.filter(r => {
    const matchesSearch = 
      r.reportedContent.toLowerCase().includes(search.toLowerCase()) ||
      r.reporterName.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase()) ||
      r.locationContext.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div>
          <h2>Incident & Content Reports</h2>
          <p>Review student grievance submissions, harassment flags, and academic violation reports</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--admin-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search report reason, flagged content, or student..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ height: 40, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border)', background: 'white', fontSize: '0.875rem' }}
          >
            <option value="ALL">All Status</option>
            <option value="Pending">Pending Review</option>
            <option value="Reviewed">Resolved / Reviewed</option>
            <option value="Dismissed">Dismissed</option>
          </select>

          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ height: 40, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border)', background: 'white', fontSize: '0.875rem' }}
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="admin-table-shell">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Reporter</th>
              <th>Flagged Content</th>
              <th>Location Context</th>
              <th>Reason</th>
              <th>Priority</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--admin-text-muted)' }}>
                  No reports matching filter criteria.
                </td>
              </tr>
            ) : (
              filteredReports.map(r => (
                <tr key={r.id}>
                  {/* Reporter */}
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--admin-text-title)' }}>{r.reporterName}</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{r.reporterRole}</span>
                  </td>

                  {/* Flagged Content */}
                  <td style={{ maxWidth: 280 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-title)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      "{r.reportedContent}"
                    </div>
                  </td>

                  {/* Context */}
                  <td style={{ fontSize: '0.813rem', color: 'var(--admin-text-body)' }}>
                    {r.locationContext}
                  </td>

                  {/* Reason */}
                  <td>
                    <span className="admin-badge admin-badge-gray" style={{ fontSize: '0.72rem' }}>
                      {r.reason}
                    </span>
                  </td>

                  {/* Priority */}
                  <td>
                    <span className={`admin-badge ${
                      r.priority === 'Urgent' ? 'admin-badge-red' :
                      r.priority === 'High' ? 'admin-badge-amber' : 'admin-badge-blue'
                    }`}>
                      {r.priority}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`admin-badge ${
                      r.status === 'Reviewed' ? 'admin-badge-green' :
                      r.status === 'Dismissed' ? 'admin-badge-gray' : 'admin-badge-amber'
                    }`}>
                      {r.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button 
                        className="admin-action-btn"
                        onClick={() => setSelectedReport(r)}
                        title="View Full Report Details"
                      >
                        <Eye size={14} />
                      </button>

                      {r.status !== 'Reviewed' && (
                        <button 
                          className="admin-action-btn"
                          onClick={() => handleResolve(r.id)}
                          title="Resolve & Mark Reviewed"
                          style={{ color: '#059669' }}
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}

                      {r.status !== 'Dismissed' && (
                        <button 
                          className="admin-action-btn"
                          onClick={() => handleDismiss(r.id)}
                          title="Dismiss Report"
                          style={{ color: '#D97706' }}
                        >
                          <XCircle size={14} />
                        </button>
                      )}

                      <button 
                        className="admin-action-btn danger"
                        onClick={() => handleDelete(r.id)}
                        title="Delete Report"
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

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Flag size={18} color="#DC2626" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Incident Report #{selectedReport.id.substring(0, 8)}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedReport(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
                  Reporter Information
                </span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: 2 }}>{selectedReport.reporterName} ({selectedReport.reporterRole})</div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
                  Reported Content
                </span>
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginTop: 4, color: '#991B1B', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  "{selectedReport.reportedContent}"
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
                    Reason & Violation
                  </span>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{selectedReport.reason}</div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
                    Origin Location
                  </span>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{selectedReport.locationContext}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: '0.813rem', fontWeight: 700 }}>Priority:</span>
                <span className={`admin-badge ${selectedReport.priority === 'Urgent' ? 'admin-badge-red' : 'admin-badge-amber'}`}>
                  {selectedReport.priority}
                </span>

                <span style={{ fontSize: '0.813rem', fontWeight: 700, marginLeft: 14 }}>Status:</span>
                <span className={`admin-badge ${selectedReport.status === 'Reviewed' ? 'admin-badge-green' : 'admin-badge-amber'}`}>
                  {selectedReport.status}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => handleDismiss(selectedReport.id)}
              >
                Dismiss Report
              </button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={() => handleResolve(selectedReport.id)}
              >
                Resolve & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
