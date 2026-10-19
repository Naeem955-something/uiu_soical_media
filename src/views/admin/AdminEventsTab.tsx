import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  MapPin, 
  Clock, 
  X,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

interface EventRecord {
  id: string;
  title: string;
  typeBadge?: 'WORKSHOP' | 'SEMINAR' | 'HACKATHON';
  date: string;
  time: string;
  location: string;
  description: string;
  registeredCount: number;
  maxCapacity: number;
  image?: string;
}

export const AdminEventsTab: React.FC = () => {
  const { showToast } = useApp();

  const [events, setEvents] = useState<EventRecord[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [viewParticipantsEvent, setViewParticipantsEvent] = useState<EventRecord | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<'WORKSHOP' | 'SEMINAR' | 'HACKATHON'>('WORKSHOP');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('10:00 AM');
  const [formLocation, setFormLocation] = useState('Main Auditorium');
  const [formCapacity, setFormCapacity] = useState('100');
  const [formDescription, setFormDescription] = useState('');

  const loadEvents = async () => {
    try {
      const data = await api.getAdminEvents();
      if (Array.isArray(data)) {
        setEvents(data);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormTitle('');
    setFormType('WORKSHOP');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime('02:00 PM');
    setFormLocation('Auditorium Complex');
    setFormCapacity('120');
    setFormDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev: EventRecord) => {
    setEditingEvent(ev);
    setFormTitle(ev.title);
    setFormType(ev.typeBadge || 'WORKSHOP');
    setFormDate(ev.date);
    setFormTime(ev.time);
    setFormLocation(ev.location);
    setFormCapacity(String(ev.maxCapacity || 100));
    setFormDescription(ev.description || '');
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDate) {
      showToast('Title and date are required', 'error');
      return;
    }

    try {
      if (editingEvent) {
        await api.updateAdminEvent(editingEvent.id, {
          title: formTitle,
          typeBadge: formType,
          date: formDate,
          time: formTime,
          location: formLocation,
          maxCapacity: Number(formCapacity),
          description: formDescription
        });
        showToast('Event updated successfully!', 'success');
      } else {
        await api.createAdminEvent({
          title: formTitle,
          typeBadge: formType,
          date: formDate,
          time: formTime,
          location: formLocation,
          maxCapacity: Number(formCapacity),
          description: formDescription
        });
        showToast('New campus event published!', 'success');
      }
      setIsModalOpen(false);
      loadEvents();
    } catch (err: any) {
      showToast(err.message || 'Failed to save event', 'error');
    }
  };

  const handleDeleteEvent = async (ev: EventRecord) => {
    if (!window.confirm(`Delete event "${ev.title}"?`)) return;
    try {
      await api.deleteAdminEvent(ev.id);
      showToast('Event removed', 'success');
      setEvents(prev => prev.filter(e => e.id !== ev.id));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete event', 'error');
    }
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = 
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || e.typeBadge === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      {/* Header */}
      <div className="admin-view-header">
        <div>
          <h2>University Event Management</h2>
          <p>Organize academic seminars, technical workshops, and inspect student registrations</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={handleOpenCreate}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} /> Create Event
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--admin-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search event title, venue, or keyword..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ height: 40, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border)', background: 'white', fontSize: '0.875rem' }}
        >
          <option value="ALL">All Event Types</option>
          <option value="WORKSHOP">Workshops</option>
          <option value="SEMINAR">Seminars</option>
          <option value="HACKATHON">Hackathons</option>
        </select>
      </div>

      {/* Events Table */}
      <div className="admin-table-shell">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Event Title</th>
              <th>Type</th>
              <th>Schedule</th>
              <th>Venue</th>
              <th>Registrations</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--admin-text-muted)' }}>
                  No campus events found. Click "Create Event" to schedule one.
                </td>
              </tr>
            ) : (
              filteredEvents.map(ev => {
                const pct = Math.min(100, Math.round(((ev.registeredCount || 0) / (ev.maxCapacity || 100)) * 100));
                return (
                  <tr key={ev.id}>
                    {/* Event Title */}
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--admin-text-title)' }}>{ev.title}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {ev.description || 'Campus academic event'}
                      </span>
                    </td>

                    {/* Type Badge */}
                    <td>
                      <span className={`admin-badge ${
                        ev.typeBadge === 'HACKATHON' ? 'admin-badge-amber' :
                        ev.typeBadge === 'WORKSHOP' ? 'admin-badge-blue' : 'admin-badge-green'
                      }`}>
                        {ev.typeBadge || 'EVENT'}
                      </span>
                    </td>

                    {/* Schedule */}
                    <td>
                      <div style={{ fontSize: '0.813rem', fontWeight: 600 }}>{ev.date}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} /> {ev.time}
                      </div>
                    </td>

                    {/* Venue */}
                    <td>
                      <div style={{ fontSize: '0.813rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} color="var(--admin-blue-primary)" /> {ev.location}
                      </div>
                    </td>

                    {/* Registrations */}
                    <td style={{ minWidth: 150 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>
                        <span>{ev.registeredCount || 0} registered</span>
                        <span style={{ color: 'var(--admin-text-muted)' }}>Cap: {ev.maxCapacity || 100}</span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#E2E8F0', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--admin-blue-primary)' }} />
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button 
                          className="admin-action-btn"
                          onClick={() => setViewParticipantsEvent(ev)}
                          title="View Registered Participants"
                        >
                          <Users size={14} />
                        </button>

                        <button 
                          className="admin-action-btn"
                          onClick={() => handleOpenEdit(ev)}
                          title="Edit Event"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button 
                          className="admin-action-btn danger"
                          onClick={() => handleDeleteEvent(ev)}
                          title="Delete Event"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Calendar size={18} color="var(--admin-blue-primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  {editingEvent ? 'Edit Campus Event' : 'Create New Event'}
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Event Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. AI & Robotics Symposium 2026"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Category</label>
                    <select 
                      value={formType} 
                      onChange={(e) => setFormType(e.target.value as any)}
                      style={{ width: '100%' }}
                    >
                      <option value="WORKSHOP">Workshop</option>
                      <option value="SEMINAR">Seminar</option>
                      <option value="HACKATHON">Hackathon</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Max Capacity</label>
                    <input 
                      type="number" 
                      value={formCapacity}
                      onChange={(e) => setFormCapacity(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Date *</label>
                    <input 
                      type="date" 
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Time</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 03:00 PM"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Location / Room</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Science Complex Lab 301"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.813rem', fontWeight: 700, marginBottom: 4 }}>Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Brief description of the event agenda and requirements..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingEvent ? 'Save Changes' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Participants Modal */}
      {viewParticipantsEvent && (
        <div className="modal-overlay" onClick={() => setViewParticipantsEvent(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={18} color="var(--admin-blue-primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Event Attendees</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setViewParticipantsEvent(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border)', marginBottom: 16 }}>
                <div style={{ fontWeight: 800, color: 'var(--admin-text-title)' }}>{viewParticipantsEvent.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                  {viewParticipantsEvent.date} • {viewParticipantsEvent.location}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '0.813rem', fontWeight: 700 }}>
                  Confirmed Registrations: {viewParticipantsEvent.registeredCount || 0} / {viewParticipantsEvent.maxCapacity}
                </span>
                <span className="admin-badge admin-badge-green">
                  <CheckCircle2 size={12} /> Enrollment Active
                </span>
              </div>

              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-md)', padding: 12, background: 'white' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.813rem' }}>
                    <span style={{ fontWeight: 600 }}>Student User (student@university.edu)</span>
                    <span className="admin-badge admin-badge-blue">Registered</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.813rem' }}>
                    <span style={{ fontWeight: 600 }}>Fahima Tonni (fahima.t@university.edu)</span>
                    <span className="admin-badge admin-badge-blue">Registered</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.813rem' }}>
                    <span style={{ fontWeight: 600 }}>Alex Rivera (alex.r@university.edu)</span>
                    <span className="admin-badge admin-badge-blue">Registered</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setViewParticipantsEvent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
