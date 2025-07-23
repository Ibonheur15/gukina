require('dotenv').config();
const mongoose = require('mongoose');
const Country = require('./models/Country');
const League = require('./models/League');
const Team = require('./models/Team');
const Match = require('./models/Match');
const LeagueStanding = require('./models/LeagueStanding');

async function createIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Create indexes for Country model
    console.log('Creating indexes for Country model...');
    await Country.collection.createIndex({ name: 1 });
    await Country.collection.createIndex({ code: 1 }, { unique: true });

    // Create indexes for League model
    console.log('Creating indexes for League model...');
    await League.collection.createIndex({ country: 1 });
    await League.collection.createIndex({ name: 1, country: 1 });
    await League.collection.createIndex({ season: 1 });

    // Create indexes for Team model
    console.log('Creating indexes for Team model...');
    await Team.collection.createIndex({ country: 1 });
    await Team.collection.createIndex({ league: 1 });
    await Team.collection.createIndex({ name: 1 });

    // Create indexes for Match model
    console.log('Creating indexes for Match model...');
    await Match.collection.createIndex({ homeTeam: 1 });
    await Match.collection.createIndex({ awayTeam: 1 });
    await Match.collection.createIndex({ league: 1 });
    await Match.collection.createIndex({ date: 1 });
    await Match.collection.createIndex({ status: 1 });
    await Match.collection.createIndex({ season: 1 });

    // Create indexes for LeagueStanding model
    console.log('Creating indexes for LeagueStanding model...');
    await LeagueStanding.collection.createIndex({ league: 1, season: 1 });
    await LeagueStanding.collection.createIndex({ team: 1 });
    await LeagueStanding.collection.createIndex({ league: 1, team: 1, season: 1 }, { unique: true });

    console.log('All indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createIndexes();