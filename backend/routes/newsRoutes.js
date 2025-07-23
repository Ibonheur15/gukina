const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', newsController.getAllNews);
router.get('/featured', newsController.getFeaturedNews);
router.get('/latest', newsController.getLatestNews);
router.get('/category/:category', newsController.getNewsByCategory);
router.get('/:id', newsController.getNewsById);

// Protected routes (admin only)
router.post('/', protect, admin, newsController.createNews);
router.put('/:id', protect, admin, newsController.updateNews);
router.delete('/:id', protect, admin, newsController.deleteNews);

module.exports = router;