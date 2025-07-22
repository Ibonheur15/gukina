const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Match = require('../models/Match');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function fixMatchSeasons() {
  try {
    console.log('Checking for matches without season field...');
    
    // Find matches without season field
    const matchesWithoutSeason = await Match.find({ season: { $exists: false } });
    console.log(`Found ${matchesWithoutSeason.length} matches without season field`);
    
    if (matchesWithoutSeason.length === 0) {
      console.log('All matches have season field. No fixes needed.');
      return;
    }
    
    // Fix matches by adding season based on match date
    let fixedCount = 0;
    for (const match of matchesWithoutSeason) {
      const matchDate = new Date(match.matchDate);
      const season = matchDate.getFullYear().toString();
      
      try {
        match.season = season;
        await match.save();
        fixedCount++;
        console.log(`Fixed match ${match._id}: Added season ${season}`);
      } catch (err) {
        console.error(`Error fixing match ${match._id}:`, err.message);
      }
    }
    
    console.log(`Successfully fixed ${fixedCount} matches`);
    
    // Check if any matches still don't have season
    const remainingMatches = await Match.find({ season: { $exists: false } });
    if (remainingMatches.length > 0) {
      console.log(`Warning: ${remainingMatches.length} matches still don't have season field`);
    } else {
      console.log('All matches now have season field');
    }
    
    // Show season distribution
    const seasons = await Match.aggregate([
      { $group: { _id: "$season", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\nMatch distribution by season:');
    seasons.forEach(s => {
      console.log(`Season ${s._id}: ${s.count} matches`);
    });
    
  } catch (error) {
    console.error('Error fixing match seasons:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
fixMatchSeasons();