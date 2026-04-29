const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    // Base price in INR
    price: {
      INR: { type: Number, required: true },
      USD: { type: Number, required: true },
      EUR: { type: Number, required: true },
      GBP: { type: Number, required: true },
      RUB: { type: Number, default: 0 },
    },
    category: {
      type: String,
      enum: ["Weight Belts", "Cutting Equipment", "Diving Gear", "Industrial"],
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    stock: {
      type: Number,
      required: true,
      default: 100,
    },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
