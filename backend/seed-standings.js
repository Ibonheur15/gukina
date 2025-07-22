const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const League = require('./models/League');
const Team = require('./models/Team');
const LeagueStanding = require('./models/LeagueStanding');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gukina', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected for seeding'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Seed standings for a league
const seedStandings = async (leagueId) => {
  try {
    // Get the league
    const league = await League.findById(leagueId);
    if (!league) {
      console.log(`League with ID ${leagueId} not found`);
      return;
    }
    
    console.log(`Seeding standings for league: ${league.name}`);
    
    // Get teams in this league
    const teams = await Team.find({ league: leagueId });
    if (teams.length === 0) {
      console.log(`No teams found for league: ${league.name}`);
      return;
    }
    
    console.log(`Found ${teams.length} teams`);
    
    // Current season
    const currentSeason = new Date().getFullYear().toString();
    
    // Delete existing standings for this league and season
    await LeagueStanding.deleteMany({ league: leagueId, season: currentSeason });
    
    // Create random standings for each team
    const standings = [];
    
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      
      // Generate random stats
      const played = Math.floor(Math.random() * 20) + 10; // 10-30 games
      const won = Math.floor(Math.random() * played);
      const drawn = Math.floor(Math.random() * (played - won));
      const lost = played - won - drawn;
      const goalsFor = won * 2 + drawn;
      const goalsAgainst = lost * 2 + drawn;
      const points = won * 3 + drawn;
      
      // Generate random form (last 5 matches)
      const formOptions = ['W', 'D', 'L'];
      const form = [];
      for (let j = 0; j < 5; j++) {
        form.push(formOptions[Math.floor(Math.random() * formOptions.length)]);
      }
      
      standings.push({
        league: leagueId,
        team: team._id,
        season: currentSeason,
        position: i + 1,
        played,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        points,
        form,
        lastUpdated: new Date()
      });
    }
    
    // Sort by points (desc), goal difference (desc), goals for (desc)
    standings.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      const aDiff = a.goalsFor - a.goalsAgainst;
      const bDiff = b.goalsFor - b.goalsAgainst;
      if (aDiff !== bDiff) return bDiff - aDiff;
      return b.goalsFor - a.goalsFor;
    });
    
    // Update positions
    for (let i = 0; i < standings.length; i++) {
      standings[i].position = i + 1;
    }
    
    // Save to database
    await LeagueStanding.insertMany(standings);
    
    console.log(`Created ${standings.length} standings for league: ${league.name}`);
  } catch (error) {
    console.error('Error seeding standings:', error);
  }
};

// Main function
const main = async () => {
  try {
    // Get all leagues
    const leagues = await League.find();
    
    if (leagues.length === 0) {
      console.log('No leagues found');
      process.exit(0);
    }
    
    // Seed standings for each league
    for (const league of leagues) {
      await seedStandings(league._id);
    }
    
    console.log('Standings seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
};

// Run the main function
main();