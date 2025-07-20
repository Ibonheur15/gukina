require('dotenv').config();
const mongoose = require('mongoose');
const Country = require('./models/Country');
const League = require('./models/League');
const Team = require('./models/Team');
const Match = require('./models/Match');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected for seeding'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function seedMatches() {
  try {
    console.log('Starting match seed...');
    
    // Get countries, or create if none exist
    let countries = await Country.find();
    if (countries.length === 0) {
      console.log('No countries found, creating sample countries...');
      const countriesData = [
        { name: 'Rwanda', code: 'RWA', region: 'East Africa', active: true },
        { name: 'Kenya', code: 'KEN', region: 'East Africa', active: true }
      ];
      countries = await Country.insertMany(countriesData);
    }
    
    // Get or create leagues
    let leagues = await League.find();
    if (leagues.length === 0) {
      console.log('No leagues found, creating sample leagues...');
      const leaguesData = [
        { 
          name: 'Rwanda Premier League', 
          country: countries[0]._id, 
          season: '2023-2024',
          active: true 
        },
        { 
          name: 'Kenya Premier League', 
          country: countries[1]._id, 
          season: '2023-2024',
          active: true 
        }
      ];
      leagues = await League.insertMany(leaguesData);
    }
    
    // Get or create teams
    let teams = await Team.find();
    if (teams.length === 0) {
      console.log('No teams found, creating sample teams...');
      const teamsData = [
        {
          name: 'APR FC',
          shortName: 'APR',
          country: countries[0]._id,
          leagues: [leagues[0]._id],
          active: true
        },
        {
          name: 'Rayon Sports',
          shortName: 'RAY',
          country: countries[0]._id,
          leagues: [leagues[0]._id],
          active: true
        },
        {
          name: 'Gor Mahia',
          shortName: 'GOR',
          country: countries[1]._id,
          leagues: [leagues[1]._id],
          active: true
        },
        {
          name: 'AFC Leopards',
          shortName: 'AFC',
          country: countries[1]._id,
          leagues: [leagues[1]._id],
          active: true
        }
      ];
      teams = await Team.insertMany(teamsData);
    }
    
    // Create matches
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Delete existing matches to avoid duplicates
    await Match.deleteMany({});
    
    const matchesData = [
      // Live match
      {
        homeTeam: teams[0]._id,
        awayTeam: teams[1]._id,
        league: leagues[0]._id,
        matchDate: new Date(),
        venue: 'Amahoro Stadium',
        status: 'live',
        homeScore: 2,
        awayScore: 1,
        events: [
          {
            type: 'goal',
            minute: 23,
            team: teams[0]._id,
            player: 'John Doe'
          },
          {
            type: 'goal',
            minute: 45,
            team: teams[0]._id,
            player: 'James Smith'
          },
          {
            type: 'goal',
            minute: 67,
            team: teams[1]._id,
            player: 'Robert Johnson'
          }
        ],
        round: 'Matchday 5',
        season: '2023-2024'
      },
      // Today's match (not started)
      {
        homeTeam: teams[2]._id,
        awayTeam: teams[3]._id,
        league: leagues[1]._id,
        matchDate: new Date(today.setHours(today.getHours() + 3)),
        venue: 'Nyayo Stadium',
        status: 'not_started',
        homeScore: 0,
        awayScore: 0,
        events: [],
        round: 'Matchday 7',
        season: '2023-2024'
      },
      // Yesterday's match (ended)
      {
        homeTeam: teams[1]._id,
        awayTeam: teams[0]._id,
        league: leagues[0]._id,
        matchDate: yesterday,
        venue: 'Amahoro Stadium',
        status: 'ended',
        homeScore: 0,
        awayScore: 3,
        events: [
          {
            type: 'goal',
            minute: 12,
            team: teams[0]._id,
            player: 'John Doe'
          },
          {
            type: 'yellow_card',
            minute: 34,
            team: teams[1]._id,
            player: 'Michael Brown'
          },
          {
            type: 'goal',
            minute: 56,
            team: teams[0]._id,
            player: 'James Smith'
          },
          {
            type: 'goal',
            minute: 78,
            team: teams[0]._id,
            player: 'John Doe'
          }
        ],
        round: 'Matchday 4',
        season: '2023-2024'
      },
      // Tomorrow's match
      {
        homeTeam: teams[3]._id,
        awayTeam: teams[2]._id,
        league: leagues[1]._id,
        matchDate: tomorrow,
        venue: 'Nyayo Stadium',
        status: 'not_started',
        homeScore: 0,
        awayScore: 0,
        events: [],
        round: 'Matchday 8',
        season: '2023-2024'
      }
    ];
    
    const matches = await Match.insertMany(matchesData);
    console.log(`Created ${matches.length} matches`);
    
    console.log('Match seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding matches:', error);
    process.exit(1);
  }
}

// Run the seed function
seedMatches();