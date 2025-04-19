const express = require('express');
const router = express.Router();
const { authMiddleware, getProfile, register, login } = require('../controllers/authController');

router.get('/profile', authMiddleware, getProfile);
router.post('/register', register);
router.post('/login', login);

module.exports = router;