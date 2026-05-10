const crypto = require("crypto");

exports.createPayment = async (order) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // Razorpay amount is in paise (multiply by 100)
  const amountInPaise = Math.round(order.totalAmount * 100);

  // Create Razorpay order via their REST API
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: order.currency || "INR",
      receipt: order.orderId,
    }),
  });

  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data.error?.description || "Razorpay order creation failed",
    );

  return {
    gateway: "razorpay",
    type: "popup", // frontend opens Razorpay JS SDK popup
    razorpayOrderId: data.id,
    amount: amountInPaise,
    currency: order.currency || "INR",
    keyId,
    orderId: order.orderId,
    customerName: order.user.name,
    customerEmail: order.user.email,
    customerPhone: order.shippingAddress.phone || "9999999999",
  };
};

exports.verifyPayment = async (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // Razorpay signature verification
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpaySignature) {
    return { success: true, paymentId: razorpayPaymentId };
  }
  return { success: false };
};
