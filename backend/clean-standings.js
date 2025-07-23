require('dotenv').config();
const mongoose = require('mongoose');
const LeagueStanding = require('./models/LeagueStanding');
const Team = require('./models/Team');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gukina', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.log('MongoDB connection error:', err);
    process.exit(1);
  });

// Clean up standings
const cleanStandings = async () => {
  try {
    console.log('=== CLEANING STANDINGS DATABASE ===\n');
    
    // 1. Find all standings
    const allStandings = await LeagueStanding.find();
    console.log(`Found ${allStandings.length} total standings`);
    
    // 2. Delete standings with invalid team references
    const invalidStandings = [];
    
    for (const standing of allStandings) {
      const team = await Team.findById(standing.team);
      if (!team) {
        invalidStandings.push(standing);
      }
    }
    
    console.log(`Found ${invalidStandings.length} invalid standings with missing teams`);
    
    // Delete invalid standings
    for (const standing of invalidStandings) {
      await LeagueStanding.findByIdAndDelete(standing._id);
      console.log(`Deleted standing for missing team in league ${standing.league}, season ${standing.season}`);
    }
    
    // 3. Find all teams and make sure they're in standings
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
        console.log(`Team ${team.name} has no leagues assigned, skipping`);
        continue;
      }
      
      // For each league, check if team is in standings
      for (const leagueId of leagueIds) {
        // Get all seasons for this league
        const seasons = await LeagueStanding.distinct('season', { league: leagueId });
        
        if (seasons.length === 0) {
          // If no seasons found, use current year
          const currentYear = new Date().getFullYear().toString();
          seasons.push(currentYear);
        }
        
        // For each season, check if team is in standings
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
            console.log(`Added team ${team.name} to standings for league ${leagueId}, season ${season}`);
          }
        }
      }
    }
    
    console.log(`\nAdded ${addedCount} new standings for existing teams`);
    
    // 4. Recalculate positions for all leagues and seasons
    const leagueSeasons = await LeagueStanding.aggregate([
      { $group: { _id: { league: "$league", season: "$season" } } }
    ]);
    
    console.log(`\nRecalculating positions for ${leagueSeasons.length} league-seasons`);
    
    for (const { _id: { league, season } } of leagueSeasons) {
      // Get all standings for this league and season
      const standings = await LeagueStanding.find({ 
        league, 
        season 
      }).sort({ 
        points: -1, 
        goalsFor: -1,
        won: -1
      });
      
      // Update positions
      for (let i = 0; i < standings.length; i++) {
        standings[i].position = i + 1;
        await standings[i].save();
      }
      
      console.log(`Updated positions for league ${league}, season ${season}`);
    }
    
    console.log('\n=== STANDINGS CLEANUP COMPLETED ===');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning standings:', error);
    process.exit(1);
  }
};

// Run the cleanup
cleanStandings();