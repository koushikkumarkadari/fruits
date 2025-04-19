const Order = require('../models/Order');

const getAnalytics = async (req, res) => {
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
};

module.exports = { getAnalytics };