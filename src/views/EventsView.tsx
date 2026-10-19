import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  SlidersHorizontal, 
  Plus, 
  QrCode, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  Clock,
  Filter,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EventItem } from '../types';

// Robust date parsing for various date formats (e.g. "Nov 20, 2025", "2026-10-05", "October 5, 2026")
function parseEventDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  
  // Format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  // Standard parse
  const timestamp = Date.parse(trimmed);
  if (!isNaN(timestamp)) {
    return new Date(timestamp);
  }

  // Format: "Nov 20, 2025" or "November 20 2025"
  const clean = trimmed.replace(/,/g, '');
  const parts = clean.split(/\s+/);
  if (parts.length >= 3) {
    const months: Record<string, number> = {
      jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
      apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
      aug: 7, august: 7, sep: 8, september: 8, oct: 9, october: 9,
      nov: 10, november: 10, dec: 11, december: 11
    };
    const m = months[parts[0].toLowerCase().slice(0, 3)];
    const d = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);
    if (m !== undefined && !isNaN(d) && !isNaN(y)) {
      return new Date(y, m, d);
    }
  }
  return null;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function formatDateToReadable(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateToInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const EventsView: React.FC = () => {
  const { 
    events, 
    registerForEvent, 
    addEvent, 
    setActiveTicketEvent, 
    setIsTicketModalOpen, 
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'Registered' | 'Attended' | 'Past'>('Registered');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Real-time clock & calendar navigation state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterDateActive, setFilterDateActive] = useState<boolean>(false);

  // New Event Form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'SEMINAR' | 'WORKSHOP' | 'HACKATHON'>('WORKSHOP');
  const [newDate, setNewDate] = useState(() => formatDateToInput(new Date()));
  const [newTime, setNewTime] = useState('02:00 PM - 04:00 PM');
  const [newLocation, setNewLocation] = useState('Innovation Lab 1');
  const [newDesc, setNewDesc] = useState('');

  // Live real-time clock ticker (every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const featuredEvent = useMemo(() => {
    return events.find(e => e.isFeatured) || events[0];
  }, [events]);

  // Real-time countdown timer to featured event
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false
  });

  useEffect(() => {
    const calculateCountdown = () => {
      if (!featuredEvent) return;
      const parsed = parseEventDate(featuredEvent.date);
      if (!parsed) return;

      let targetHours = 9;
      let targetMins = 0;
      if (featuredEvent.time) {
        const match = featuredEvent.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (match) {
          targetHours = parseInt(match[1], 10);
          targetMins = parseInt(match[2], 10);
          const ampm = match[3] ? match[3].toUpperCase() : null;
          if (ampm === 'PM' && targetHours < 12) targetHours += 12;
          if (ampm === 'AM' && targetHours === 12) targetHours = 0;
        }
      }

      const target = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), targetHours, targetMins, 0);
      const diff = target.getTime() - Date.now();

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      } else {
        const seconds = Math.floor((diff / 1000) % 60);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        setCountdown({ days, hours, minutes, seconds, isPast: false });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [featuredEvent]);

  // Calendar days computation for currently selected month
  const calendarDays = useMemo(() => {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    const today = new Date();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: Array<{
      date: Date;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      events: EventItem[];
    }> = [];

    // Leading days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      const dayEvents = events.filter(e => {
        const ed = parseEventDate(e.date);
        return ed ? isSameDay(ed, d) : false;
      });
      cells.push({
        date: d,
        dayNumber: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: isSameDay(d, today),
        isSelected: isSameDay(d, selectedDate),
        events: dayEvents
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(year, month, d);
      const dayEvents = events.filter(e => {
        const ed = parseEventDate(e.date);
        return ed ? isSameDay(ed, dayDate) : false;
      });
      cells.push({
        date: dayDate,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: isSameDay(dayDate, today),
        isSelected: isSameDay(dayDate, selectedDate),
        events: dayEvents
      });
    }

    // Trailing days from next month to make clean grid
    const totalCellsNeeded = cells.length <= 35 ? 35 : 42;
    const remaining = totalCellsNeeded - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const dayEvents = events.filter(e => {
        const ed = parseEventDate(e.date);
        return ed ? isSameDay(ed, nextDate) : false;
      });
      cells.push({
        date: nextDate,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: isSameDay(nextDate, today),
        isSelected: isSameDay(nextDate, selectedDate),
        events: dayEvents
      });
    }

    return cells;
  }, [currentViewDate, selectedDate, events]);

  // Events on the selected calendar day
  const selectedDayEvents = useMemo(() => {
    return events.filter(e => {
      const ed = parseEventDate(e.date);
      return ed ? isSameDay(ed, selectedDate) : false;
    });
  }, [events, selectedDate]);

  // Cards to display in right column (filtered by date if toggle is on)
  const displayedEvents = useMemo(() => {
    const list = events.filter(e => !e.isFeatured);
    if (filterDateActive) {
      return list.filter(e => {
        const ed = parseEventDate(e.date);
        return ed ? isSameDay(ed, selectedDate) : false;
      });
    }
    return list;
  }, [events, filterDateActive, selectedDate]);

  // Calendar month navigation
  const handlePrevMonth = () => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentViewDate(now);
    setSelectedDate(now);
  };

  const handleCellClick = (cell: { date: Date; isCurrentMonth: boolean }) => {
    setSelectedDate(cell.date);
    if (!cell.isCurrentMonth) {
      setCurrentViewDate(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
    }
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let formattedDate = newDate;
    const parsed = parseEventDate(newDate);
    if (parsed) {
      formattedDate = formatDateToReadable(parsed);
    }

    addEvent({
      title: newTitle.trim(),
      typeBadge: newType,
      date: formattedDate,
      time: newTime || '02:00 PM',
      location: newLocation || 'Campus Innovation Center',
      description: newDesc || 'Campus community event open to all students.',
      maxCapacity: 60,
      userRole: 'Attendee'
    });

    setNewTitle('');
    setNewDesc('');
    setShowSubmitModal(false);
    showToast('Event created and plotted on real-time calendar!', 'success');
  };

  const isSelectedToday = isSameDay(selectedDate, new Date());

  return (
    <div>
      {/* Events Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Campus Events</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage your schedule and discover what's happening at UniConnect in real time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="btn-secondary"
            onClick={() => showToast('Active semester calendar loaded', 'info')}
          >
            <SlidersHorizontal size={16} /> Filter
          </button>
          <button 
            className="btn-primary"
            onClick={() => {
              setNewDate(formatDateToInput(selectedDate));
              setShowSubmitModal(true);
            }}
          >
            <Plus size={18} /> Submit Event
          </button>
        </div>
      </div>

      {/* Featured Event Hero Banner */}
      {featuredEvent && (
        <div className="featured-event-hero">
          <div className="event-hero-image-wrap">
            <img 
              src={featuredEvent.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80"} 
              alt={featuredEvent.title} 
            />
            <span className="featured-pill-overlay">
              {featuredEvent.typeBadge || 'FEATURED'}
            </span>
          </div>

          <div className="event-hero-info-wrap">
            <div>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: 8 }}>
                {featuredEvent.title}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CalendarIcon size={16} color="#D97706" /> {featuredEvent.date}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={16} color="#D97706" /> {featuredEvent.location}
                </span>
              </div>

              {/* Real-time countdown timer */}
              <div className="countdown-box">
                <span className="countdown-label">
                  {countdown.isPast ? 'STATUS' : 'LIVE COUNTDOWN'}
                </span>
                <span className="countdown-digits">
                  {countdown.isPast 
                    ? 'HAPPENING TODAY / CONCLUDED'
                    : `${String(countdown.days).padStart(2, '0')}d : ${String(countdown.hours).padStart(2, '0')}h : ${String(countdown.minutes).padStart(2, '0')}m : ${String(countdown.seconds).padStart(2, '0')}s`
                  }
                </span>
              </div>

              <p style={{ fontSize: '0.938rem', color: 'var(--text-body)', lineHeight: 1.6, margin: '14px 0 20px 0' }}>
                {featuredEvent.description}
              </p>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.813rem', fontWeight: 700, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Registration Status</span>
                  <span style={{ color: '#D97706' }}>{featuredEvent.registeredCount}/{featuredEvent.maxCapacity} joined</span>
                </div>
                <div style={{ height: 8, background: '#F3F4F6', borderRadius: 999, overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      background: 'var(--primary)', 
                      width: `${Math.min(100, (featuredEvent.registeredCount / featuredEvent.maxCapacity) * 100)}%` 
                    }} 
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
              <button 
                className="btn-primary"
                style={{ flex: 1, padding: '12px 24px' }}
                onClick={() => registerForEvent(featuredEvent.id)}
              >
                {featuredEvent.userRegistered ? 'Registered (View Pass)' : 'Register Now'}
              </button>
              <button 
                className="btn-secondary"
                style={{ padding: '12px 14px' }}
                onClick={() => showToast(`Added "${featuredEvent.title}" to device schedule`, 'success')}
                aria-label="Add to calendar"
              >
                <CalendarIcon size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Middle Row: Real-Time Event Calendar & Event Cards */}
      <div className="events-split-row">
        {/* Real-Time Interactive Calendar Widget */}
        <aside className="calendar-card">
          {/* Top Bar with Live Clock */}
          <div className="calendar-top-bar">
            <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Event Calendar</h4>
            <div className="calendar-live-pill" title="Live clock synchronized with your local time">
              <span className="live-pulse-dot" />
              <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>

          {/* Month Selector & Controls */}
          <div className="calendar-month-selector">
            <span className="calendar-month-title">
              {MONTH_NAMES[currentViewDate.getMonth()]} {currentViewDate.getFullYear()}
            </span>
            <div className="calendar-nav-buttons">
              <button 
                className="calendar-today-btn" 
                onClick={handleJumpToToday}
                title="Jump to today's date"
              >
                Today
              </button>
              <button 
                className="nav-icon-btn" 
                style={{ width: 28, height: 28 }} 
                onClick={handlePrevMonth}
                aria-label="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                className="nav-icon-btn" 
                style={{ width: 28, height: 28 }} 
                onClick={handleNextMonth}
                aria-label="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Calendar Day Labels & Cells */}
          <div className="calendar-grid-cells">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <span key={i} className="calendar-day-header">{d}</span>
            ))}

            {calendarDays.map((cell, idx) => {
              const hasEvents = cell.events.length > 0;
              return (
                <div
                  key={idx}
                  onClick={() => handleCellClick(cell)}
                  className={`calendar-cell ${cell.isCurrentMonth ? '' : 'other-month'} ${cell.isToday ? 'is-today' : ''} ${cell.isSelected ? 'is-selected' : ''}`}
                  title={`${cell.date.toDateString()}${hasEvents ? ` (${cell.events.length} event${cell.events.length > 1 ? 's' : ''})` : ''}`}
                >
                  <span>{cell.dayNumber}</span>
                  {hasEvents && (
                    <div className="calendar-event-dots-row">
                      {cell.events.slice(0, 3).map((ev, ei) => {
                        const typeCls = ev.typeBadge === 'WORKSHOP' 
                          ? 'workshop' 
                          : ev.typeBadge === 'HACKATHON' 
                            ? 'hackathon' 
                            : 'seminar';
                        return <span key={ei} className={`calendar-event-dot ${typeCls}`} />;
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Schedule for Selected Date */}
          <div className="calendar-schedule-card">
            <div className="calendar-schedule-header">
              <span className="calendar-schedule-title">
                {isSelectedToday ? "TODAY'S SCHEDULE" : `SCHEDULE FOR ${formatDateToReadable(selectedDate).toUpperCase()}`}
              </span>
              <span className="calendar-schedule-badge">
                {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'event' : 'events'}
              </span>
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="calendar-schedule-empty">
                <CalendarIcon size={22} style={{ opacity: 0.45, marginBottom: 6, display: 'inline-block' }} />
                <p style={{ margin: '0 0 10px 0', fontSize: '0.813rem', color: 'var(--text-muted)' }}>
                  No campus events scheduled on {formatDateToReadable(selectedDate)}.
                </p>
                <button 
                  className="btn-secondary" 
                  style={{ fontSize: '0.75rem', padding: '5px 12px', borderRadius: 'var(--radius-sm)' }}
                  onClick={() => {
                    setNewDate(formatDateToInput(selectedDate));
                    setShowSubmitModal(true);
                  }}
                >
                  <Plus size={13} style={{ marginRight: 4 }} /> Schedule for this day
                </button>
              </div>
            ) : (
              <div>
                {selectedDayEvents.map(ev => {
                  const borderCol = ev.typeBadge === 'WORKSHOP' 
                    ? '#10B981' 
                    : ev.typeBadge === 'HACKATHON' 
                      ? '#D97706' 
                      : '#2563EB';
                  return (
                    <div 
                      key={ev.id} 
                      className="calendar-schedule-item" 
                      style={{ borderLeft: `3px solid ${borderCol}` }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                        <h5 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>{ev.title}</h5>
                        <span 
                          className={`badge ${
                            ev.typeBadge === 'WORKSHOP' ? 'badge-club' : ev.typeBadge === 'HACKATHON' ? 'badge-faculty' : 'badge-student'
                          }`} 
                          style={{ fontSize: '0.625rem', padding: '1px 5px', flexShrink: 0 }}
                        >
                          {ev.typeBadge || 'EVENT'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} /> {ev.time} • {ev.location}
                        </span>
                        <button 
                          style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          onClick={() => registerForEvent(ev.id)}
                        >
                          {ev.userRegistered ? 'Registered ✓' : 'Register'}
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button
                  className="btn-secondary"
                  style={{ width: '100%', fontSize: '0.75rem', padding: '7px 10px', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  onClick={() => setFilterDateActive(!filterDateActive)}
                >
                  <Filter size={13} />
                  {filterDateActive ? 'Show All Events in Feed' : `Filter Events Feed (${selectedDayEvents.length})`}
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Event Cards Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filterDateActive && (
            <div className="calendar-filter-active-banner">
              <span>
                Showing events scheduled for <strong>{formatDateToReadable(selectedDate)}</strong> ({displayedEvents.length} found)
              </span>
              <button 
                className="btn-secondary" 
                style={{ fontSize: '0.75rem', padding: '3px 10px' }}
                onClick={() => setFilterDateActive(false)}
              >
                Clear Filter
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {displayedEvents.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>
                  {filterDateActive ? `No events found for ${formatDateToReadable(selectedDate)}` : 'No upcoming events scheduled'}
                </p>
                <p style={{ fontSize: '0.85rem', marginBottom: 16 }}>
                  {filterDateActive ? 'Try selecting another date from the calendar or submit a new event.' : 'Create an event using the "Submit Event" button above.'}
                </p>
                {filterDateActive && (
                  <button className="btn-secondary" onClick={() => setFilterDateActive(false)}>
                    Show All Campus Events
                  </button>
                )}
              </div>
            ) : (
              displayedEvents.map(ev => (
                <div key={ev.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span className={`badge ${
                      ev.typeBadge === 'WORKSHOP' ? 'badge-club' : ev.typeBadge === 'HACKATHON' ? 'badge-faculty' : 'badge-student'
                    }`}>
                      {ev.typeBadge || 'EVENT'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {ev.date}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: 6 }}>{ev.title}</h4>
                  <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                    {ev.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>{ev.registeredCount}/{ev.maxCapacity} joined</span>
                    <button 
                      style={{ color: '#D97706', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 4 }}
                      onClick={() => registerForEvent(ev.id)}
                    >
                      {ev.userRegistered ? 'Registered ✓' : 'Register'} <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Host Your Own Event Toolkit Card */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 28, background: '#FFFDF9' }}>
            <div>
              <h4 style={{ fontSize: '1.25rem', marginBottom: 6 }}>Host Your Own Event?</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 440, marginBottom: 16 }}>
                Empower your student organization or research group by organizing a campus-wide gathering. Use our unified toolset for registration, live schedule plotting, and QR admission passes.
              </p>
              <button 
                className="btn-secondary"
                onClick={() => showToast('Event Organizer Toolkit downloaded (PDF + Checklists)', 'success')}
              >
                Get Event Toolkit
              </button>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=260&auto=format&fit=crop&q=80" 
              alt="Toolkit" 
              style={{ width: 140, height: 110, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} 
            />
          </div>
        </div>
      </div>

      {/* Bottom Section: My Events Table */}
      <div className="card" style={{ marginTop: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.25rem' }}>My Events</h3>
          <div style={{ display: 'flex', background: 'var(--bg-page)', padding: 4, borderRadius: 'var(--radius-md)' }}>
            {(['Registered', 'Attended', 'Past'] as const).map(tab => (
              <button
                key={tab}
                className={`segment-btn ${activeTab === tab ? 'active' : ''}`}
                style={{ padding: '6px 16px' }}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <table className="my-events-table">
          <thead>
            <tr>
              <th>EVENT NAME</th>
              <th>DATE & TIME</th>
              <th>ROLE</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>PASS / TICKET</th>
            </tr>
          </thead>
          <tbody>
            {events.filter(e => e.userRegistered).length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '28px 16px', color: 'var(--text-muted)' }}>
                  You haven't registered for any events yet. Click Register on any event card above!
                </td>
              </tr>
            ) : (
              events.filter(e => e.userRegistered).map(ev => (
                <tr key={ev.id}>
                  <td>
                    <strong style={{ color: 'var(--text-main)' }}>{ev.title}</strong>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {ev.date}, {ev.time}
                  </td>
                  <td>
                    <span className="badge badge-student">{ev.userRole || 'Attendee'}</span>
                  </td>
                  <td>
                    <span style={{ 
                      color: ev.status === 'Confirmed' ? '#059669' : '#D97706',
                      fontWeight: 700,
                      fontSize: '0.813rem'
                    }}>
                      {ev.status || 'Confirmed'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="nav-icon-btn"
                      style={{ marginLeft: 'auto' }}
                      onClick={() => {
                        setActiveTicketEvent(ev);
                        setIsTicketModalOpen(true);
                      }}
                      title="View QR Entry Pass"
                    >
                      <QrCode size={18} color="var(--primary)" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Submit Event Modal */}
      {showSubmitModal && (
        <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Submit Campus Event</h3>
              <button className="modal-close-btn" onClick={() => setShowSubmitModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateEventSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Event Title *</label>
                  <input 
                    type="text" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    placeholder="e.g. AI Hackathon 2026" 
                    required 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Category</label>
                    <select value={newType} onChange={(e: any) => setNewType(e.target.value)}>
                      <option value="SEMINAR">SEMINAR</option>
                      <option value="WORKSHOP">WORKSHOP</option>
                      <option value="HACKATHON">HACKATHON</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Location</label>
                    <input 
                      value={newLocation} 
                      onChange={(e) => setNewLocation(e.target.value)} 
                      placeholder="e.g. Lab 404, Engineering Hall"
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Date *</label>
                    <input 
                      type="date"
                      value={newDate} 
                      onChange={(e) => setNewDate(e.target.value)} 
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Time</label>
                    <input 
                      value={newTime} 
                      onChange={(e) => setNewTime(e.target.value)} 
                      placeholder="e.g. 02:00 PM - 04:00 PM"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.813rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Description</label>
                  <textarea 
                    rows={3} 
                    value={newDesc} 
                    onChange={(e) => setNewDesc(e.target.value)} 
                    placeholder="Summary of speakers, activities, prerequisites, and room details..." 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowSubmitModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Publish Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
