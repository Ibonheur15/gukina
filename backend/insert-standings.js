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

// Insert standings directly
const insertStandings = async () => {
  try {
    console.log('=== INSERTING STANDINGS DIRECTLY ===\n');
    
    // Get all leagues
    const leagues = await League.find();
    console.log(`Found ${leagues.length} leagues`);
    
    if (leagues.length === 0) {
      console.log('No leagues found. Please run seed-leagues.js first.');
      process.exit(1);
    }
    
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
      
      // Current season
      const currentSeason = new Date().getFullYear().toString();
      
      // Delete existing standings
      await LeagueStanding.deleteMany({ league: league._id });
      console.log('Deleted existing standings');
      
      // Create sample standings with some data
      const standings = [];
      
      for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        
        // Generate some realistic data
        const played = 10;
        const won = Math.floor(Math.random() * (played + 1));
        const drawn = Math.floor(Math.random() * (played - won + 1));
        const lost = played - won - drawn;
        const goalsFor = won * 2 + drawn;
        const goalsAgainst = lost * 2 + drawn;
        const points = won * 3 + drawn;
        
        // Generate form
        const form = [];
        for (let j = 0; j < Math.min(5, played); j++) {
          const rand = Math.random();
          if (rand < 0.5) form.push('W');
          else if (rand < 0.8) form.push('D');
          else form.push('L');
        }
        
        standings.push({
          league: league._id,
          team: team._id,
          season: currentSeason,
          position: i + 1,
          played,
          won,
          drawn,
          lost,
          goalsFor,
          goalsAgainst,
          points,
          form,
          lastUpdated: new Date()
        });
      }
      
      // Sort by points
      standings.sort((a, b) => b.points - a.points);
      
      // Update positions
      for (let i = 0; i < standings.length; i++) {
        standings[i].position = i + 1;
      }
      
      // Insert into database
      await LeagueStanding.insertMany(standings);
      console.log(`Created ${standings.length} standings`);
    }
    
    console.log('\n=== STANDINGS INSERTION COMPLETED ===');
    process.exit(0);
  } catch (error) {
    console.error('Error inserting standings:', error);
    process.exit(1);
  }
};

// Run the script
insertStandings();