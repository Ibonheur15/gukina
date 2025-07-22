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
  .then(() => console.log('MongoDB connected for seeding'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Create matches for yesterday, today, and tomorrow
const seedMatches = async () => {
  try {
    // Get leagues with country information
    const leagues = await League.find().populate('country');
    if (leagues.length === 0) {
      console.log('No leagues found. Please run seed-leagues.js first.');
      process.exit(1);
    }
    
    const league = leagues[0];
    console.log(`Using league: ${league.name}`);
    
    // Check if league has a country
    if (!league.country) {
      console.log('League has no country. Please ensure leagues have countries assigned.');
      process.exit(1);
    }
    
    // Get or create teams
    let teams = await Team.find({ league: league._id });
    
    if (teams.length < 6) {
      console.log('Not enough teams found. Creating some teams...');
      
      // Delete any existing teams for this league to avoid conflicts
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
      console.log('Created test teams');
      
      // Refresh teams list
      teams = await Team.find({ league: league._id });
    }
    
    console.log(`Found ${teams.length} teams`);
    
    // Delete existing matches
    await Match.deleteMany({});
    console.log('Deleted existing matches');
    
    // Create dates for yesterday, today, and tomorrow
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Set match times
    const times = [
      { hours: 13, minutes: 0 },
      { hours: 15, minutes: 30 },
      { hours: 18, minutes: 0 },
      { hours: 20, minutes: 30 },
    ];
    
    const createMatchesForDate = (date, league, status) => {
      const matches = [];
      
      // Create 4 matches for this date
      for (let i = 0; i < 4 && i*2+1 < teams.length; i++) {
        const homeTeam = teams[i * 2];
        const awayTeam = teams[i * 2 + 1];
        
        const matchDate = new Date(date);
        matchDate.setHours(times[i].hours, times[i].minutes, 0, 0);
        
        let homeScore = 0;
        let awayScore = 0;
        
        // For yesterday's matches, set scores
        if (date.getDate() === yesterday.getDate()) {
          homeScore = Math.floor(Math.random() * 4);
          awayScore = Math.floor(Math.random() * 3);
        }
        
        matches.push({
          homeTeam: homeTeam._id,
          awayTeam: awayTeam._id,
          league: league._id,
          matchDate,
          venue: `${homeTeam.name} Stadium`,
          status: status || 'not_started',
          homeScore,
          awayScore,
          currentMinute: status === 'ended' ? 90 : (status === 'live' ? 65 : 0),
          events: [],
          season: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
        });
      }
      
      return matches;
    };
    
    // Create matches for yesterday (ended)
    const yesterdayMatches = createMatchesForDate(yesterday, league, 'ended');
    
    // Create matches for today (mix of not_started, live, and ended)
    const todayMatches = [
      ...createMatchesForDate(today, league, 'ended').slice(0, 1),
      ...createMatchesForDate(today, league, 'live').slice(0, 1),
      ...createMatchesForDate(today, league, 'not_started').slice(0, 2)
    ];
    
    // Create matches for tomorrow (not_started)
    const tomorrowMatches = createMatchesForDate(tomorrow, league, 'not_started');
    
    // Save all matches
    const allMatches = [...yesterdayMatches, ...todayMatches, ...tomorrowMatches];
    await Match.insertMany(allMatches);
    
    console.log(`Created ${allMatches.length} matches:`);
    console.log(`- ${yesterdayMatches.length} for yesterday`);
    console.log(`- ${todayMatches.length} for today`);
    console.log(`- ${tomorrowMatches.length} for tomorrow`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding matches:', error);
    process.exit(1);
  }
};

// Run the seeding
seedMatches();