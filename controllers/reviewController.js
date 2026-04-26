const Review = require('../models/Review');
const Product = require('../models/Product');

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;

    const existing = await Review.findOne({ user: req.user._id, product: productId });
    if (existing) return res.status(400).json({ message: 'You already reviewed this product' });

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment
    });

    // Update product average rating
    const reviews = await Review.find({ product: productId });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(avg * 10) / 10,
      'ratings.count': reviews.length
    });

    await review.populate('user', 'name');
    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
