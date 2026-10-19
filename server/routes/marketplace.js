const express = require('express');
const router = express.Router();
const MarketplaceItem = require('../models/MarketplaceItem');
const { protect, optionalAuth } = require('../middleware/auth');

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatItem(item, userId) {
  const obj = item.toObject ? item.toObject() : item;
  return {
    id: obj._id.toString(),
    title: obj.title,
    price: obj.price,
    location: obj.location,
    condition: obj.condition,
    category: obj.category,
    sellerName: obj.sellerName,
    sellerAvatar: obj.sellerAvatar,
    image: obj.image,
    isBookmarked: userId ? (obj.bookmarkedBy || []).some(id => id.toString() === userId.toString()) : false,
    description: obj.description || undefined,
    postedDate: formatDate(obj.createdAt)
  };
}

// GET /api/marketplace
router.get('/', optionalAuth, async (req, res) => {
  try {
    let items = await MarketplaceItem.find().sort({ createdAt: -1 });
    if (items.length === 0) {
      items = await MarketplaceItem.create([
        {
          title: 'Calculus: Early Transcendentals (8th Edition)',
          price: 35,
          location: 'Science Library',
          condition: 'LIKE NEW',
          category: 'Books',
          sellerName: 'Student User',
          sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
          image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
          description: 'Hardcover, minimal highlighting in chapters 1-3. Clean pages throughout.'
        },
        {
          title: 'Texas Instruments TI-84 Plus CE Graphing Calculator',
          price: 65,
          location: 'Engineering Hall',
          condition: 'USED - GOOD',
          category: 'Electronics',
          sellerName: 'Alex Rivera',
          sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
          image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600',
          description: 'Includes original charging cable and slide cover. Battery health is great.'
        },
        {
          title: 'Ergonomic Desk Study Lamp with USB Port',
          price: 18,
          location: 'North Campus Dorms',
          condition: 'LIKE NEW',
          category: 'Hostel Items',
          sellerName: 'Fahima Tonni',
          sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
          image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',
          description: 'Dimmable warm/cool white modes. Perfect for dorm study tables.'
        }
      ]);
    }
    const userId = req.user ? req.user._id : null;
    res.json(items.map(i => formatItem(i, userId)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/marketplace
router.post('/', protect, async (req, res) => {
  try {
    const newItem = new MarketplaceItem({
      ...req.body,
      seller: req.user._id,
      sellerName: req.user.name,
      sellerAvatar: req.user.avatar
    });
    const savedItem = await newItem.save();
    res.status(201).json(formatItem(savedItem, req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/marketplace/:id/bookmark
router.put('/:id/bookmark', protect, async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    const index = item.bookmarkedBy.findIndex(id => id.toString() === req.user._id.toString());
    if (index === -1) {
      item.bookmarkedBy.push(req.user._id);
    } else {
      item.bookmarkedBy.splice(index, 1);
    }
    await item.save();
    res.json(formatItem(item, req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
