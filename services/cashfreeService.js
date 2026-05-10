const CASHFREE_BASE_URL =
  process.env.CASHFREE_ENV === "PROD"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

const CURRENCY_CODES = { INR: "INR", USD: "USD", EUR: "EUR", GBP: "GBP" };

exports.createPayment = async (order) => {
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
    throw new Error(data.message || "Cashfree payment creation failed");

  return {
    gateway: "cashfree",
    type: "session", // frontend uses Cashfree JS SDK popup
    paymentSessionId: data.payment_session_id,
    orderId: order.orderId,
    cashfreeOrderId: data.order_id,
  };
};

exports.verifyPayment = async (orderId) => {
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
    return { success: true, paymentId: payment.cf_payment_id };
  }
  return { success: false };
};
