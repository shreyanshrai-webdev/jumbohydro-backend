const Order = require("../models/Order");
const crypto = require("crypto");

// Cashfree API base URLs
const CASHFREE_BASE_URL =
  process.env.CASHFREE_ENV === "PROD"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

// Currency symbols for Cashfree
const CURRENCY_CODES = { INR: "INR", USD: "USD", EUR: "EUR", GBP: "GBP" };

exports.createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate(
      "user",
      "name email phone",
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    const cashfreeOrder = {
      order_id: order.orderId,
      order_amount: order.totalAmount,
      order_currency: CURRENCY_CODES[order.currency] || "INR",
      customer_details: {
        customer_id: order.user._id.toString(),
        customer_name: order.user.name,
        customer_email: order.user.email,
        customer_phone: order.shippingAddress.phone || "9999999999",
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/order-tracking/${order.orderId}?payment=success`,
        notify_url: `${process.env.BACKEND_URL}/api/payment/webhook`,
      },
    };

    const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
      },
      body: JSON.stringify(cashfreeOrder),
    });

    const data = await response.json();
    if (!response.ok)
      return res
        .status(400)
        .json({ message: data.message || "Payment creation failed" });

    res.json({
      paymentSessionId: data.payment_session_id,
      orderId: order.orderId,
      cashfreeOrderId: data.order_id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const response = await fetch(
      `${CASHFREE_BASE_URL}/orders/${orderId}/payments`,
      {
        method: "GET",
        headers: {
          "x-api-version": "2023-08-01",
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        },
      },
    );

    const data = await response.json();
    const payment = Array.isArray(data) ? data[0] : null;

    if (payment && payment.payment_status === "SUCCESS") {
      await Order.findOneAndUpdate(
        { orderId },
        {
          paymentStatus: "paid",
          paymentId: payment.cf_payment_id,
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
