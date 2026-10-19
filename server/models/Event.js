const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  typeBadge: { type: String, enum: ['SEMINAR', 'WORKSHOP', 'HACKATHON'], default: 'SEMINAR' },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  registeredCount: { type: Number, default: 0 },
  maxCapacity: { type: Number, default: 100 },
  isFeatured: { type: Boolean, default: false },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  countdownTarget: { type: Date }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
