const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Returns the correct cart owner filter — user ID if logged in, guestId if guest
const getOwner = (req) => {
  if (req.user) return { user: req.user._id };
  return { guestId: req.guestId };
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne(getOwner(req)).populate("items.product");
    if (!cart) return res.json({ items: [] });
    res.json({ items: cart.items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const owner = getOwner(req);
    let cart = await Cart.findOne(owner);
    if (!cart) cart = new Cart({ ...owner, items: [] });

    const existing = cart.items.find((i) => i.product.toString() === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    await cart.populate("items.product");
    res.json({ items: cart.items, message: "Added to cart" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne(getOwner(req));
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.product.toString() === req.params.productId,
    );
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (i) => i.product.toString() !== req.params.productId,
      );
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    await cart.populate("items.product");
    res.json({ items: cart.items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne(getOwner(req));
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = cart.items.filter(
      (i) => i.product.toString() !== req.params.productId,
    );
    await cart.save();
    await cart.populate("items.product");
    res.json({ items: cart.items, message: "Item removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(getOwner(req), { items: [] });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
