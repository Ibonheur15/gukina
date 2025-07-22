require('dotenv').config();
const mongoose = require('mongoose');
const Match = require('./models/Match');
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

// Generate standings from match data
const generateStandings = async () => {
  try {
    console.log('=== GENERATING LEAGUE STANDINGS ===\n');
    
    // Get all leagues
    const leagues = await League.find();
    console.log(`Found ${leagues.length} leagues`);
    
    if (leagues.length === 0) {
      console.log('No leagues found. Please run seed-leagues.js first.');
      process.exit(1);
    }
    
    // Process each league
    for (const league of leagues) {
      console.log(`\nProcessing league: ${league.name}`);
      
      // Get teams in this league
      const teams = await Team.find({ league: league._id });
      console.log(`Found ${teams.length} teams in this league`);
      
      if (teams.length === 0) {
        console.log('No teams found for this league. Skipping...');
        continue;
      }
      
      // Get current season
      const currentSeason = new Date().getFullYear().toString();
      
      // Delete existing standings for this league and season
      await LeagueStanding.deleteMany({ league: league._id, season: currentSeason });
      console.log('Deleted existing standings');
      
      // Create initial standings for all teams
      const initialStandings = [];
      
      for (const team of teams) {
        const standing = new LeagueStanding({
          league: league._id,
          team: team._id,
          season: currentSeason,
          position: 0,
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
        
        await standing.save();
        initialStandings.push(standing);
      }
      
      console.log(`Created initial standings for ${teams.length} teams`);
      
      // Get all completed matches for this league
      const matches = await Match.find({ 
        league: league._id,
        status: 'ended'
      });
      
      console.log(`Found ${matches.length} completed matches`);
      
      // Update standings based on match results
      if (matches.length > 0) {
        for (const match of matches) {
          // Update home team standing
          let homeStanding = await LeagueStanding.findOne({
            league: league._id,
            team: match.homeTeam,
            season: currentSeason
          });
          
          // Update away team standing
          let awayStanding = await LeagueStanding.findOne({
            league: league._id,
            team: match.awayTeam,
            season: currentSeason
          });
          
          if (homeStanding && awayStanding) {
            // Update stats based on match result
            homeStanding.played += 1;
            awayStanding.played += 1;
            
            homeStanding.goalsFor += match.homeScore;
            homeStanding.goalsAgainst += match.awayScore;
            awayStanding.goalsFor += match.awayScore;
            awayStanding.goalsAgainst += match.homeScore;
            
            if (match.homeScore > match.awayScore) {
              // Home team won
              homeStanding.won += 1;
              homeStanding.points += 3;
              homeStanding.form.unshift('W');
              
              awayStanding.lost += 1;
              awayStanding.form.unshift('L');
            } else if (match.homeScore < match.awayScore) {
              // Away team won
              homeStanding.lost += 1;
              homeStanding.form.unshift('L');
              
              awayStanding.won += 1;
              awayStanding.points += 3;
              awayStanding.form.unshift('W');
            } else {
              // Draw
              homeStanding.drawn += 1;
              homeStanding.points += 1;
              homeStanding.form.unshift('D');
              
              awayStanding.drawn += 1;
              awayStanding.points += 1;
              awayStanding.form.unshift('D');
            }
            
            // Keep only the last 5 form results
            homeStanding.form = homeStanding.form.slice(0, 5);
            awayStanding.form = awayStanding.form.slice(0, 5);
            
            homeStanding.lastUpdated = new Date();
            awayStanding.lastUpdated = new Date();
            
            await homeStanding.save();
            await awayStanding.save();
          }
        }
        
        // Recalculate positions
        const standings = await LeagueStanding.find({ 
          league: league._id, 
          season: currentSeason 
        }).sort({ 
          points: -1, 
          goalsFor: -1,
          won: -1
        });
        
        // Update positions
        for (let i = 0; i < standings.length; i++) {
          standings[i].position = i + 1;
          await standings[i].save();
        }
        
        console.log(`Updated standings with match results and recalculated positions`);
      }
    }
    
    console.log('\n=== STANDINGS GENERATION COMPLETED ===');
    process.exit(0);
  } catch (error) {
    console.error('Error generating standings:', error);
    process.exit(1);
  }
};

// Run the generator
generateStandings();