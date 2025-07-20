const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/leagueController');
const { protect, restrictTo } = require('../middleware/auth');

// Public routes
router.get('/', leagueController.getAllLeagues);
router.get('/:id', leagueController.getLeagueById);
router.get('/country/:countryId', leagueController.getLeaguesByCountry);

// Protected routes (admin/editor only)
router.post('/', protect, restrictTo('admin', 'editor'), leagueController.createLeague);
router.put('/:id', protect, restrictTo('admin', 'editor'), leagueController.updateLeague);
router.delete('/:id', protect, restrictTo('admin'), leagueController.deleteLeague);

module.exports = router;