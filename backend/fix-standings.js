require('dotenv').config();
const mongoose = require('mongoose');
const LeagueStanding = require('./models/LeagueStanding');
const Team = require('./models/Team');
const ensureTeamsInStandings = require('./startup/ensureTeamsInStandings');

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

// Fix standings in database
const fixStandings = async () => {
  try {
    console.log('=== FIXING STANDINGS DATABASE ===\n');
    
    // 1. Delete all standings with invalid team references
    console.log('Deleting standings with invalid team references...');
    const allStandings = await LeagueStanding.find();
    let deletedCount = 0;
    
    for (const standing of allStandings) {
      const team = await Team.findById(standing.team);
      if (!team) {
        await LeagueStanding.findByIdAndDelete(standing._id);
        deletedCount++;
        console.log(`Deleted standing for missing team ID: ${standing.team}`);
      }
    }
    
    console.log(`Deleted ${deletedCount} standings with missing teams`);
    
    // 2. Ensure all teams are in standings
    console.log('\nAdding missing teams to standings...');
    const result = await ensureTeamsInStandings();
    
    // 3. Recalculate positions for all leagues and seasons
    console.log('\nRecalculating positions for all leagues and seasons...');
    const leagueSeasons = await LeagueStanding.aggregate([
      { $group: { _id: { league: "$league", season: "$season" } } }
    ]);
    
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
    
    console.log('\n=== STANDINGS FIX COMPLETED ===');
    console.log('Please restart your server to see the changes.');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing standings:', error);
    process.exit(1);
  }
};

// Run the fix
fixStandings();