require('dotenv').config();
const mongoose = require('mongoose');
const League = require('./models/League');

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

// Check leagues
const checkLeagues = async () => {
  try {
    // Count leagues
    const count = await League.countDocuments();
    console.log(`Total leagues in database: ${count}`);

    // Get all leagues
    const leagues = await League.find().populate('country');
    
    console.log('\nLeagues:');
    leagues.forEach(league => {
      console.log(`- ID: ${league._id}, Name: ${league.name}, Country: ${league.country ? league.country.name : 'None'}`);
    });

    if (count === 0) {
      console.log('\nNo leagues found. You may need to create some leagues first.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking leagues:', error);
    process.exit(1);
  }
};

// Run the check
checkLeagues();