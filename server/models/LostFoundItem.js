const mongoose = require('mongoose');

const lostFoundItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  statusType: { type: String, enum: ['Lost', 'Found'], required: true },
  category: { type: String, default: 'Other' },
  location: { type: String, default: '' },
  image: { type: String, default: '' },
  details: { type: String, default: '' },
  finderName: { type: String, default: '' },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const LostFoundItem = mongoose.model('LostFoundItem', lostFoundItemSchema);
module.exports = LostFoundItem;
