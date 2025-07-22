require('dotenv').config();
const mongoose = require('mongoose');
const League = require('./models/League');
const Country = require('./models/Country');

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

// Seed leagues
const seedLeagues = async () => {
  try {
    // Check if leagues already exist
    const leagueCount = await League.countDocuments();
    if (leagueCount > 0) {
      console.log(`${leagueCount} leagues already exist. Skipping seeding.`);
      process.exit(0);
    }

    // Check if countries exist
    const countryCount = await Country.countDocuments();
    if (countryCount === 0) {
      console.log('No countries found. Creating a default country...');
      
      // Create a default country
      const defaultCountry = new Country({
        name: 'Rwanda',
        code: 'RW',
        flag: 'https://flagcdn.com/w320/rw.png'
      });
      
      await defaultCountry.save();
      console.log('Default country created:', defaultCountry.name);
      
      // Create some leagues
      const leagues = [
        {
          name: 'Rwanda Premier League',
          country: defaultCountry._id,
          season: '2023-2024',
          priority: 10,
          active: true
        },
        {
          name: 'Rwanda Cup',
          country: defaultCountry._id,
          season: '2023-2024',
          priority: 5,
          active: true
        }
      ];
      
      const createdLeagues = await League.insertMany(leagues);
      console.log(`${createdLeagues.length} leagues created.`);
      
      // Log the created leagues
      createdLeagues.forEach(league => {
        console.log(`- ID: ${league._id}, Name: ${league.name}`);
      });
      
      process.exit(0);
    } else {
      // Get first country
      const country = await Country.findOne();
      
      // Create some leagues
      const leagues = [
        {
          name: 'Premier League',
          country: country._id,
          season: '2023-2024',
          priority: 10,
          active: true
        },
        {
          name: 'Cup Competition',
          country: country._id,
          season: '2023-2024',
          priority: 5,
          active: true
        }
      ];
      
      const createdLeagues = await League.insertMany(leagues);
      console.log(`${createdLeagues.length} leagues created.`);
      
      // Log the created leagues
      createdLeagues.forEach(league => {
        console.log(`- ID: ${league._id}, Name: ${league.name}`);
      });
      
      process.exit(0);
    }
  } catch (error) {
    console.error('Error seeding leagues:', error);
    process.exit(1);
  }
};

// Run the seeding
seedLeagues();