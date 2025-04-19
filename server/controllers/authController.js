const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { JWT_SECRET } = require('dotenv').config().parsed;

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Middleware to verify JWT
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    if (!req.user) return res.status(401).json({ message: 'Invalid token' });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Middleware to check admin role
const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' });
  next();
};

const getProfile = async (req, res) => {
  try {
    res.json({ isAdmin: req.user.isAdmin });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const register = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format. Email must include '@' and a valid domain (e.g., user@example.com)." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ token, isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  getProfile,
  register,
  login,
};