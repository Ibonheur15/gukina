require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
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

// Debug standings
const debugStandings = async () => {
  try {
    console.log('=== DEBUGGING STANDINGS ===\n');
    
    // 1. Check if standings exist in the database
    const standingCount = await LeagueStanding.countDocuments();
    console.log(`Total standings in database: ${standingCount}`);
    
    // 2. Get a league to test with
    const leagues = await League.find().limit(1);
    if (leagues.length === 0) {
      console.log('No leagues found. Please run seed-leagues.js first.');
      process.exit(1);
    }
    
    const league = leagues[0];
    console.log(`Using league: ${league.name} (${league._id})`);
    
    // 3. Check if teams exist for this league
    const teams = await Team.find({ league: league._id });
    console.log(`Teams in this league: ${teams.length}`);
    
    // 4. Check if standings exist for this league
    const leagueStandings = await LeagueStanding.find({ league: league._id }).populate('team');
    console.log(`Standings for this league: ${leagueStandings.length}`);
    
    // 5. If standings exist, show them
    if (leagueStandings.length > 0) {
      console.log('\nStandings in database:');
      leagueStandings.forEach((standing, i) => {
        console.log(`${i+1}. ${standing.team?.name || 'Unknown'} - P: ${standing.played}, W: ${standing.won}, D: ${standing.drawn}, L: ${standing.lost}, Pts: ${standing.points}`);
      });
    }
    
    // 6. If no standings exist, create some
    if (leagueStandings.length === 0) {
      console.log('\nNo standings found. Creating sample standings...');
      
      // Create sample standings
      const currentSeason = new Date().getFullYear().toString();
      const standings = [];
      
      for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        
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
      
      // Save to database
      for (const standing of standings) {
        await standing.save();
      }
      
      console.log(`Created ${standings.length} standings`);
      
      // Verify they were created
      const newStandings = await LeagueStanding.find({ league: league._id }).populate('team');
      console.log(`Standings after creation: ${newStandings.length}`);
      
      if (newStandings.length > 0) {
        console.log('\nNew standings:');
        newStandings.forEach((standing, i) => {
          console.log(`${i+1}. ${standing.team?.name || 'Unknown'} - P: ${standing.played}, W: ${standing.won}, D: ${standing.drawn}, L: ${standing.lost}, Pts: ${standing.points}`);
        });
      }
    }
    
    // 7. Test the API directly
    console.log('\nTesting API endpoint directly...');
    
    try {
      const apiUrl = `http://localhost:5000/api/standings/league/${league._id}`;
      console.log(`API URL: ${apiUrl}`);
      
      const response = await axios.get(apiUrl);
      
      console.log(`API Response Status: ${response.status}`);
      console.log(`Standings returned: ${response.data.length}`);
      
      if (response.data.length > 0) {
        console.log('\nSample standing from API:');
        console.log(`- Team: ${response.data[0].team?.name || 'Unknown'}`);
        console.log(`- Position: ${response.data[0].position}`);
        console.log(`- Points: ${response.data[0].points}`);
      } else {
        console.log('\nNo standings returned from API');
      }
    } catch (error) {
      console.error('API test failed:', error.message);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data:`, error.response.data);
      }
    }
    
    console.log('\n=== DEBUG COMPLETED ===');
    console.log('If you still cannot see standings in the frontend:');
    console.log('1. Make sure your backend server is running on port 5000');
    console.log('2. Make sure your frontend is configured to use http://localhost:5000/api');
    console.log('3. Check browser console for any CORS or network errors');
    console.log('4. Try clearing your browser cache and reloading');
    
    process.exit(0);
  } catch (error) {
    console.error('Error debugging standings:', error);
    process.exit(1);
  }
};

// Run the debug
debugStandings();