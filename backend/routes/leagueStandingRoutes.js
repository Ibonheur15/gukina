const express = require('express');
const router = express.Router();
const leagueStandingController = require('../controllers/leagueStandingController');
const { protect, restrictTo } = require('../middleware/auth');

// Public routes
router.get('/league/:leagueId', leagueStandingController.getLeagueStandings);

// Protected routes (admin/editor only)
router.put('/league/:leagueId/team/:teamId', 
  protect, 
  restrictTo('admin', 'editor'), 
  leagueStandingController.updateTeamStanding
);

router.post('/match/:matchId', 
  protect, 
  restrictTo('admin', 'editor'), 
  leagueStandingController.updateStandingsFromMatch
);

module.exports = router;