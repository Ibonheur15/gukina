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

// Fix matches in database
const fixMatches = async () => {
  try {
    console.log('=== CHECKING MATCH DATABASE ===\n');
    
    // 1. Check if matches exist
    const matchCount = await Match.countDocuments();
    console.log(`Total matches in database: ${matchCount}`);
    
    // 2. Check leagues and teams
    const leagues = await League.find().populate('country');
    const teams = await Team.find();
    
    console.log(`Total leagues: ${leagues.length}`);
    console.log(`Total teams: ${teams.length}`);
    
    if (leagues.length === 0) {
      console.log('\n⚠️ No leagues found. Creating a sample league...');
      
      // Create a country if none exists
      const Country = require('./models/Country');
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
    
    // Create teams if needed
    if (teams.length < 6) {
      console.log('\n⚠️ Not enough teams found. Creating sample teams...');
      
      const league = leagues[0];
      
      // Delete existing teams for this league
      await Team.deleteMany({ league: league._id });
      
      const newTeams = [
        { name: 'Team A', shortName: 'TMA', league: league._id, country: league.country._id },
        { name: 'Team B', shortName: 'TMB', league: league._id, country: league.country._id },
        { name: 'Team C', shortName: 'TMC', league: league._id, country: league.country._id },
        { name: 'Team D', shortName: 'TMD', league: league._id, country: league.country._id },
        { name: 'Team E', shortName: 'TME', league: league._id, country: league.country._id },
        { name: 'Team F', shortName: 'TMF', league: league._id, country: league.country._id },
      ];
      
      await Team.insertMany(newTeams);
      console.log('Created sample teams');
      
      // Refresh teams
      teams.length = 0;
      teams.push(...await Team.find({ league: league._id }));
    }
    
    // 3. Create matches if none exist
    if (matchCount === 0) {
      console.log('\n⚠️ No matches found. Creating sample matches...');
      
      const league = leagues[0];
      
      // Create dates for yesterday, today, and tomorrow
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      // Create matches
      const matches = [];
      
      // Yesterday matches (ended)
      for (let i = 0; i < 3; i++) {
        const homeTeam = teams[i * 2 % teams.length];
        const awayTeam = teams[(i * 2 + 1) % teams.length];
        
        const matchDate = new Date(yesterday);
        matchDate.setHours(12 + i * 3, 0, 0, 0);
        
        const homeScore = Math.floor(Math.random() * 4);
        const awayScore = Math.floor(Math.random() * 3);
        
        matches.push({
          homeTeam: homeTeam._id,
          awayTeam: awayTeam._id,
          league: league._id,
          matchDate,
          venue: `${homeTeam.name} Stadium`,
          status: 'ended',
          homeScore,
          awayScore,
          currentMinute: 90,
          events: [],
          season: '2023-2024'
        });
      }
      
      // Today matches (mix of statuses)
      const todayStatuses = ['ended', 'live', 'not_started'];
      for (let i = 0; i < 3; i++) {
        const homeTeam = teams[(i * 2 + 2) % teams.length];
        const awayTeam = teams[(i * 2 + 3) % teams.length];
        
        const matchDate = new Date(today);
        matchDate.setHours(12 + i * 3, 0, 0, 0);
        
        const status = todayStatuses[i];
        const currentMinute = status === 'ended' ? 90 : (status === 'live' ? 65 : 0);
        const homeScore = status !== 'not_started' ? Math.floor(Math.random() * 4) : 0;
        const awayScore = status !== 'not_started' ? Math.floor(Math.random() * 3) : 0;
        
        matches.push({
          homeTeam: homeTeam._id,
          awayTeam: awayTeam._id,
          league: league._id,
          matchDate,
          venue: `${homeTeam.name} Stadium`,
          status,
          homeScore,
          awayScore,
          currentMinute,
          events: [],
          season: '2023-2024'
        });
      }
      
      // Tomorrow matches (not started)
      for (let i = 0; i < 3; i++) {
        const homeTeam = teams[(i * 2 + 4) % teams.length];
        const awayTeam = teams[(i * 2 + 5) % teams.length];
        
        const matchDate = new Date(tomorrow);
        matchDate.setHours(12 + i * 3, 0, 0, 0);
        
        matches.push({
          homeTeam: homeTeam._id,
          awayTeam: awayTeam._id,
          league: league._id,
          matchDate,
          venue: `${homeTeam.name} Stadium`,
          status: 'not_started',
          homeScore: 0,
          awayScore: 0,
          currentMinute: 0,
          events: [],
          season: '2023-2024'
        });
      }
      
      // Save all matches
      await Match.insertMany(matches);
      console.log(`Created ${matches.length} sample matches`);
    }
    
    // 4. Verify matches were created
    const updatedMatchCount = await Match.countDocuments();
    console.log(`\nTotal matches after fix: ${updatedMatchCount}`);
    
    // 5. Check matches by day
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    const todayMatches = await Match.find({
      matchDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).populate('homeTeam').populate('awayTeam');
    
    console.log(`\nToday's matches: ${todayMatches.length}`);
    if (todayMatches.length > 0) {
      todayMatches.forEach((match, i) => {
        console.log(`${i+1}. ${match.homeTeam?.name || 'Unknown'} vs ${match.awayTeam?.name || 'Unknown'} (${match.matchDate.toLocaleTimeString()})`);
      });
    }
    
    console.log('\n=== FIX COMPLETED ===');
    console.log('Please restart your server to see the changes.');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing matches:', error);
    process.exit(1);
  }
};

// Run the fix
fixMatches();