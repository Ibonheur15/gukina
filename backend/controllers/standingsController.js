const LeagueStanding = require('../models/LeagueStanding');
const standingsService = require('../services/standingsService');

// Get standings by league and season
exports.getStandingsByLeague = async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { season } = req.query;
    
    const query = { league: leagueId };
    if (season) {
      query.season = season;
    }
    
    const standings = await LeagueStanding.find(query)
      .populate('team', 'name shortName logo')
      .sort({ position: 1 });
    
    res.status(200).json(standings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Recalculate standings for a league and season
exports.recalculateStandings = async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { season } = req.body;
    
    if (!season) {
      return res.status(400).json({ message: 'Season is required' });
    }
    
    const result = await standingsService.recalculateStandings(leagueId, season);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message || 'Failed to recalculate standings' });
    }
    
    res.status(200).json({
      message: 'Standings recalculated successfully',
      matchesProcessed: result.matchesProcessed,
      standingsCount: result.standings.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};