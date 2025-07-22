require('dotenv').config();
const mongoose = require('mongoose');
const Match = require('./models/Match');
const League = require('./models/League');
const Team = require('./models/Team');

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

// Test all match endpoints
const testMatchEndpoints = async () => {
  try {
    console.log('=== TESTING MATCH ENDPOINTS ===\n');
    
    // 1. Check if matches exist in the database
    const matchCount = await Match.countDocuments();
    console.log(`Total matches in database: ${matchCount}`);
    
    if (matchCount === 0) {
      console.log('\n⚠️ NO MATCHES FOUND IN DATABASE!');
      console.log('Please run the seed script: npm run seed-matches');
      
      // Check if we have leagues and teams
      const leagueCount = await League.countDocuments();
      const teamCount = await Team.countDocuments();
      
      console.log(`\nLeagues in database: ${leagueCount}`);
      console.log(`Teams in database: ${teamCount}`);
      
      if (leagueCount === 0) {
        console.log('\n⚠️ No leagues found. Run: npm run seed-leagues');
      }
      
      if (teamCount === 0) {
        console.log('\n⚠️ No teams found. Teams will be created by seed-matches.js');
      }
      
      process.exit(1);
    }
    
    // 2. Test getAllMatches endpoint
    console.log('\n=== Testing getAllMatches ===');
    const allMatches = await Match.find()
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name')
      .limit(5);
    
    console.log(`Found ${allMatches.length} matches`);
    if (allMatches.length > 0) {
      console.log('Sample matches:');
      allMatches.forEach((match, i) => {
        console.log(`${i+1}. ${match.homeTeam?.name || 'Unknown'} vs ${match.awayTeam?.name || 'Unknown'} (${match.matchDate.toLocaleString()})`);
      });
    }
    
    // 3. Test getLiveMatches endpoint
    console.log('\n=== Testing getLiveMatches ===');
    const liveMatches = await Match.find({ status: { $in: ['live', 'halftime'] } })
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name');
    
    console.log(`Found ${liveMatches.length} live matches`);
    if (liveMatches.length > 0) {
      console.log('Live matches:');
      liveMatches.forEach((match, i) => {
        console.log(`${i+1}. ${match.homeTeam?.name || 'Unknown'} vs ${match.awayTeam?.name || 'Unknown'} (${match.status}, minute: ${match.currentMinute})`);
      });
    }
    
    // 4. Test getMatchesByDateRange endpoint for today
    console.log('\n=== Testing getMatchesByDateRange (today) ===');
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log(`Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
    
    const todayMatches = await Match.find({
      matchDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name');
    
    console.log(`Found ${todayMatches.length} matches for today`);
    if (todayMatches.length > 0) {
      console.log('Today\'s matches:');
      todayMatches.forEach((match, i) => {
        console.log(`${i+1}. ${match.homeTeam?.name || 'Unknown'} vs ${match.awayTeam?.name || 'Unknown'} (${match.matchDate.toLocaleString()})`);
      });
    }
    
    // 5. Test getMatchesByDateRange endpoint for yesterday
    console.log('\n=== Testing getMatchesByDateRange (yesterday) ===');
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const startOfYesterday = new Date(yesterday);
    startOfYesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);
    
    console.log(`Date range: ${startOfYesterday.toISOString()} to ${endOfYesterday.toISOString()}`);
    
    const yesterdayMatches = await Match.find({
      matchDate: {
        $gte: startOfYesterday,
        $lte: endOfYesterday
      }
    })
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name');
    
    console.log(`Found ${yesterdayMatches.length} matches for yesterday`);
    if (yesterdayMatches.length > 0) {
      console.log('Yesterday\'s matches:');
      yesterdayMatches.forEach((match, i) => {
        console.log(`${i+1}. ${match.homeTeam?.name || 'Unknown'} vs ${match.awayTeam?.name || 'Unknown'} (${match.matchDate.toLocaleString()})`);
      });
    }
    
    // 6. Test getMatchesByDateRange endpoint for tomorrow
    console.log('\n=== Testing getMatchesByDateRange (tomorrow) ===');
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const startOfTomorrow = new Date(tomorrow);
    startOfTomorrow.setHours(0, 0, 0, 0);
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);
    
    console.log(`Date range: ${startOfTomorrow.toISOString()} to ${endOfTomorrow.toISOString()}`);
    
    const tomorrowMatches = await Match.find({
      matchDate: {
        $gte: startOfTomorrow,
        $lte: endOfTomorrow
      }
    })
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name');
    
    console.log(`Found ${tomorrowMatches.length} matches for tomorrow`);
    if (tomorrowMatches.length > 0) {
      console.log('Tomorrow\'s matches:');
      tomorrowMatches.forEach((match, i) => {
        console.log(`${i+1}. ${match.homeTeam?.name || 'Unknown'} vs ${match.awayTeam?.name || 'Unknown'} (${match.matchDate.toLocaleString()})`);
      });
    }
    
    // 7. Test getMatchesByLeague endpoint
    console.log('\n=== Testing getMatchesByLeague ===');
    const leagues = await League.find().limit(1);
    
    if (leagues.length > 0) {
      const leagueId = leagues[0]._id;
      console.log(`Testing with league: ${leagues[0].name} (${leagueId})`);
      
      const leagueMatches = await Match.find({ league: leagueId })
        .populate('homeTeam', 'name')
        .populate('awayTeam', 'name');
      
      console.log(`Found ${leagueMatches.length} matches for this league`);
      if (leagueMatches.length > 0) {
        console.log('League matches:');
        leagueMatches.forEach((match, i) => {
          console.log(`${i+1}. ${match.homeTeam?.name || 'Unknown'} vs ${match.awayTeam?.name || 'Unknown'} (${match.matchDate.toLocaleString()})`);
        });
      }
    } else {
      console.log('No leagues found to test getMatchesByLeague');
    }
    
    // 8. Test getMatchesByTeam endpoint
    console.log('\n=== Testing getMatchesByTeam ===');
    const teams = await Team.find().limit(1);
    
    if (teams.length > 0) {
      const teamId = teams[0]._id;
      console.log(`Testing with team: ${teams[0].name} (${teamId})`);
      
      const teamMatches = await Match.find({
        $or: [{ homeTeam: teamId }, { awayTeam: teamId }]
      })
        .populate('homeTeam', 'name')
        .populate('awayTeam', 'name');
      
      console.log(`Found ${teamMatches.length} matches for this team`);
      if (teamMatches.length > 0) {
        console.log('Team matches:');
        teamMatches.forEach((match, i) => {
          console.log(`${i+1}. ${match.homeTeam?.name || 'Unknown'} vs ${match.awayTeam?.name || 'Unknown'} (${match.matchDate.toLocaleString()})`);
        });
      }
    } else {
      console.log('No teams found to test getMatchesByTeam');
    }
    
    console.log('\n=== TEST COMPLETED ===');
    process.exit(0);
  } catch (error) {
    console.error('Error testing match endpoints:', error);
    process.exit(1);
  }
};

// Run the test
testMatchEndpoints();