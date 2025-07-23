const Team = require('../models/Team');
const LeagueStanding = require('../models/LeagueStanding');
const Match = require('../models/Match');

/**
 * Ensure all teams are in standings tables
 */
module.exports = async function ensureTeamsInStandings() {
  try {
    console.log('Ensuring all teams are in standings tables...');
    
    // Get all teams
    const teams = await Team.find();
    console.log(`Found ${teams.length} teams`);
    
    let addedCount = 0;
    
    for (const team of teams) {
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
        continue;
      }
      
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
            addedCount++;
          }
        }
      }
    }
    
    // Delete standings with invalid team references
    const allStandings = await LeagueStanding.find();
    let deletedCount = 0;
    
    for (const standing of allStandings) {
      const team = await Team.findById(standing.team);
      if (!team) {
        await LeagueStanding.findByIdAndDelete(standing._id);
        deletedCount++;
      }
    }
    
    console.log(`Added ${addedCount} new standings for existing teams`);
    console.log(`Deleted ${deletedCount} standings with missing teams`);
    
    return {
      added: addedCount,
      deleted: deletedCount
    };
  } catch (error) {
    console.error('Error ensuring teams in standings:', error);
    return {
      error: error.message
    };
  }
};