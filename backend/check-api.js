require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

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

// Check API
const checkAPI = async () => {
  try {
    console.log('=== CHECKING API ===\n');
    
    // Get models
    const League = require('./models/League');
    const LeagueStanding = require('./models/LeagueStanding');
    
    // 1. Get a league to test with
    const leagues = await League.find().limit(1);
    if (leagues.length === 0) {
      console.log('No leagues found. Please create leagues first.');
      process.exit(1);
    }
    
    const league = leagues[0];
    console.log(`Using league: ${league.name} (${league._id})`);
    
    // 2. Check if standings exist for this league
    const standings = await LeagueStanding.find({ league: league._id });
    console.log(`Found ${standings.length} standings in database for this league`);
    
    // 3. Start a simple server to test the API
    const express = require('express');
    const app = express();
    const cors = require('cors');
    
    // Import routes
    const leagueRoutes = require('./routes/leagueRoutes');
    const leagueStandingRoutes = require('./routes/leagueStandingRoutes');
    
    // Middleware
    app.use(cors());
    app.use(express.json());
    
    // Routes
    app.use('/api/leagues', leagueRoutes);
    app.use('/api/standings', leagueStandingRoutes);
    
    // Start server
    const server = app.listen(5001, async () => {
      console.log('Test server running on port 5001');
      
      try {
        // 4. Test league endpoint
        console.log('\nTesting league endpoint...');
        const leagueResponse = await axios.get(`http://localhost:5001/api/leagues/${league._id}`);
        console.log(`League API Response Status: ${leagueResponse.status}`);
        console.log(`League data received: ${leagueResponse.data ? 'Yes' : 'No'}`);
        
        if (leagueResponse.data && leagueResponse.data.standings) {
          console.log(`Standings in league response: ${leagueResponse.data.standings.length}`);
        } else {
          console.log('No standings in league response');
        }
        
        // 5. Test standings endpoint
        console.log('\nTesting standings endpoint...');
        const standingsResponse = await axios.get(`http://localhost:5001/api/standings/league/${league._id}`);
        console.log(`Standings API Response Status: ${standingsResponse.status}`);
        console.log(`Standings received: ${standingsResponse.data.length}`);
        
        if (standingsResponse.data.length > 0) {
          console.log('\nSample standing:');
          console.log(`- Team: ${standingsResponse.data[0].team?.name || 'Unknown'}`);
          console.log(`- Position: ${standingsResponse.data[0].position}`);
          console.log(`- Points: ${standingsResponse.data[0].points}`);
        } else {
          console.log('\nNo standings returned from API');
        }
        
        // 6. Check if frontend can access the API
        console.log('\nChecking if frontend can access API...');
        console.log('Frontend should be configured to use: http://localhost:5000/api');
        console.log('Make sure CORS is enabled on the backend server');
        console.log('Check browser console for any network errors');
        
      } catch (error) {
        console.error('API test failed:', error.message);
        if (error.response) {
          console.error(`Status: ${error.response.status}`);
          console.error(`Data:`, error.response.data);
        }
      } finally {
        server.close();
        console.log('\nTest server closed');
        
        console.log('\n=== CHECK COMPLETED ===');
        console.log('If you still cannot see standings in the frontend:');
        console.log('1. Make sure your backend server is running on port 5000');
        console.log('2. Make sure your frontend is configured to use http://localhost:5000/api');
        console.log('3. Check browser console for any CORS or network errors');
        console.log('4. Try clearing your browser cache and reloading');
        
        process.exit(0);
      }
    });
  } catch (error) {
    console.error('Error checking API:', error);
    process.exit(1);
  }
};

// Run the check
checkAPI();