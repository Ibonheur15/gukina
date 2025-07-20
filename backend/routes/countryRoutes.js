const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');
const { protect, restrictTo } = require('../middleware/auth');

// Public routes
router.get('/', countryController.getAllCountries);
router.get('/:id', countryController.getCountryById);

// Protected routes (admin only)
router.post('/', protect, restrictTo('admin', 'editor'), countryController.createCountry);
router.put('/:id', protect, restrictTo('admin', 'editor'), countryController.updateCountry);
router.delete('/:id', protect, restrictTo('admin'), countryController.deleteCountry);

module.exports = router;