const Match = require('../models/Match');

// Get all available seasons for a league
exports.getLeagueSeasons = async (req, res) => {
  try {
    const leagueId = req.params.leagueId;
    
    // Check if ID is valid MongoDB ObjectId
    if (!leagueId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid league ID format' });
    }
    
    // Get all available seasons for this league from matches
    const availableSeasons = await Match.distinct('season', { league: leagueId });
    
    // Sort seasons in descending order (newest first)
    availableSeasons.sort((a, b) => parseInt(b) - parseInt(a));
    
    // If no seasons found, add current year
    if (availableSeasons.length === 0) {
      const currentYear = new Date().getFullYear().toString();
      availableSeasons.push(currentYear);
    }
    
    res.status(200).json(availableSeasons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};