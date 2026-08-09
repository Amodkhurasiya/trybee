const Product = require('../models/Product');

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate('reviews.user', 'firstName lastName');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.json({ success: true, data: product.reviews });
  } catch (err) {
    console.error('Get product reviews error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};

// Add or update a review by the current user
exports.upsertReview = async (req, res) => {
  try {
    const { rating, comment } = req.body || {};
    if (!rating) return res.status(400).json({ success: false, message: 'Rating is required' });

    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const userId = req.user._id.toString();
    const existing = product.reviews.find(r => r.user.toString() === userId);
    if (existing) {
      existing.rating = rating;
      existing.comment = comment || existing.comment;
      existing.createdAt = new Date();
    } else {
      product.reviews.unshift({ user: req.user._id, rating, comment: comment || '' });
      product.totalReviews = (product.totalReviews || 0) + 1;
    }

    // Recompute average rating
    const avg = product.reviews.length
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;
    product.averageRating = Math.round(avg * 10) / 10;

    await product.save();

    const populated = await Product.findById(product._id)
      .populate('reviews.user', 'firstName lastName');
    return res.status(201).json({ success: true, message: 'Review saved', data: populated.reviews });
  } catch (err) {
    console.error('Upsert review error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to save review' });
  }
};

// Delete current user's review
exports.deleteOwnReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const before = product.reviews.length;
    product.reviews = product.reviews.filter(r => r.user.toString() !== req.user._id.toString());
    if (product.reviews.length === before) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    product.totalReviews = Math.max((product.totalReviews || 1) - 1, 0);
    const avg = product.reviews.length
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;
    product.averageRating = Math.round(avg * 10) / 10;
    await product.save();

    return res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    console.error('Delete review error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
};
