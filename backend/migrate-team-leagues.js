require('dotenv').config();
const mongoose = require('mongoose');
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

// Migrate teams to use leagues array
const migrateTeamLeagues = async () => {
  try {
    console.log('=== MIGRATING TEAM LEAGUES ===\n');
    
    // Find all teams
    const teams = await Team.find();
    console.log(`Found ${teams.length} teams`);
    
    let migratedCount = 0;
    
    // Update each team
    for (const team of teams) {
      // If team has a league but no leagues array
      if (team.league && (!team.leagues || team.leagues.length === 0)) {
        team.leagues = [team.league];
        await team.save();
        migratedCount++;
      }
      // If team has leagues array but no league
      else if (team.leagues && team.leagues.length > 0 && !team.league) {
        team.league = team.leagues[0];
        await team.save();
        migratedCount++;
      }
    }
    
    console.log(`\nMigrated ${migratedCount} teams`);
    console.log('\n=== MIGRATION COMPLETED ===');
    process.exit(0);
  } catch (error) {
    console.error('Error migrating team leagues:', error);
    process.exit(1);
  }
};

// Run the migration
migrateTeamLeagues();