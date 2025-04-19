const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');

// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send order confirmation email
const sendOrderConfirmationEmail = async (order, user) => {
  try {
    const itemsList = order.items.map(item => `
      <li>${item.product.name} (${item.quantity} kg)</li>
    `).join('');

    const mailOptions = {
      from: `"Bulk Ordering Platform" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Confirmation - Order #${order._id}`,
      html: `
        <h2>Order Confirmation</h2>
        <p>Dear ${order.buyerName},</p>
        <p>Thank you for your order! Below are the details:</p>
        <ul>
          <li><strong>Order ID:</strong> ${order._id}</li>
          <li><strong>Items:</strong>
            <ul>${itemsList}</ul>
          </li>
          <li><strong>Buyer Name:</strong> ${order.buyerName}</li>
          <li><strong>Contact:</strong> ${order.contact}</li>
          <li><strong>Address:</strong> ${order.address}</li>
          <li><strong>Status:</strong> ${order.status}</li>
        </ul>
        <p>We’ll notify you when your order status changes.</p>
        <p>Best regards,<br/>Bulk Ordering Platform Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${user.email} for order ${order._id}`);
  } catch (err) {
    console.error(`Failed to send email for order ${order._id}:`, err);
    // Do not throw error to avoid blocking order creation
  }
};

const createOrder = async (req, res) => {
  try {
    const { items, buyerName, contact, address } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one product is required' });
    }
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ message: 'Invalid product or quantity' });
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

    // Populate order for email
    const populatedOrder = await Order.findById(order._id).populate('items.product');
    const user = await User.findById(req.user._id);
    
    // Send email notification
    await sendOrderConfirmationEmail(populatedOrder, user);

    res.status(201).json({ orderId: order._id });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product user');
    if (!order || order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'orders',
      populate: { path: 'items.product' },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.orders || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate({
      path: 'items.product',
      select: 'name pricePerUnit',
    }).populate({
      path: 'user',
      select: 'email',
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'In transit', 'Out for delivery', 'Delivered', 'Returned', 'Failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

const deleteOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // Find order and populate user for email
    const order = await Order.findById(id).populate('user');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if order is pending
    if (order.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending orders can be canceled' });
    }

    // Delete order and update user's orders array
    await Order.findByIdAndDelete(id);
    await User.findByIdAndUpdate(order.user._id, { $pull: { orders: id } });

    // Send cancellation email
    await sendOrderCancellationEmail(order, order.user);

    res.status(200).json({ message: 'Order canceled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to cancel order' });
  }
};
module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrderById,
};