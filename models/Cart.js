const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    // For logged-in users (admin)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // For guest users (no login)
    guestId: {
      type: String,
      default: null,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
  },
  { timestamps: true },
);

// Ensure each user/guest has only one cart
cartSchema.index({ user: 1 }, { unique: true, sparse: true });
cartSchema.index({ guestId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Cart", cartSchema);
