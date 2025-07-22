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

// Force create standings
const forceCreateStandings = async () => {
  try {
    console.log('=== FORCE CREATING STANDINGS ===\n');
    
    // 1. Check if LeagueStanding model exists
    try {
      await mongoose.connection.db.collection('leaguestandings').stats();
      console.log('LeagueStanding collection exists');
    } catch (err) {
      console.log('LeagueStanding collection does not exist, will be created automatically');
    }
    
    // 2. Get all leagues
    const leagues = await League.find();
    console.log(`Found ${leagues.length} leagues`);
    
    if (leagues.length === 0) {
      console.log('No leagues found. Creating a sample league...');
      
      // Create a country if none exists
      const Country = require('./models/Country');
      let country = await Country.findOne();
      
      if (!country) {
        country = new Country({
          name: 'Sample Country',
          code: 'SC',
          flag: 'https://via.placeholder.com/150'
        });
        await country.save();
        console.log('Created sample country');
      }
      
      // Create a league
      const league = new League({
        name: 'Sample League',
        country: country._id,
        priority: 10,
        active: true
      });
      
      await league.save();
      console.log('Created sample league');
      
      // Refresh leagues
      leagues.push(await League.findById(league._id));
    }
    
    // 3. Process each league
    for (const league of leagues) {
      console.log(`\nProcessing league: ${league.name}`);
      
      // 4. Get teams in this league
      let teams = await Team.find({ league: league._id });
      console.log(`Found ${teams.length} teams in this league`);
      
      if (teams.length === 0) {
        console.log('No teams found. Creating sample teams...');
        
        // Get country from the league
        const country = await mongoose.model('Country').findById(league.country);
        if (!country) {
          console.log('League has no valid country. Skipping...');
          continue;
        }
        
        // Create sample teams
        const sampleTeams = [
          { name: 'Team A', shortName: 'TMA', league: league._id, country: country._id },
          { name: 'Team B', shortName: 'TMB', league: league._id, country: country._id },
          { name: 'Team C', shortName: 'TMC', league: league._id, country: country._id },
          { name: 'Team D', shortName: 'TMD', league: league._id, country: country._id }
        ];
        
        await Team.insertMany(sampleTeams);
        console.log('Created sample teams');
        
        // Refresh teams
        teams = await Team.find({ league: league._id });
      }
      
      // 5. Current season
      const currentSeason = new Date().getFullYear().toString();
      
      // 6. Delete existing standings
      try {
        const deleted = await LeagueStanding.deleteMany({ league: league._id });
        console.log(`Deleted ${deleted.deletedCount} existing standings`);
      } catch (err) {
        console.log('Error deleting standings:', err.message);
      }
      
      // 7. Create standings for all teams
      const standings = [];
      
      for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        
        // Create standing with sample data
        const standing = {
          league: league._id,
          team: team._id,
          season: currentSeason,
          position: i + 1,
          played: 10,
          won: 5,
          drawn: 3,
          lost: 2,
          goalsFor: 15,
          goalsAgainst: 10,
          points: 18,
          form: ['W', 'D', 'W', 'L', 'W'],
          lastUpdated: new Date()
        };
        
        standings.push(standing);
      }
      
      // 8. Insert standings directly into the database
      try {
        if (standings.length > 0) {
          const result = await mongoose.connection.db.collection('leaguestandings').insertMany(standings);
          console.log(`Inserted ${result.insertedCount} standings directly into database`);
        }
      } catch (err) {
        console.log('Error inserting standings:', err.message);
        
        // 9. Try inserting one by one if bulk insert fails
        console.log('Trying to insert standings one by one...');
        let insertedCount = 0;
        
        for (const standing of standings) {
          try {
            await mongoose.connection.db.collection('leaguestandings').insertOne(standing);
            insertedCount++;
          } catch (err) {
            console.log(`Error inserting standing for team ${standing.team}:`, err.message);
          }
        }
        
        console.log(`Inserted ${insertedCount} standings individually`);
      }
    }
    
    // 10. Verify standings were created
    const standingCount = await LeagueStanding.countDocuments();
    console.log(`\nTotal standings in database after creation: ${standingCount}`);
    
    if (standingCount > 0) {
      const sampleStandings = await LeagueStanding.find().limit(3).populate('team');
      console.log('\nSample standings:');
      sampleStandings.forEach((standing, i) => {
        console.log(`${i+1}. ${standing.team?.name || 'Unknown'} - P: ${standing.played}, Pts: ${standing.points}`);
      });
    }
    
    console.log('\n=== STANDINGS CREATION COMPLETED ===');
    console.log('Please restart your server and refresh your frontend.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating standings:', error);
    process.exit(1);
  }
};

// Run the script
forceCreateStandings();