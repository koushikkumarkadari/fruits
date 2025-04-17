const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://koushikkumarkadari:Chinnu200542@cluster0.7k2q4.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pricePerUnit: { type: Number, required: true, min: 0 },
});

const OrderSchema = new mongoose.Schema({
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  buyerName: { type: String, required: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, default: "Pending" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const User = mongoose.model("User", UserSchema);
const Product = mongoose.model("Product", ProductSchema);
const Order = mongoose.model("Order", OrderSchema);

const JWT_SECRET = "your_jwt_secret_key"; // Replace with a secure key in production
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Middleware to verify JWT
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    if (!req.user) return res.status(401).json({ message: "Invalid token" });
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Middleware to check admin role
const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: "Admin access required" });
  next();
};

// User Profile
app.get("/profile", authMiddleware, async (req, res) => {
  try {
    res.json({ isAdmin: req.user.isAdmin });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// User Registration
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Validate email format
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format. Email must include '@' and a valid domain (e.g., user@example.com)." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// User Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Product Routes
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/products", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.sendStatus(201);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put("/products/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, req.body);
    res.sendStatus(200);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/products/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Order Routes
app.post("/orders", authMiddleware, async (req, res) => {
  try {
    const { items, buyerName, contact, address } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one product is required" });
    }
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ message: "Invalid product or quantity" });
      }
    }
    const order = new Order({
      items: items.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      })),
      buyerName,
      contact,
      address,
      user: req.user._id,
    });
    await order.save();
    await User.findByIdAndUpdate(req.user._id, { $push: { orders: order._id } });
    res.status(201).json({ orderId: order._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/orders/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product user");
    if (!order || order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/user/orders", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "orders",
      populate: { path: "items.product" },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.orders || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/admin/orders", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().populate({
      path: "items.product",
      select: "name pricePerUnit",
    }).populate({
      path: "user",
      select: "email",
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

app.put("/admin/orders/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.sendStatus(200);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.patch("/admin/orders/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate the status
    const validStatuses = ["Pending", "In transit", "Out for delivery", "Delivered", "Returned", "Failed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Update the order status
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated successfully", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

app.get('/admin/analytics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const failedOrders = await Order.countDocuments({ status: 'Failed' });

    res.json({
      totalOrders,
      deliveredOrders,
      pendingOrders,
      failedOrders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
});

app.listen(5000, () => console.log("Server started on port 5000"));