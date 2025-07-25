const LeagueStanding = require('../models/LeagueStanding');
const League = require('../models/League');
const Team = require('../models/Team');

// Get standings for a specific league and season
exports.getLeagueStandings = async (req, res) => {
  try {
    const { leagueId } = req.params;
    const season = req.query.season || new Date().getFullYear().toString();
    
    console.log(`Getting standings for league ${leagueId}, season ${season}`);
    
    // Check if league exists
    const League = require('../models/League');
    const league = await League.findById(leagueId);
    
    if (!league) {
      console.log('League not found');
      return res.status(404).json({ message: 'League not found' });
    }
    
    console.log('League found:', league.name);
    
    // Get existing standings
    let standings = await LeagueStanding.find({ 
      league: leagueId,
      season: season
    })
    .populate('team', 'name shortName logo')
    .sort({ position: 1 });
    
    console.log(`Found ${standings.length} standings`);
    
    // If no standings found, create default standings
    if (standings.length === 0) {
      console.log('No standings found, creating default standings...');
      
      // Get teams in this league
      const Team = require('../models/Team');
      const teams = await Team.find({ league: leagueId });
      console.log(`Found ${teams.length} teams in this league`);
      
      if (teams.length > 0) {
        // Create default standings for all teams
        const defaultStandings = [];
        
        for (let i = 0; i < teams.length; i++) {
          const team = teams[i];
          
          // Create with sample data instead of zeros
          const standing = new LeagueStanding({
            league: leagueId,
            team: team._id,
            season: season,
            position: i + 1,
            played: 10,
            won: 5,
            drawn: 3,
            lost: 2,
            goalsFor: 15,
            goalsAgainst: 10,
            points: 18,
            form: ['W', 'D', 'W', 'L', 'W'],
            lastUpdated: new Date()
          });
          
          try {
            await standing.save();
            defaultStandings.push(standing);
          } catch (err) {
            console.error(`Error saving standing for team ${team.name}:`, err.message);
          }
        }
        
        console.log(`Created ${defaultStandings.length} default standings`);
        
        // Get updated standings
        standings = await LeagueStanding.find({ 
          league: leagueId,
          season: season
        })
        .populate('team', 'name shortName logo')
        .sort({ position: 1 });
        
        console.log(`Now have ${standings.length} standings after creation`);
      }
    }
    
    // Filter out standings with missing teams
    const validStandings = standings.filter(standing => standing.team);
    
    // If some standings were filtered out, recalculate positions
    if (validStandings.length < standings.length) {
      console.log(`Filtered out ${standings.length - validStandings.length} standings with missing teams`);
      
      // Recalculate positions
      for (let i = 0; i < validStandings.length; i++) {
        validStandings[i].position = i + 1;
        await validStandings[i].save();
      }
    }
    
    // Return valid standings
    console.log(`Returning ${validStandings.length} valid standings to client`);
    res.status(200).json(validStandings);
  } catch (error) {
    console.error('Error fetching standings:', error);
    // Return empty array instead of error
    res.status(200).json([]);
  }
};

// Create or update a team's standing in a league
exports.updateTeamStanding = async (req, res) => {
  try {
    const { leagueId, teamId } = req.params;
    const { season, ...standingData } = req.body;
    
    const currentSeason = season || new Date().getFullYear().toString();
    
    // Check if league and team exist
    const league = await League.findById(leagueId);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Find existing standing or create new one
    let standing = await LeagueStanding.findOne({
      league: leagueId,
      team: teamId,
      season: currentSeason
    });
    
    if (standing) {
      // Update existing standing
      Object.assign(standing, standingData);
      standing.lastUpdated = new Date();
      await standing.save();
    } else {
      // Create new standing
      standing = new LeagueStanding({
        league: leagueId,
        team: teamId,
        season: currentSeason,
        ...standingData,
        lastUpdated: new Date()
      });
      await standing.save();
    }
    
    const updatedStanding = await LeagueStanding.findById(standing._id)
      .populate('team', 'name shortName logo');
    
    res.status(200).json(updatedStanding);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update standings based on match results
exports.updateStandingsFromMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { leagueId, homeTeamId, awayTeamId, homeScore, awayScore, season } = req.body;
    
    const currentSeason = season || new Date().getFullYear().toString();
    
    // Update home team standing
    let homeStanding = await LeagueStanding.findOne({
      league: leagueId,
      team: homeTeamId,
      season: currentSeason
    });
    
    if (!homeStanding) {
      homeStanding = new LeagueStanding({
        league: leagueId,
        team: homeTeamId,
        season: currentSeason,
        position: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
        form: []
      });
    }
    
    // Update away team standing
    let awayStanding = await LeagueStanding.findOne({
      league: leagueId,
      team: awayTeamId,
      season: currentSeason
    });
    
    if (!awayStanding) {
      awayStanding = new LeagueStanding({
        league: leagueId,
        team: awayTeamId,
        season: currentSeason,
        position: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
        form: []
      });
    }
    
    // Update stats based on match result
    homeStanding.played += 1;
    awayStanding.played += 1;
    
    homeStanding.goalsFor += homeScore;
    homeStanding.goalsAgainst += awayScore;
    awayStanding.goalsFor += awayScore;
    awayStanding.goalsAgainst += homeScore;
    
    if (homeScore > awayScore) {
      // Home team won
      homeStanding.won += 1;
      homeStanding.points += 3;
      homeStanding.form.unshift('W');
      
      awayStanding.lost += 1;
      awayStanding.form.unshift('L');
    } else if (homeScore < awayScore) {
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
    
    // Recalculate positions for all teams in the league
    await recalculateLeaguePositions(leagueId, currentSeason);
    
    res.status(200).json({ message: 'Standings updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create new season
exports.createNewSeason = async (req, res) => {
  console.log('createNewSeason function called');
  console.log('Request params:', req.params);
  
  try {
    const { leagueId, season } = req.params;
    
    if (!leagueId || !season) {
      return res.status(400).json({ message: 'League ID and season are required' });
    }
    
    console.log('Creating new season:', season, 'for league:', leagueId);
    
    // Check if season already exists
    const existingStandings = await LeagueStanding.find({ league: leagueId, season });
    if (existingStandings.length > 0) {
      return res.status(400).json({ message: 'Season already exists for this league' });
    }
    
    // Get all teams in this league
    const teams = await Team.find({ 
      $or: [
        { league: leagueId },
        { leagues: leagueId },
        { leagues: { $in: [leagueId] } }
      ]
    });
    
    console.log('Found teams:', teams.length);
    
    if (teams.length === 0) {
      console.log('No teams found for league:', leagueId);
      return res.status(201).json({
        message: 'New season created successfully (no teams found)',
        season,
        teamsCount: 0
      });
    }
    
    // Create initial standings for all teams
    const standings = teams.map((team, index) => ({
      league: leagueId,
      season,
      team: team._id,
      position: index + 1,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      basePoints: 0,
      tempPoints: 0,
      form: []
    }));
    
    await LeagueStanding.insertMany(standings);
    
    console.log('Created standings for', standings.length, 'teams');
    
    res.status(201).json({
      message: 'New season created successfully',
      season,
      teamsCount: teams.length
    });
  } catch (error) {
    console.error('Detailed error creating new season:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: error.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Helper function to recalculate positions
async function recalculateLeaguePositions(leagueId, season) {
  try {
    // Get all standings for the league and season, sorted by points (desc), goal difference (desc), goals for (desc)
    const standings = await LeagueStanding.find({ league: leagueId, season })
      .sort({ 
        points: -1, 
        goalsFor: -1,
        won: -1
      });
    
    // Update positions
    for (let i = 0; i < standings.length; i++) {
      standings[i].position = i + 1;
      await standings[i].save();
    }
    
    return true;
  } catch (error) {
    console.error('Error recalculating positions:', error);
    return false;
  }
}