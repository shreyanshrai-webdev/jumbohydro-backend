const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    image: String,
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },  // price at time of order
    currency: { type: String, default: 'INR' }
  }],
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    street: { type: String, required: true },
    landmark: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pin: { type: String, required: true },
    country: { type: String, required: true, default: 'India' }
  },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  orderStatus: {
    type: String,
    enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'placed'
  },
  trackingInfo: {
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date
  }
}, { timestamps: true });

// Auto-generate orderId before save
orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.orderId = `ORD${dateStr}${rand}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
