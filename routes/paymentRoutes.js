const express = require('express');
const router = express.Router();
const { createPayment, verifyPayment, webhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createPayment);
router.post('/verify', protect, verifyPayment);
router.post('/webhook', webhook);

module.exports = router;
