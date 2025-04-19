const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../controllers/authController');
const { getAnalytics } = require('../controllers/analyticsController');

router.get('/admin/analytics', authMiddleware, adminMiddleware, getAnalytics);

module.exports = router;