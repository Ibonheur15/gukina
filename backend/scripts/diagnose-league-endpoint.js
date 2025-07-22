const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Base API URL - change this to match your environment
const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Import models
const League = require('../models/League');
const Match = require('../models/Match');
const LeagueStanding = require('../models/LeagueStanding');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function diagnoseLeagueEndpoint() {
  try {
    console.log('Diagnosing league endpoint with season parameter...');
    
    // 1. Check if we have leagues in the database
    const leagues = await League.find();
    if (leagues.length === 0) {
      console.error('No leagues found in the database. Please create some leagues first.');
      return;
    }
    
    console.log(`Found ${leagues.length} leagues in the database`);
    
    // 2. Select the first league for testing
    const testLeague = leagues[0];
    console.log(`Using league for testing: ${testLeague.name} (${testLeague._id})`);
    
    // 3. Check if we have matches for this league
    const matches = await Match.find({ league: testLeague._id });
    console.log(`Found ${matches.length} matches for this league`);
    
    // 4. Check if matches have season field
    const matchesWithSeason = await Match.find({ 
      league: testLeague._id,
      season: { $exists: true }
    });
    
    console.log(`Matches with season field: ${matchesWithSeason.length}/${matches.length}`);
    
    if (matchesWithSeason.length < matches.length) {
      console.warn('Some matches are missing the season field. Run fix-seasons script.');
    }
    
    // 5. Get seasons from matches
    const seasons = await Match.distinct('season', { league: testLeague._id });
    console.log(`Seasons found in matches: ${seasons.join(', ') || 'None'}`);
    
    // 6. Check if we have standings for this league
    const standings = await LeagueStanding.find({ league: testLeague._id });
    console.log(`Found ${standings.length} standings for this league`);
    
    // 7. Get seasons from standings
    const standingSeasons = await LeagueStanding.distinct('season', { league: testLeague._id });
    console.log(`Seasons found in standings: ${standingSeasons.join(', ') || 'None'}`);
    
    // 8. Test API endpoint with different seasons
    console.log('\nTesting API endpoint with different seasons:');
    
    // Current season
    const currentSeason = new Date().getFullYear().toString();
    
    // Test seasons: current, previous, and one from the database if available
    const testSeasons = [
      currentSeason,
      (parseInt(currentSeason) - 1).toString(),
      ...(seasons.length > 0 ? [seasons[0]] : [])
    ];
    
    // Remove duplicates
    const uniqueTestSeasons = [...new Set(testSeasons)];
    
    for (const season of uniqueTestSeasons) {
      console.log(`\nTesting with season=${season}...`);
      
      try {
        const response = await axios.get(`${API_URL}/leagues/${testLeague._id}?season=${season}`);
        const data = response.data;
        
        console.log(`API Response for season ${season}:`);
        console.log(`- Status: ${response.status}`);
        console.log(`- League: ${data.league.name}`);
        console.log(`- Season: ${data.season}`);
        console.log(`- Teams: ${data.teams ? data.teams.length : 0}`);
        console.log(`- Standings: ${data.standings ? data.standings.length : 0}`);
        
        // Check if standings were created
        if (data.standings && data.standings.length > 0) {
          console.log('✅ Standings were successfully created/returned');
        } else {
          console.log('❌ No standings returned');
          
          // Check if there are teams
          if (!data.teams || data.teams.length === 0) {
            console.log('   Reason: No teams found for this league');
          } else {
            console.log('   Reason: Unknown - teams exist but no standings were created');
            
            // Check database directly
            const dbStandings = await LeagueStanding.find({ 
              league: testLeague._id,
              season: season
            });
            
            if (dbStandings.length > 0) {
              console.log(`   Database has ${dbStandings.length} standings for this season, but they weren't returned by the API`);
            } else {
              console.log('   Database also has no standings for this season');
            }
          }
        }
      } catch (error) {
        console.error(`Error testing API for season ${season}:`);
        if (error.response) {
          console.error(`Status: ${error.response.status}`);
          console.error('Response:', error.response.data);
        } else {
          console.error(error.message);
        }
      }
    }
    
    // 9. Provide recommendations
    console.log('\nRecommendations:');
    
    if (matches.length === 0) {
      console.log('- Create some matches for this league');
    }
    
    if (matchesWithSeason.length < matches.length) {
      console.log('- Run the fix-seasons script to add season field to all matches');
    }
    
    if (standings.length === 0) {
      console.log('- Run the generate-season script to create standings for this league');
      console.log(`  npm run generate-season ${testLeague._id} ${currentSeason}`);
    }
    
  } catch (error) {
    console.error('Error diagnosing league endpoint:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the function
diagnoseLeagueEndpoint();