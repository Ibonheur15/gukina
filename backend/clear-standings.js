require('dotenv').config();
const mongoose = require('mongoose');
const LeagueStanding = require('./models/LeagueStanding');
const League = require('./models/League');
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

// Clear all standings and create new ones with 0 points
const clearStandings = async () => {
  try {
    console.log('=== CLEARING ALL STANDINGS ===\n');
    
    // Delete all existing standings
    const deleteResult = await LeagueStanding.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing standings`);
    
    // Get all leagues
    const leagues = await League.find();
    console.log(`Found ${leagues.length} leagues`);
    
    let totalStandingsCreated = 0;
    
    // For each league, create standings for all teams with 0 points
    for (const league of leagues) {
      console.log(`\nProcessing league: ${league.name}`);
      
      // Get teams for this league
      const teams = await Team.find({ league: league._id });
      console.log(`Found ${teams.length} teams in this league`);
      
      if (teams.length === 0) {
        console.log('No teams found for this league. Skipping...');
        continue;
      }
      
      // Create standings for each team
      const standings = [];
      
      teams.forEach((team, index) => {
        standings.push({
          league: league._id,
          season: league.season || '2023-2024',
          team: team._id,
          position: index + 1,
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
      });
      
      // Insert standings
      await LeagueStanding.insertMany(standings);
      console.log(`Created ${standings.length} standings for ${league.name}`);
      totalStandingsCreated += standings.length;
    }
    
    console.log(`\nTotal standings created: ${totalStandingsCreated}`);
    console.log('\n=== STANDINGS RESET COMPLETED ===');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing standings:', error);
    process.exit(1);
  }
};

// Run the script
clearStandings();