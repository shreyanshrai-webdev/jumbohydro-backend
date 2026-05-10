const crypto = require("crypto");

const PAYU_URL =
  process.env.PAYU_ENV === "PROD"
    ? "https://secure.payu.in/_payment"
    : "https://test.payu.in/_payment";

exports.createPayment = async (order) => {
  const key = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_MERCHANT_SALT;
  const txnid = order.orderId;
  const amount = order.totalAmount.toFixed(2);
  const productinfo = "JumboHydro Order";
  const firstname = order.user.name;
  const email = order.user.email;
  const phone = order.shippingAddress.phone || "9999999999";

  // PayU required hash format:
  // sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");

  return {
    gateway: "payu",
    type: "redirect", // frontend does a form POST to PayU URL
    payuUrl: PAYU_URL,
    params: {
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      hash,
      surl: `${process.env.FRONTEND_URL}/payment-success`, // PayU redirects here on success
      furl: `${process.env.FRONTEND_URL}/payment-failure`, // PayU redirects here on failure
    },
  };
};

exports.verifyPayment = async (orderId) => {
  // PayU verification is done via webhook (surl/furl) — not a separate API call
  // This is a placeholder if you want to add PayU's Verify Payment API later
  return { success: false, message: "Use webhook/surl for PayU verification" };
};
