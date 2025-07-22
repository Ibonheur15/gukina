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

// Test standings API
const testStandingsAPI = async () => {
  try {
    console.log('=== TESTING STANDINGS API ===\n');
    
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
    const leagueStandings = await LeagueStanding.find({ league: league._id });
    console.log(`Standings for this league: ${leagueStandings.length}`);
    
    // 5. If no standings exist, create some
    if (leagueStandings.length === 0) {
      console.log('\nNo standings found. Creating default standings...');
      
      const currentSeason = new Date().getFullYear().toString();
      const standings = [];
      
      for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        
        standings.push({
          league: league._id,
          team: team._id,
          season: currentSeason,
          position: i + 1,
          played: i, // Some sample data
          won: Math.floor(i / 2),
          drawn: i % 2,
          lost: Math.floor(i / 3),
          goalsFor: i * 2,
          goalsAgainst: i,
          points: Math.floor(i / 2) * 3 + (i % 2),
          form: ['W', 'D', 'L'].slice(0, i % 3 + 1),
          lastUpdated: new Date()
        });
      }
      
      if (standings.length > 0) {
        await LeagueStanding.insertMany(standings);
        console.log(`Created ${standings.length} default standings`);
      }
    }
    
    // 6. Test the API directly
    console.log('\nTesting API endpoint...');
    
    // Start a simple HTTP server to test the API
    const express = require('express');
    const app = express();
    const leagueStandingRoutes = require('./routes/leagueStandingRoutes');
    
    app.use('/api/standings', leagueStandingRoutes);
    
    const server = app.listen(5001, async () => {
      console.log('Test server running on port 5001');
      
      try {
        // Make a direct API call
        const response = await axios.get(`http://localhost:5001/api/standings/league/${league._id}`);
        
        console.log(`API Response Status: ${response.status}`);
        console.log(`Standings returned: ${response.data.length}`);
        
        if (response.data.length > 0) {
          console.log('\nSample standing:');
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
      } finally {
        server.close();
        console.log('\nTest server closed');
        
        // 7. Check frontend API URL
        console.log('\nVerify your frontend API URL:');
        console.log('- Check that REACT_APP_API_URL is set correctly in your .env file');
        console.log('- Default should be http://localhost:5000/api');
        console.log('- Current API URL in your code might be different');
        
        console.log('\n=== TEST COMPLETED ===');
        process.exit(0);
      }
    });
  } catch (error) {
    console.error('Error testing standings API:', error);
    process.exit(1);
  }
};

// Run the test
testStandingsAPI();