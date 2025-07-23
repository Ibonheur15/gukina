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

// Initialize league standings
const initializeStandings = async () => {
  try {
    console.log('=== INITIALIZING LEAGUE STANDINGS ===\n');
    
    // Get all leagues
    const leagues = await League.find();
    console.log(`Found ${leagues.length} leagues`);
    
    if (leagues.length === 0) {
      console.log('No leagues found. Please run fix-matches.js first.');
      process.exit(0);
    }
    
    // Process each league
    for (const league of leagues) {
      console.log(`\nProcessing league: ${league.name} (${league.season || 'No season'})`);
      
      // Get teams for this league
      const teams = await Team.find({ league: league._id });
      console.log(`Found ${teams.length} teams in this league`);
      
      if (teams.length === 0) {
        console.log('No teams found for this league. Skipping...');
        continue;
      }
      
      // Check if standings already exist
      const existingStandings = await LeagueStanding.find({ 
        league: league._id,
        season: league.season || '2023-2024'
      });
      
      if (existingStandings.length > 0) {
        console.log(`${existingStandings.length} standings already exist for this league. Deleting...`);
        await LeagueStanding.deleteMany({ 
          league: league._id,
          season: league.season || '2023-2024'
        });
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
          form: []
        });
      });
      
      // Insert standings
      await LeagueStanding.insertMany(standings);
      console.log(`Created ${standings.length} standings for ${league.name}`);
    }
    
    console.log('\n=== STANDINGS INITIALIZATION COMPLETED ===');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing standings:', error);
    process.exit(1);
  }
};

// Run the initialization
initializeStandings();