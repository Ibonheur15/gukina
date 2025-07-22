require('dotenv').config();
const mongoose = require('mongoose');

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

// Direct fix for standings
const directFix = async () => {
  try {
    console.log('=== DIRECT STANDINGS FIX ===\n');
    
    // Get models
    const League = require('./models/League');
    const Team = require('./models/Team');
    const LeagueStanding = require('./models/LeagueStanding');
    
    // 1. Get all leagues
    const leagues = await League.find();
    console.log(`Found ${leagues.length} leagues`);
    
    if (leagues.length === 0) {
      console.log('No leagues found. Please create leagues first.');
      process.exit(1);
    }
    
    // 2. Get all teams
    const allTeams = await Team.find();
    console.log(`Found ${allTeams.length} teams total`);
    
    if (allTeams.length === 0) {
      console.log('No teams found. Please create teams first.');
      process.exit(1);
    }
    
    // 3. Clear existing standings
    await LeagueStanding.deleteMany({});
    console.log('Cleared all existing standings');
    
    // 4. Current season
    const currentSeason = new Date().getFullYear().toString();
    
    // 5. Process each league
    for (const league of leagues) {
      console.log(`\nProcessing league: ${league.name}`);
      
      // Get teams for this league
      const teamsInLeague = allTeams.filter(team => 
        team.league && team.league.toString() === league._id.toString()
      );
      
      console.log(`Found ${teamsInLeague.length} teams in this league`);
      
      if (teamsInLeague.length === 0) {
        console.log('No teams found for this league. Skipping...');
        continue;
      }
      
      // Create standings for all teams in this league
      const standings = [];
      
      for (let i = 0; i < teamsInLeague.length; i++) {
        const team = teamsInLeague[i];
        
        // Generate some realistic data
        const played = 10;
        const won = Math.floor(Math.random() * (played + 1));
        const drawn = Math.floor(Math.random() * (played - won + 1));
        const lost = played - won - drawn;
        const goalsFor = won * 2 + drawn;
        const goalsAgainst = lost * 2 + drawn;
        const points = won * 3 + drawn;
        
        // Generate form
        const form = [];
        for (let j = 0; j < Math.min(5, played); j++) {
          const rand = Math.random();
          if (rand < 0.5) form.push('W');
          else if (rand < 0.8) form.push('D');
          else form.push('L');
        }
        
        standings.push(new LeagueStanding({
          league: league._id,
          team: team._id,
          season: currentSeason,
          position: i + 1,
          played,
          won,
          drawn,
          lost,
          goalsFor,
          goalsAgainst,
          points,
          form,
          lastUpdated: new Date()
        }));
      }
      
      // Sort by points
      standings.sort((a, b) => b.points - a.points);
      
      // Update positions
      for (let i = 0; i < standings.length; i++) {
        standings[i].position = i + 1;
      }
      
      // Save all standings
      for (const standing of standings) {
        try {
          await standing.save();
        } catch (err) {
          console.error(`Error saving standing for team ${standing.team}:`, err.message);
        }
      }
      
      console.log(`Created ${standings.length} standings for league ${league.name}`);
    }
    
    // 6. Verify standings were created
    const finalCount = await LeagueStanding.countDocuments();
    console.log(`\nTotal standings created: ${finalCount}`);
    
    // 7. Check a few standings
    if (finalCount > 0) {
      const sampleStandings = await LeagueStanding.find()
        .populate('team', 'name')
        .populate('league', 'name')
        .limit(5);
      
      console.log('\nSample standings:');
      sampleStandings.forEach((standing, i) => {
        console.log(`${i+1}. League: ${standing.league?.name || 'Unknown'}, Team: ${standing.team?.name || 'Unknown'}, Position: ${standing.position}, Points: ${standing.points}`);
      });
    }
    
    console.log('\n=== FIX COMPLETED ===');
    console.log('Please restart your server and refresh your frontend.');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing standings:', error);
    process.exit(1);
  }
};

// Run the fix
directFix();