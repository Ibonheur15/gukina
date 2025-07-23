require('dotenv').config();
const mongoose = require('mongoose');
const Country = require('./models/Country');
const League = require('./models/League');
const Team = require('./models/Team');
const Match = require('./models/Match');
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

// Fix all data issues
const fixAll = async () => {
  try {
    console.log('=== STARTING COMPREHENSIVE DATA FIX ===\n');
    
    // Step 1: Check and create countries if needed
    console.log('Step 1: Checking countries...');
    let countries = await Country.find();
    
    if (countries.length === 0) {
      console.log('No countries found. Creating sample countries...');
      
      const sampleCountries = [
        {
          name: 'Rwanda',
          code: 'RW',
          flag: 'https://flagcdn.com/w320/rw.png'
        },
        {
          name: 'Kenya',
          code: 'KE',
          flag: 'https://flagcdn.com/w320/ke.png'
        },
        {
          name: 'Uganda',
          code: 'UG',
          flag: 'https://flagcdn.com/w320/ug.png'
        }
      ];
      
      await Country.insertMany(sampleCountries);
      console.log(`Created ${sampleCountries.length} sample countries`);
      countries = await Country.find();
    }
    console.log(`Total countries: ${countries.length}`);
    
    // Step 2: Check and create leagues if needed
    console.log('\nStep 2: Checking leagues...');
    let leagues = await League.find();
    
    if (leagues.length === 0) {
      console.log('No leagues found. Creating sample leagues...');
      
      const sampleLeagues = [];
      
      for (const country of countries) {
        sampleLeagues.push({
          name: `${country.name} Premier League`,
          country: country._id,
          season: '2023-2024',
          priority: 10,
          active: true
        });
      }
      
      await League.insertMany(sampleLeagues);
      console.log(`Created ${sampleLeagues.length} sample leagues`);
      leagues = await League.find();
    }
    console.log(`Total leagues: ${leagues.length}`);
    
    // Step 3: Check and fix teams
    console.log('\nStep 3: Checking teams...');
    let teams = await Team.find();
    
    // Fix teams without leagues
    const teamsWithoutLeague = await Team.find({ 
      $or: [
        { league: { $exists: false } },
        { league: null }
      ]
    });
    
    console.log(`Found ${teamsWithoutLeague.length} teams without league`);
    
    if (teamsWithoutLeague.length > 0) {
      for (const team of teamsWithoutLeague) {
        // Assign to first league
        team.league = leagues[0]._id;
        
        // If team doesn't have a country, assign the league's country
        if (!team.country) {
          const league = await League.findById(leagues[0]._id).populate('country');
          team.country = league.country._id;
        }
        
        await team.save();
      }
      console.log(`Fixed ${teamsWithoutLeague.length} teams by assigning them to leagues`);
    }
    
    // Create teams if needed
    if (teams.length < 6) {
      console.log('Not enough teams found. Creating sample teams...');
      
      const sampleTeams = [];
      
      for (const league of leagues) {
        const teamCount = await Team.countDocuments({ league: league._id });
        
        if (teamCount < 6) {
          const country = await Country.findById(league.country);
          
          for (let i = 1; i <= 6; i++) {
            sampleTeams.push({
              name: `${country.name} Team ${i}`,
              shortName: `${country.code}${i}`,
              league: league._id,
              country: country._id
            });
          }
        }
      }
      
      if (sampleTeams.length > 0) {
        await Team.insertMany(sampleTeams);
        console.log(`Created ${sampleTeams.length} sample teams`);
      }
    }
    
    teams = await Team.find();
    console.log(`Total teams: ${teams.length}`);
    
    // Step 4: Check and fix matches
    console.log('\nStep 4: Checking matches...');
    let matches = await Match.find();
    
    // Fix matches without season
    const matchesWithoutSeason = await Match.find({ season: { $exists: false } });
    console.log(`Found ${matchesWithoutSeason.length} matches without season`);
    
    if (matchesWithoutSeason.length > 0) {
      for (const match of matchesWithoutSeason) {
        const matchDate = new Date(match.matchDate);
        const season = matchDate.getFullYear().toString();
        
        match.season = season;
        await match.save();
      }
      console.log(`Fixed ${matchesWithoutSeason.length} matches by adding season`);
    }
    
    // Create matches if needed
    if (matches.length === 0) {
      console.log('No matches found. Creating sample matches...');
      
      const sampleMatches = [];
      
      for (const league of leagues) {
        const leagueTeams = await Team.find({ league: league._id });
        
        if (leagueTeams.length >= 6) {
          // Create dates for yesterday, today, and tomorrow
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          
          // Yesterday matches (ended)
          for (let i = 0; i < 3; i++) {
            const homeTeam = leagueTeams[i * 2 % leagueTeams.length];
            const awayTeam = leagueTeams[(i * 2 + 1) % leagueTeams.length];
            
            const matchDate = new Date(yesterday);
            matchDate.setHours(12 + i * 3, 0, 0, 0);
            
            const homeScore = Math.floor(Math.random() * 4);
            const awayScore = Math.floor(Math.random() * 3);
            
            sampleMatches.push({
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
            const homeTeam = leagueTeams[(i * 2 + 2) % leagueTeams.length];
            const awayTeam = leagueTeams[(i * 2 + 3) % leagueTeams.length];
            
            const matchDate = new Date(today);
            matchDate.setHours(12 + i * 3, 0, 0, 0);
            
            const status = todayStatuses[i];
            const currentMinute = status === 'ended' ? 90 : (status === 'live' ? 65 : 0);
            const homeScore = status !== 'not_started' ? Math.floor(Math.random() * 4) : 0;
            const awayScore = status !== 'not_started' ? Math.floor(Math.random() * 3) : 0;
            
            sampleMatches.push({
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
            const homeTeam = leagueTeams[(i * 2 + 4) % leagueTeams.length];
            const awayTeam = leagueTeams[(i * 2 + 5) % leagueTeams.length];
            
            const matchDate = new Date(tomorrow);
            matchDate.setHours(12 + i * 3, 0, 0, 0);
            
            sampleMatches.push({
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
        }
      }
      
      if (sampleMatches.length > 0) {
        await Match.insertMany(sampleMatches);
        console.log(`Created ${sampleMatches.length} sample matches`);
      }
    }
    
    matches = await Match.find();
    console.log(`Total matches: ${matches.length}`);
    
    // Step 5: Clear and recreate standings
    console.log('\nStep 5: Clearing and recreating standings...');
    
    // Delete all existing standings
    const deleteResult = await LeagueStanding.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing standings`);
    
    // Create new standings for each league and team
    let totalStandingsCreated = 0;
    
    for (const league of leagues) {
      console.log(`Processing league: ${league.name}`);
      
      // Get teams for this league
      const leagueTeams = await Team.find({ league: league._id });
      console.log(`Found ${leagueTeams.length} teams in this league`);
      
      if (leagueTeams.length === 0) {
        console.log('No teams found for this league. Skipping...');
        continue;
      }
      
      // Get all available seasons for this league from matches
      let seasons = await Match.distinct('season', { league: league._id });
      
      // If no seasons found, use current year
      if (seasons.length === 0) {
        seasons = ['2023-2024'];
      }
      
      for (const season of seasons) {
        console.log(`Creating standings for season: ${season}`);
        
        // Create standings for each team
        const standings = [];
        
        leagueTeams.forEach((team, index) => {
          standings.push({
            league: league._id,
            season: season,
            team: team._id,
            position: index + 1,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0,
            form: [],
            lastUpdated: new Date()
          });
        });
        
        // Insert standings
        await LeagueStanding.insertMany(standings);
        console.log(`Created ${standings.length} standings for ${league.name} (${season})`);
        totalStandingsCreated += standings.length;
        
        // Update standings based on completed matches
        const completedMatches = await Match.find({
          league: league._id,
          season: season,
          status: 'ended'
        }).populate('homeTeam awayTeam');
        
        console.log(`Found ${completedMatches.length} completed matches for standings calculation`);
        
        if (completedMatches.length > 0) {
          for (const match of completedMatches) {
            // Update home team standing
            const homeStanding = await LeagueStanding.findOne({
              league: league._id,
              season: season,
              team: match.homeTeam._id
            });
            
            // Update away team standing
            const awayStanding = await LeagueStanding.findOne({
              league: league._id,
              season: season,
              team: match.awayTeam._id
            });
            
            if (homeStanding && awayStanding) {
              // Update matches played
              homeStanding.played += 1;
              awayStanding.played += 1;
              
              // Update goals
              homeStanding.goalsFor += match.homeScore || 0;
              homeStanding.goalsAgainst += match.awayScore || 0;
              awayStanding.goalsFor += match.awayScore || 0;
              awayStanding.goalsAgainst += match.homeScore || 0;
              
              // Update wins, draws, losses and points
              if (match.homeScore > match.awayScore) {
                // Home team won
                homeStanding.won += 1;
                homeStanding.points += 3;
                homeStanding.form.unshift('W');
                
                awayStanding.lost += 1;
                awayStanding.form.unshift('L');
              } else if (match.homeScore < match.awayScore) {
                // Away team won
                awayStanding.won += 1;
                awayStanding.points += 3;
                awayStanding.form.unshift('W');
                
                homeStanding.lost += 1;
                homeStanding.form.unshift('L');
              } else {
                // Draw
                homeStanding.drawn += 1;
                homeStanding.points += 1;
                homeStanding.form.unshift('D');
                
                awayStanding.drawn += 1;
                awayStanding.points += 1;
                awayStanding.form.unshift('D');
              }
              
              // Keep only last 5 form results
              homeStanding.form = homeStanding.form.slice(0, 5);
              awayStanding.form = awayStanding.form.slice(0, 5);
              
              // Save standings
              await homeStanding.save();
              await awayStanding.save();
            }
          }
          
          // Update positions based on points
          const leagueStandings = await LeagueStanding.find({
            league: league._id,
            season: season
          }).sort({ points: -1, goalsFor: -1, goalsAgainst: 1 });
          
          for (let i = 0; i < leagueStandings.length; i++) {
            leagueStandings[i].position = i + 1;
            await leagueStandings[i].save();
          }
          
          console.log(`Updated standings based on ${completedMatches.length} completed matches`);
        }
      }
    }
    
    console.log(`\nTotal standings created: ${totalStandingsCreated}`);
    
    console.log('\n=== COMPREHENSIVE FIX COMPLETED ===');
    console.log('Please restart your server to see the changes.');
    process.exit(0);
  } catch (error) {
    console.error('Error during comprehensive fix:', error);
    process.exit(1);
  }
};

// Run the fix
fixAll();