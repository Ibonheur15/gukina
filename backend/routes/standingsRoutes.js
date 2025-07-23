const express = require('express');
const router = express.Router();
const standingsController = require('../controllers/standingsController');
const { protect, admin } = require('../middleware/authMiddleware');

// Get standings by league
router.get('/league/:leagueId', standingsController.getStandingsByLeague);

// Recalculate standings for a league (admin only)
router.post('/recalculate/:leagueId', protect, admin, standingsController.recalculateStandings);

module.exports = router;