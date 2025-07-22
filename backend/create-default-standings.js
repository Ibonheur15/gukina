require('dotenv').config();
const mongoose = require('mongoose');
const League = require('./models/League');
const Team = require('./models/Team');
const LeagueStanding = require('./models/LeagueStanding');

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

// Create default standings for all teams
const createDefaultStandings = async () => {
  try {
    console.log('=== CREATING DEFAULT STANDINGS ===\n');
    
    // Get all leagues
    const leagues = await League.find();
    console.log(`Found ${leagues.length} leagues`);
    
    if (leagues.length === 0) {
      console.log('No leagues found. Please run seed-leagues.js first.');
      process.exit(1);
    }
    
    // Current season
    const currentSeason = new Date().getFullYear().toString();
    
    // Process each league
    for (const league of leagues) {
      console.log(`\nProcessing league: ${league.name}`);
      
      // Get teams in this league
      const teams = await Team.find({ league: league._id });
      console.log(`Found ${teams.length} teams in this league`);
      
      if (teams.length === 0) {
        console.log('No teams found for this league. Skipping...');
        continue;
      }
      
      // Delete existing standings for this league and season
      await LeagueStanding.deleteMany({ league: league._id, season: currentSeason });
      console.log('Deleted existing standings');
      
      // Create standings for all teams with default values
      const standings = [];
      
      for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        
        standings.push({
          league: league._id,
          team: team._id,
          season: currentSeason,
          position: i + 1,
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
      }
      
      // Save all standings
      await LeagueStanding.insertMany(standings);
      console.log(`Created ${standings.length} default standings`);
    }
    
    console.log('\n=== DEFAULT STANDINGS CREATION COMPLETED ===');
    process.exit(0);
  } catch (error) {
    console.error('Error creating default standings:', error);
    process.exit(1);
  }
};

// Run the script
createDefaultStandings();