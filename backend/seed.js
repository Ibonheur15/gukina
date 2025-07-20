require('dotenv').config();
const mongoose = require('mongoose');
const Country = require('./models/Country');
const League = require('./models/League');
const Team = require('./models/Team');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gukina', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected for seeding'))
  .catch((err) => {
    console.log('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample data
const countries = [
  {
    name: 'Rwanda',
    code: 'RWA',
    region: 'East Africa',
    active: true
  },
  {
    name: 'Kenya',
    code: 'KEN',
    region: 'East Africa',
    active: true
  },
  {
    name: 'Nigeria',
    code: 'NGA',
    region: 'West Africa',
    active: true
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Country.deleteMany({});
    await League.deleteMany({});
    await Team.deleteMany({});
    
    console.log('Previous data cleared');
    
    // Add countries
    const createdCountries = await Country.insertMany(countries);
    console.log(`${createdCountries.length} countries added`);
    
    // Add leagues
    const leagues = [
      {
        name: 'Rwanda Premier League',
        country: createdCountries[0]._id,
        season: '2023-2024',
        active: true
      },
      {
        name: 'Kenya Premier League',
        country: createdCountries[1]._id,
        season: '2023-2024',
        active: true
      },
      {
        name: 'Nigeria Professional Football League',
        country: createdCountries[2]._id,
        season: '2023-2024',
        active: true
      }
    ];
    
    const createdLeagues = await League.insertMany(leagues);
    console.log(`${createdLeagues.length} leagues added`);
    
    // Add teams
    const teams = [
      {
        name: 'APR FC',
        shortName: 'APR',
        country: createdCountries[0]._id,
        leagues: [createdLeagues[0]._id],
        active: true
      },
      {
        name: 'Rayon Sports',
        shortName: 'RAY',
        country: createdCountries[0]._id,
        leagues: [createdLeagues[0]._id],
        active: true
      },
      {
        name: 'Gor Mahia',
        shortName: 'GOR',
        country: createdCountries[1]._id,
        leagues: [createdLeagues[1]._id],
        active: true
      },
      {
        name: 'AFC Leopards',
        shortName: 'AFC',
        country: createdCountries[1]._id,
        leagues: [createdLeagues[1]._id],
        active: true
      },
      {
        name: 'Enyimba FC',
        shortName: 'ENY',
        country: createdCountries[2]._id,
        leagues: [createdLeagues[2]._id],
        active: true
      },
      {
        name: 'Kano Pillars',
        shortName: 'KAN',
        country: createdCountries[2]._id,
        leagues: [createdLeagues[2]._id],
        active: true
      }
    ];
    
    const createdTeams = await Team.insertMany(teams);
    console.log(`${createdTeams.length} teams added`);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();