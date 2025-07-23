const express = require('express');
const router = express.Router();
const leagueStandingController = require('../controllers/leagueStandingController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/league/:leagueId', leagueStandingController.getLeagueStandings);

// Protected routes (admin/editor only)
router.put('/league/:leagueId/team/:teamId', 
  protect, 
  admin, 
  leagueStandingController.updateTeamStanding
);

router.post('/match/:matchId', 
  protect, 
  admin, 
  leagueStandingController.updateStandingsFromMatch
);

module.exports = router;