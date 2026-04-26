const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalProducts, totalReviews, recentOrders] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Review.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email')
    ]);

    const revenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: '$currency', total: { $sum: '$totalAmount' } } }
    ]);

    res.json({ totalUsers, totalOrders, totalProducts, totalReviews, recentOrders, revenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user, message: 'User role updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
