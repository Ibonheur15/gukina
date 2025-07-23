require('dotenv').config();
const mongoose = require('mongoose');
const Team = require('./models/Team');
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

// Fix teams without leagues
const fixTeams = async () => {
  try {
    console.log('=== CHECKING TEAMS DATABASE ===\n');
    
    // 1. Check if teams exist
    const totalTeams = await Team.countDocuments();
    console.log(`Total teams in database: ${totalTeams}`);
    
    // 2. Find teams without leagues
    const teamsWithoutLeague = await Team.find({ league: { $exists: false } });
    console.log(`Found ${teamsWithoutLeague.length} teams without league`);
    
    // 3. Find teams with null league
    const teamsWithNullLeague = await Team.find({ league: null });
    console.log(`Found ${teamsWithNullLeague.length} teams with null league`);
    
    // 4. Get all leagues
    const leagues = await League.find().populate('country');
    console.log(`Found ${leagues.length} leagues`);
    
    if (leagues.length === 0) {
      console.log('\n⚠️ No leagues found. Creating a sample league...');
      
      // Create a country if none exists
      let country = await Country.findOne();
      
      if (!country) {
        country = new Country({
          name: 'Rwanda',
          code: 'RW',
          flag: 'https://flagcdn.com/w320/rw.png'
        });
        await country.save();
        console.log('Created sample country');
      }
      
      // Create a league
      const league = new League({
        name: 'Sample League',
        country: country._id,
        season: '2023-2024',
        priority: 10,
        active: true
      });
      
      await league.save();
      console.log('Created sample league');
      
      // Refresh leagues
      leagues.push(await League.findById(league._id).populate('country'));
    }
    
    // 5. Fix teams without leagues
    const teamsToFix = [...teamsWithoutLeague, ...teamsWithNullLeague];
    let fixedCount = 0;
    
    for (const team of teamsToFix) {
      // Assign to first league
      team.league = leagues[0]._id;
      
      // If team doesn't have a country, assign the league's country
      if (!team.country) {
        team.country = leagues[0].country._id;
      }
      
      await team.save();
      fixedCount++;
    }
    
    console.log(`\nFixed ${fixedCount} teams by assigning them to leagues`);
    
    // 6. Check all teams to ensure they have leagues
    const remainingTeamsWithoutLeague = await Team.countDocuments({ 
      $or: [
        { league: { $exists: false } },
        { league: null }
      ]
    });
    
    console.log(`Remaining teams without league: ${remainingTeamsWithoutLeague}`);
    
    // 7. List all teams with their leagues
    const allTeams = await Team.find().populate('league').populate('country');
    console.log('\nTeams and their leagues:');
    allTeams.forEach((team, i) => {
      console.log(`${i+1}. ${team.name} - League: ${team.league ? team.league.name : 'NONE'}, Country: ${team.country ? team.country.name : 'NONE'}`);
    });
    
    console.log('\n=== FIX COMPLETED ===');
    console.log('Please restart your server to see the changes.');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing teams:', error);
    process.exit(1);
  }
};

// Run the fix
fixTeams();