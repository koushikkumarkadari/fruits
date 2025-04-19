const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../controllers/authController');
const {deleteOrderById, createOrder, getOrderById, getUserOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');

router.post('/orders', authMiddleware, createOrder);
router.get('/orders/:id', authMiddleware, getOrderById);
router.get('/user/orders', authMiddleware, getUserOrders);
router.get('/admin/orders', authMiddleware, adminMiddleware, getAllOrders);
router.put('/admin/orders/:id', authMiddleware, adminMiddleware, updateOrderStatus);
router.patch('/admin/orders/:id', authMiddleware, adminMiddleware, updateOrderStatus);
router.delete('/user/orders/:id', authMiddleware,deleteOrderById);

module.exports = router;