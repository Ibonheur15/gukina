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

// Get available seasons for a league
router.get('/league/:leagueId/seasons', async (req, res) => {
  try {
    const { leagueId } = req.params;
    const LeagueStanding = require('../models/LeagueStanding');
    
    const standings = await LeagueStanding.find({ league: leagueId });
    const seasons = [...new Set(standings.map(s => s.season))].sort((a, b) => parseInt(b) - parseInt(a));
    
    res.json(seasons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new season - auto-determine next season
router.post('/league/:leagueId/create-season', 
  protect, 
  admin, 
  async (req, res) => {
    try {
      console.log('Route hit: createNewSeason');
      console.log('Params:', req.params);
      
      const { leagueId } = req.params;
      const Team = require('../models/Team');
      const LeagueStanding = require('../models/LeagueStanding');
      
      // Find the latest existing season
      const allStandings = await LeagueStanding.find({ league: leagueId }).sort({ season: -1 });
      const existingSeasons = [...new Set(allStandings.map(s => s.season))];
      
      let nextSeason;
      if (existingSeasons.length === 0) {
        nextSeason = new Date().getFullYear().toString();
      } else {
        const latestSeason = Math.max(...existingSeasons.map(s => parseInt(s)));
        nextSeason = (latestSeason + 1).toString();
      }
      
      console.log('Creating season:', nextSeason, 'Latest existing:', existingSeasons[0]);
      
      // Check if next season already exists
      const existingNextSeason = await LeagueStanding.find({ league: leagueId, season: nextSeason });
      if (existingNextSeason.length > 0) {
        return res.status(400).json({ 
          message: `Season ${nextSeason} already exists for this league.` 
        });
      }
      
      // Get teams from latest season or from Team model
      let teams = [];
      if (existingSeasons.length > 0) {
        // Get teams from latest season
        const latestSeasonStandings = await LeagueStanding.find({ 
          league: leagueId, 
          season: existingSeasons[0] 
        }).populate('team');
        teams = latestSeasonStandings.map(s => s.team);
      } else {
        // Get teams from Team model
        teams = await Team.find({ 
          $or: [
            { league: leagueId },
            { leagues: leagueId }
          ]
        });
      }
      
      console.log('Found teams:', teams.length);
      
      if (teams.length === 0) {
        return res.status(201).json({
          message: 'New season created (no teams)',
          season,
          teamsCount: 0
        });
      }
      
      // Create standings with all stats reset to zero
      const standings = teams.map((team, index) => ({
        league: leagueId,
        season: nextSeason,
        team: team._id,
        position: index + 1,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
        basePoints: 0,
        tempPoints: 0,
        form: []
      }));
      
      await LeagueStanding.insertMany(standings);
      
      res.status(201).json({
        message: 'New season created successfully',
        season: nextSeason,
        teamsCount: teams.length
      });
    } catch (error) {
      console.error('Error in createNewSeason route:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;