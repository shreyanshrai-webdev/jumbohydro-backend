const Order = require("../models/Order");
const cashfreeService = require("../services/cashfreeService");
const payuService = require("../services/payuService");
const razorpayService = require("../services/razorpayService");

// Add new gateways here in the future — no other code needs to change
const gateways = {
  cashfree: cashfreeService,
  payu: payuService,
  razorpay: razorpayService,
};

// POST /api/payment/create
// Body: { orderId, gateway }   gateway defaults to "cashfree" if not sent
exports.createPayment = async (req, res) => {
  try {
    const { orderId, gateway = "cashfree" } = req.body;

    const service = gateways[gateway];
    if (!service) {
      return res.status(400).json({ message: `Unknown gateway: ${gateway}` });
    }

    const order = await Order.findById(orderId).populate(
      "user",
      "name email phone",
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    const result = await service.createPayment(order);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/payment/verify
// Body: { orderId, gateway, razorpayOrderId, razorpayPaymentId, razorpaySignature }
exports.verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      gateway = "cashfree",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    const service = gateways[gateway];
    if (!service) {
      return res.status(400).json({ message: `Unknown gateway: ${gateway}` });
    }

    let result;

    if (gateway === "razorpay") {
      // Razorpay needs its own 3 fields for signature verification
      result = await razorpayService.verifyPayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      );
    } else {
      result = await service.verifyPayment(orderId);
    }

    if (result.success) {
      await Order.findOneAndUpdate(
        { orderId },
        {
          paymentStatus: "paid",
          paymentId: result.paymentId,
          orderStatus: "confirmed",
        },
      );
      return res.json({
        success: true,
        message: "Payment verified successfully",
      });
    }

    res.json({ success: false, message: "Payment not successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/payment/webhook
// Cashfree calls this automatically after payment
exports.webhook = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ message: "Invalid webhook" });

    const { order, payment } = data;
    if (payment.payment_status === "SUCCESS") {
      await Order.findOneAndUpdate(
        { orderId: order.order_id },
        {
          paymentStatus: "paid",
          paymentId: payment.cf_payment_id,
          orderStatus: "confirmed",
        },
      );
    }
    res.json({ message: "Webhook received" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
