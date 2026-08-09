const User = require('../models/User');
const Product = require('../models/Product');

// Get current user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name price images category');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    console.error('Get wishlist error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to get wishlist' });
  }
};

// Add a product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body || {};
    if (!productId) return res.status(400).json({ success: false, message: 'productId is required' });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const exists = user.wishlist.some(id => id.toString() === productId);
    if (!exists) user.wishlist.push(productId);
    await user.save();

    const populated = await User.findById(user._id).populate('wishlist', 'name price images category');
    return res.json({ success: true, message: 'Added to wishlist', wishlist: populated.wishlist });
  } catch (err) {
    console.error('Add to wishlist error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to add to wishlist' });
  }
};

// Remove a product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) return res.status(400).json({ success: false, message: 'productId is required' });
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    const populated = await User.findById(user._id).populate('wishlist', 'name price images category');
    return res.json({ success: true, message: 'Removed from wishlist', wishlist: populated.wishlist });
  } catch (err) {
    console.error('Remove from wishlist error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
  }
};
