const LeagueStanding = require('../models/LeagueStanding');
const Team = require('../models/Team');

/**
 * Add a new team to standings tables for all seasons of its leagues
 * @param {Object} team - The team object
 */
exports.addTeamToStandings = async (team) => {
  try {
    // Get all leagues this team belongs to
    const leagueIds = [];
    
    // Add primary league if it exists
    if (team.league) {
      leagueIds.push(team.league);
    }
    
    // Add leagues from leagues array if it exists
    if (team.leagues && team.leagues.length > 0) {
      team.leagues.forEach(leagueId => {
        if (!leagueIds.includes(leagueId.toString())) {
          leagueIds.push(leagueId);
        }
      });
    }
    
    if (leagueIds.length === 0) {
      return {
        success: false,
        message: 'Team has no leagues assigned'
      };
    }
    
    const results = [];
    
    // For each league, add team to standings for all seasons
    for (const leagueId of leagueIds) {
      // Get all seasons for this league from existing standings
      const seasons = await LeagueStanding.distinct('season', { league: leagueId });
      
      if (seasons.length === 0) {
        // If no seasons found, use current year
        const currentYear = new Date().getFullYear().toString();
        seasons.push(currentYear);
      }
      
      // For each season, add team to standings
      for (const season of seasons) {
        // Check if team already exists in standings for this league and season
        const existingStanding = await LeagueStanding.findOne({
          league: leagueId,
          season,
          team: team._id
        });
        
        if (!existingStanding) {
          // Get the current highest position
          const highestPosition = await LeagueStanding.find({ 
            league: leagueId, 
            season 
          }).sort({ position: -1 }).limit(1);
          
          const position = highestPosition.length > 0 ? highestPosition[0].position + 1 : 1;
          
          // Create new standing
          const newStanding = new LeagueStanding({
            league: leagueId,
            season,
            team: team._id,
            position,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0,
            form: [],
            lastUpdated: new Date()
          });
          
          await newStanding.save();
          
          results.push({
            league: leagueId,
            season,
            success: true,
            message: `Added team to standings for season ${season}`
          });
        } else {
          results.push({
            league: leagueId,
            season,
            success: false,
            message: `Team already exists in standings for season ${season}`
          });
        }
      }
    }
    
    return {
      success: true,
      message: `Added team to standings for ${results.length} league-seasons`,
      results
    };
  } catch (error) {
    console.error('Error adding team to standings:', error);
    return {
      success: false,
      error: error.message
    };
  }
};