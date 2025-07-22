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

// Test day parameter
const testDayParam = async () => {
  try {
    // Get today's date
    const now = new Date();
    
    // Create date ranges for yesterday, today, and tomorrow
    const days = ['yesterday', 'today', 'tomorrow'];
    
    for (const day of days) {
      let targetDate;
      
      if (day === 'yesterday') {
        targetDate = new Date(now);
        targetDate.setDate(now.getDate() - 1);
      } else if (day === 'today') {
        targetDate = new Date(now);
      } else if (day === 'tomorrow') {
        targetDate = new Date(now);
        targetDate.setDate(now.getDate() + 1);
      }
      
      // Set start and end of the target day
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      console.log(`\nTesting ${day}:`);
      console.log(`- Date: ${targetDate.toDateString()}`);
      console.log(`- Start: ${startOfDay.toISOString()}`);
      console.log(`- End: ${endOfDay.toISOString()}`);
      
      // Query matches for this day
      const matches = await Match.find({
        matchDate: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }).populate('homeTeam', 'name').populate('awayTeam', 'name');
      
      console.log(`- Found ${matches.length} matches`);
      
      // Show match details
      if (matches.length > 0) {
        console.log('- Matches:');
        matches.forEach((match, index) => {
          console.log(`  ${index + 1}. ${match.homeTeam?.name || 'Unknown'} vs ${match.awayTeam?.name || 'Unknown'} (${match.matchDate.toLocaleString()})`);
        });
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing day parameter:', error);
    process.exit(1);
  }
};

// Run the test
testDayParam();