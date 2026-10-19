const express = require('express');
const router = express.Router();
const LostFoundItem = require('../models/LostFoundItem');
const { protect } = require('../middleware/auth');

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatItem(item) {
  const obj = item.toObject ? item.toObject() : item;
  return {
    id: obj._id.toString(),
    title: obj.title,
    statusType: obj.statusType,
    category: obj.category,
    location: obj.location,
    reportedDate: formatDate(obj.createdAt),
    image: obj.image,
    isBookmarked: false,
    details: obj.details || undefined,
    finderName: obj.finderName || undefined
  };
}

// GET /api/lostfound
router.get('/', async (req, res) => {
  try {
    let items = await LostFoundItem.find().sort({ createdAt: -1 });
    if (items.length === 0) {
      items = await LostFoundItem.create([
        {
          title: 'Brown Leather Bi-Fold Wallet',
          statusType: 'Found',
          category: 'Wallet',
          location: 'Central Cafeteria 2nd Floor',
          details: 'Found on table near window. Contains a student ID card and library access badge. Please claim with security desk.',
          image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500',
          finderName: 'Campus Security Office'
        },
        {
          title: 'Sony WH-1000XM4 Noise Cancelling Headphones',
          statusType: 'Lost',
          category: 'Electronics',
          location: 'Library Quiet Zone (3rd Floor)',
          details: 'Left in black carrying case on study carrel #42 yesterday evening around 7:00 PM.',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
        }
      ]);
    }
    res.json(items.map(i => formatItem(i)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/lostfound
router.post('/', protect, async (req, res) => {
  try {
    const newItem = new LostFoundItem({
      ...req.body,
      reporter: req.user._id,
      finderName: req.body.statusType === 'Found' ? req.user.name : ''
    });
    const savedItem = await newItem.save();
    res.status(201).json(formatItem(savedItem));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
