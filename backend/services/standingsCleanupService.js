const LeagueStanding = require('../models/LeagueStanding');

/**
 * Recalculate positions for all teams in a league and season after a team is deleted
 * @param {String} leagueId - The league ID
 * @param {String} season - The season
 */
exports.recalculatePositions = async (leagueId, season) => {
  try {
    // Get all standings for this league and season
    const standings = await LeagueStanding.find({ 
      league: leagueId,
      season: season
    }).sort({ points: -1, goalsFor: -1, goalsAgainst: 1 });
    
    // Update positions
    for (let i = 0; i < standings.length; i++) {
      standings[i].position = i + 1;
      await standings[i].save();
    }
    
    return {
      success: true,
      message: `Recalculated positions for ${standings.length} teams`
    };
  } catch (error) {
    console.error('Error recalculating standings positions:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Clean up standings after a team is deleted
 * @param {String} teamId - The ID of the deleted team
 */
exports.cleanupAfterTeamDeletion = async (teamId) => {
  try {
    // Find all standings for this team
    const teamStandings = await LeagueStanding.find({ team: teamId });
    
    // Group standings by league and season
    const leagueSeasonMap = {};
    
    teamStandings.forEach(standing => {
      const key = `${standing.league.toString()}-${standing.season}`;
      if (!leagueSeasonMap[key]) {
        leagueSeasonMap[key] = {
          league: standing.league,
          season: standing.season
        };
      }
    });
    
    // Delete all standings for this team
    await LeagueStanding.deleteMany({ team: teamId });
    
    // Recalculate positions for each league and season
    const results = [];
    for (const key in leagueSeasonMap) {
      const { league, season } = leagueSeasonMap[key];
      const result = await exports.recalculatePositions(league, season);
      results.push({
        league,
        season,
        ...result
      });
    }
    
    return {
      success: true,
      message: `Cleaned up standings for team ${teamId}`,
      results
    };
  } catch (error) {
    console.error('Error cleaning up standings after team deletion:', error);
    return {
      success: false,
      error: error.message
    };
  }
};