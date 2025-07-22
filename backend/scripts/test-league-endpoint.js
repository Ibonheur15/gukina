const axios = require('axios');

// Base API URL - change this to match your environment
const API_URL = 'http://localhost:5000/api';

// Test league endpoint with season parameter
async function testLeagueEndpoint() {
  try {
    // Get all leagues first
    console.log('Fetching all leagues...');
    const leaguesResponse = await axios.get(`${API_URL}/leagues`);
    const leagues = leaguesResponse.data;
    
    if (!leagues || leagues.length === 0) {
      console.log('No leagues found. Please create some leagues first.');
      return;
    }
    
    console.log(`Found ${leagues.length} leagues`);
    
    // Test with the first league
    const testLeague = leagues[0];
    console.log(`Testing with league: ${testLeague.name} (${testLeague._id})`);
    
    // Current season
    const currentSeason = new Date().getFullYear().toString();
    console.log(`Testing with current season: ${currentSeason}`);
    
    // Test league endpoint with season parameter
    console.log(`\nFetching league with season=${currentSeason}...`);
    const leagueResponse = await axios.get(`${API_URL}/leagues/${testLeague._id}?season=${currentSeason}`);
    const leagueData = leagueResponse.data;
    
    console.log('League data received:');
    console.log(`- Name: ${leagueData.league.name}`);
    console.log(`- Season: ${leagueData.season}`);
    console.log(`- Teams: ${leagueData.teams ? leagueData.teams.length : 0}`);
    console.log(`- Standings: ${leagueData.standings ? leagueData.standings.length : 0}`);
    
    if (leagueData.standings && leagueData.standings.length > 0) {
      console.log('\nStandings sample:');
      const sample = leagueData.standings.slice(0, 3);
      sample.forEach(standing => {
        console.log(`- Position ${standing.position}: ${standing.team ? standing.team.name : 'Unknown'} - ${standing.points} points (${standing.won}W ${standing.drawn}D ${standing.lost}L)`);
      });
    } else {
      console.log('\nNo standings found for this season.');
    }
    
    // Test with previous season
    const previousSeason = (parseInt(currentSeason) - 1).toString();
    console.log(`\nFetching league with season=${previousSeason}...`);
    const prevLeagueResponse = await axios.get(`${API_URL}/leagues/${testLeague._id}?season=${previousSeason}`);
    const prevLeagueData = prevLeagueResponse.data;
    
    console.log('Previous season league data:');
    console.log(`- Season: ${prevLeagueData.season}`);
    console.log(`- Standings: ${prevLeagueData.standings ? prevLeagueData.standings.length : 0}`);
    
  } catch (error) {
    console.error('Error testing league endpoint:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Run the test
testLeagueEndpoint();