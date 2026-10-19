const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, default: '' },
  condition: { type: String, default: 'USED - GOOD' },
  category: { type: String, default: 'Other' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sellerName: { type: String, default: '' },
  sellerAvatar: { type: String, default: '' },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const MarketplaceItem = mongoose.model('MarketplaceItem', marketplaceItemSchema);
module.exports = MarketplaceItem;
