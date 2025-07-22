require('dotenv').config();
const mongoose = require('mongoose');

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

// Check team leagues
const checkTeamLeagues = async () => {
  try {
    console.log('=== CHECKING TEAM LEAGUES ===\n');
    
    // Get models
    const League = require('./models/League');
    const Team = require('./models/Team');
    
    // 1. Get all leagues
    const leagues = await League.find().populate('country', 'name');
    console.log(`Found ${leagues.length} leagues`);
    
    if (leagues.length === 0) {
      console.log('No leagues found. Please create leagues first.');
      process.exit(1);
    }
    
    // 2. Get all teams
    const teams = await Team.find().populate('league', 'name').populate('country', 'name');
    console.log(`Found ${teams.length} teams total`);
    
    if (teams.length === 0) {
      console.log('No teams found. Please create teams first.');
      process.exit(1);
    }
    
    // 3. Check teams with no league
    const teamsWithNoLeague = teams.filter(team => !team.league);
    console.log(`Teams with no league: ${teamsWithNoLeague.length}`);
    
    if (teamsWithNoLeague.length > 0) {
      console.log('\nTeams with no league:');
      teamsWithNoLeague.forEach((team, i) => {
        console.log(`${i+1}. ${team.name} (${team.country?.name || 'Unknown country'})`);
      });
      
      // Assign these teams to leagues
      console.log('\nAssigning teams to leagues...');
      
      for (const team of teamsWithNoLeague) {
        // Find a league in the same country
        const leagueInSameCountry = leagues.find(league => 
          league.country && team.country && 
          league.country._id.toString() === team.country._id.toString()
        );
        
        if (leagueInSameCountry) {
          team.league = leagueInSameCountry._id;
          await team.save();
          console.log(`Assigned ${team.name} to ${leagueInSameCountry.name}`);
        } else if (leagues.length > 0) {
          // Assign to first league if no matching country
          team.league = leagues[0]._id;
          await team.save();
          console.log(`Assigned ${team.name} to ${leagues[0].name} (no matching country)`);
        }
      }
    }
    
    // 4. Check teams per league
    console.log('\nTeams per league:');
    for (const league of leagues) {
      const teamsInLeague = teams.filter(team => 
        team.league && team.league._id.toString() === league._id.toString()
      );
      
      console.log(`- ${league.name}: ${teamsInLeague.length} teams`);
      
      if (teamsInLeague.length === 0) {
        console.log(`  No teams in ${league.name}. Assigning some teams...`);
        
        // Assign some teams to this league
        const teamsToAssign = teams.slice(0, 4); // Take first 4 teams
        
        for (const team of teamsToAssign) {
          team.league = league._id;
          await team.save();
          console.log(`  Assigned ${team.name} to ${league.name}`);
        }
      }
    }
    
    // 5. Create standings for all teams in all leagues
    console.log('\nCreating standings for all teams in all leagues...');
    
    const LeagueStanding = require('./models/LeagueStanding');
    
    // Clear existing standings
    await LeagueStanding.deleteMany({});
    console.log('Cleared all existing standings');
    
    // Current season
    const currentSeason = new Date().getFullYear().toString();
    
    // Refresh teams after updates
    const updatedTeams = await Team.find().populate('league', 'name');
    
    // Create standings for each league
    for (const league of leagues) {
      const teamsInLeague = updatedTeams.filter(team => 
        team.league && team.league._id.toString() === league._id.toString()
      );
      
      console.log(`Creating standings for ${league.name} (${teamsInLeague.length} teams)...`);
      
      if (teamsInLeague.length === 0) {
        continue;
      }
      
      // Create standings for all teams in this league
      const standings = [];
      
      for (let i = 0; i < teamsInLeague.length; i++) {
        const team = teamsInLeague[i];
        
        // Generate some realistic data
        const played = 10;
        const won = Math.floor(Math.random() * (played + 1));
        const drawn = Math.floor(Math.random() * (played - won + 1));
        const lost = played - won - drawn;
        const goalsFor = won * 2 + drawn;
        const goalsAgainst = lost * 2 + drawn;
        const points = won * 3 + drawn;
        
        // Generate form
        const form = [];
        for (let j = 0; j < Math.min(5, played); j++) {
          const rand = Math.random();
          if (rand < 0.5) form.push('W');
          else if (rand < 0.8) form.push('D');
          else form.push('L');
        }
        
        standings.push(new LeagueStanding({
          league: league._id,
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
        }));
      }
      
      // Sort by points
      standings.sort((a, b) => b.points - a.points);
      
      // Update positions
      for (let i = 0; i < standings.length; i++) {
        standings[i].position = i + 1;
      }
      
      // Save all standings
      for (const standing of standings) {
        try {
          await standing.save();
        } catch (err) {
          console.error(`Error saving standing for team ${standing.team}:`, err.message);
        }
      }
      
      console.log(`Created ${standings.length} standings for league ${league.name}`);
    }
    
    // 6. Verify standings were created
    const finalCount = await LeagueStanding.countDocuments();
    console.log(`\nTotal standings created: ${finalCount}`);
    
    console.log('\n=== CHECK COMPLETED ===');
    console.log('Please restart your server and refresh your frontend.');
    process.exit(0);
  } catch (error) {
    console.error('Error checking team leagues:', error);
    process.exit(1);
  }
};

// Run the check
checkTeamLeagues();