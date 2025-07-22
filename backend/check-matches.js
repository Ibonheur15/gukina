require('dotenv').config();
const mongoose = require('mongoose');
const Match = require('./models/Match');

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

// Check matches
const checkMatches = async () => {
  try {
    // Count matches
    const count = await Match.countDocuments();
    console.log(`Total matches in database: ${count}`);

    // Get matches by day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);
    
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);
    
    const yesterdayMatches = await Match.countDocuments({
      matchDate: { $gte: yesterday, $lte: yesterdayEnd }
    });
    
    const todayMatches = await Match.countDocuments({
      matchDate: { $gte: today, $lte: todayEnd }
    });
    
    const tomorrowMatches = await Match.countDocuments({
      matchDate: { $gte: tomorrow, $lte: tomorrowEnd }
    });
    
    console.log(`Yesterday's matches: ${yesterdayMatches}`);
    console.log(`Today's matches: ${todayMatches}`);
    console.log(`Tomorrow's matches: ${tomorrowMatches}`);
    
    // Get a sample match
    if (count > 0) {
      const match = await Match.findOne()
        .populate('homeTeam', 'name')
        .populate('awayTeam', 'name')
        .populate('league', 'name');
      
      console.log('\nSample match:');
      console.log(`- ID: ${match._id}`);
      console.log(`- Teams: ${match.homeTeam?.name || 'Unknown'} vs ${match.awayTeam?.name || 'Unknown'}`);
      console.log(`- League: ${match.league?.name || 'Unknown'}`);
      console.log(`- Date: ${match.matchDate}`);
      console.log(`- Status: ${match.status}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking matches:', error);
    process.exit(1);
  }
};

// Run the check
checkMatches();