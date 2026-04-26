const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, currency = 'INR' } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Build order items
    const items = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.image,
      quantity: item.quantity,
      price: item.product.price[currency],
      currency
    }));

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      totalAmount,
      currency
    });

    // Clear cart after order
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json({ order, message: 'Order placed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderId: req.params.id }],
      user: req.user._id
    }).populate('items.product', 'name image');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin - get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin - update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, trackingInfo } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus, ...(trackingInfo && { trackingInfo }) },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order, message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
