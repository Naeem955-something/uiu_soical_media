const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, optionalAuth } = require('../middleware/auth');

// Format event for frontend
function formatEvent(event, userId) {
  const obj = event.toObject ? event.toObject() : event;
  const isRegistered = userId ? (obj.registeredUsers || []).some(id => id.toString() === userId.toString()) : false;
  return {
    id: obj._id.toString(),
    title: obj.title,
    typeBadge: obj.typeBadge || undefined,
    date: obj.date,
    time: obj.time,
    location: obj.location,
    description: obj.description,
    image: obj.image || undefined,
    registeredCount: obj.registeredCount || 0,
    maxCapacity: obj.maxCapacity || 100,
    isFeatured: obj.isFeatured || false,
    userRegistered: isRegistered,
    userRole: isRegistered ? 'Attendee' : undefined,
    status: isRegistered ? 'Confirmed' : undefined,
    countdownTarget: obj.countdownTarget || undefined
  };
}

// GET /api/events
router.get('/', optionalAuth, async (req, res) => {
  try {
    let events = await Event.find().sort({ createdAt: -1 });
    if (events.length === 0) {
      events = await Event.create([
        {
          title: 'Campus Hackathon 2025: AI Agents & Systems',
          typeBadge: 'HACKATHON',
          date: 'Nov 20, 2025',
          time: '09:00 AM - 08:00 PM',
          location: 'University Auditorium & Lab Complex',
          description: '36-hour sprint creating cutting-edge AI systems and tools. Mentors from top tech firms on-site. Free food and swag bags for all attendees.',
          image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
          registeredCount: 42,
          maxCapacity: 100,
          isFeatured: true
        },
        {
          title: 'Faculty Workshop: Neural Network Interpretability',
          typeBadge: 'WORKSHOP',
          date: 'Nov 24, 2025',
          time: '03:00 PM - 05:00 PM',
          location: 'Innovation Lab 2',
          description: 'Hands-on tutorial exploring attention visualization, integrated gradients, and mechanistic interpretability with PyTorch.',
          registeredCount: 28,
          maxCapacity: 50,
          isFeatured: false
        }
      ]);
    }
    const userId = req.user ? req.user._id : null;
    res.json(events.map(ev => formatEvent(ev, userId)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/events
router.post('/', protect, async (req, res) => {
  try {
    const newEvent = new Event({
      ...req.body,
      registeredUsers: [req.user._id],
      registeredCount: 1
    });
    const savedEvent = await newEvent.save();
    res.status(201).json(formatEvent(savedEvent, req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/events/:id/register
router.put('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    const index = event.registeredUsers.findIndex(id => id.toString() === req.user._id.toString());
    if (index === -1) {
      if (event.registeredCount >= event.maxCapacity) {
        return res.status(400).json({ message: 'Event is full' });
      }
      event.registeredUsers.push(req.user._id);
      event.registeredCount += 1;
    } else {
      event.registeredUsers.splice(index, 1);
      event.registeredCount = Math.max(0, event.registeredCount - 1);
    }
    await event.save();
    res.json(formatEvent(event, req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
