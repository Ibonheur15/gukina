require('dotenv').config();
const mongoose = require('mongoose');
const League = require('./models/League');
const Match = require('./models/Match');
const standingsService = require('./services/standingsService');

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

// Recalculate standings for all leagues
const recalculateAllStandings = async () => {
  try {
    console.log('=== RECALCULATING ALL STANDINGS ===\n');
    
    // Get all leagues
    const leagues = await League.find();
    console.log(`Found ${leagues.length} leagues`);
    
    if (leagues.length === 0) {
      console.log('No leagues found. Exiting...');
      process.exit(0);
    }
    
    // Get all seasons from matches
    const seasons = await Match.distinct('season');
    console.log(`Found ${seasons.length} seasons: ${seasons.join(', ')}`);
    
    if (seasons.length === 0) {
      console.log('No seasons found. Exiting...');
      process.exit(0);
    }
    
    let totalStandingsCreated = 0;
    
    // Process each league and season
    for (const league of leagues) {
      console.log(`\nProcessing league: ${league.name}`);
      
      for (const season of seasons) {
        console.log(`  Season: ${season}`);
        
        // Recalculate standings for this league and season
        const result = await standingsService.recalculateStandings(league._id, season);
        
        if (result.success) {
          console.log(`  ✅ Created ${result.standings.length} standings from ${result.matchesProcessed} matches`);
          totalStandingsCreated += result.standings.length;
        } else {
          console.log(`  ❌ Failed: ${result.message || result.error}`);
        }
      }
    }
    
    console.log(`\nTotal standings created: ${totalStandingsCreated}`);
    console.log('\n=== RECALCULATION COMPLETED ===');
    process.exit(0);
  } catch (error) {
    console.error('Error recalculating standings:', error);
    process.exit(1);
  }
};

// Run the recalculation
recalculateAllStandings();