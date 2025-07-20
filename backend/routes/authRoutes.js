const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/admin', authController.createAdmin);

// Protected routes
router.get('/me', protect, authController.getCurrentUser);

module.exports = router;