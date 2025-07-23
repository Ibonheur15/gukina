const Team = require('../models/Team');

// Get all teams
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('country', 'name code flag')
      .populate('league', 'name')
      .populate('leagues', 'name')
      .sort({ name: 1 });
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get popular teams
exports.getPopularTeams = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const teams = await Team.find()
      .populate('country', 'name code flag')
      .populate('league', 'name')
      .populate('leagues', 'name')
      .sort({ popularity: -1, name: 1 })
      .limit(limit);
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get teams by country
exports.getTeamsByCountry = async (req, res) => {
  try {
    const teams = await Team.find({ country: req.params.countryId })
      .populate('country', 'name code flag')
      .populate('league', 'name')
      .populate('leagues', 'name')
      .sort({ name: 1 });
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get teams by league
exports.getTeamsByLeague = async (req, res) => {
  try {
    // Find teams that have either the league field or the league in leagues array
    const teams = await Team.find({
      $or: [
        { league: req.params.leagueId },
        { leagues: req.params.leagueId }
      ]
    })
      .populate('country', 'name code flag')
      .populate('league', 'name')
      .populate('leagues', 'name')
      .sort({ name: 1 });
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get team by ID
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('country', 'name code flag')
      .populate('league', 'name')
      .populate('leagues', 'name');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new team
exports.createTeam = async (req, res) => {
  try {
    // If leagues array is provided, also set the first league as the primary league
    const teamData = { ...req.body };
    if (teamData.leagues && teamData.leagues.length > 0 && !teamData.league) {
      teamData.league = teamData.leagues[0];
    }
    
    const newTeam = new Team(teamData);
    const savedTeam = await newTeam.save();
    
    // Add team to standings tables
    const teamStandingManager = require('../services/teamStandingManager');
    await teamStandingManager.addTeamToStandings(savedTeam);
    
    const populatedTeam = await Team.findById(savedTeam._id)
      .populate('country', 'name code flag')
      .populate('league', 'name')
      .populate('leagues', 'name');
    
    res.status(201).json(populatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update team
exports.updateTeam = async (req, res) => {
  try {
    // If leagues array is provided, also set the first league as the primary league
    const teamData = { ...req.body };
    if (teamData.leagues && teamData.leagues.length > 0 && !teamData.league) {
      teamData.league = teamData.leagues[0];
    }
    
    // Get the original team to check if leagues have changed
    const originalTeam = await Team.findById(req.params.id);
    if (!originalTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      teamData,
      { new: true, runValidators: true }
    )
      .populate('country', 'name code flag')
      .populate('league', 'name')
      .populate('leagues', 'name');
    
    // Check if leagues have changed
    const leaguesChanged = (
      (teamData.league && originalTeam.league?.toString() !== teamData.league) ||
      (teamData.leagues && JSON.stringify(originalTeam.leagues?.map(l => l.toString()).sort()) !== 
        JSON.stringify(teamData.leagues.sort()))
    );
    
    // If leagues have changed, update standings
    if (leaguesChanged) {
      const teamStandingManager = require('../services/teamStandingManager');
      await teamStandingManager.addTeamToStandings(updatedTeam);
    }
    
    res.status(200).json(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete team
exports.deleteTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    
    // Find the team first to get its details
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Start a session for transaction
    const session = await Team.startSession();
    session.startTransaction();
    
    try {
      // Get the standings cleanup service
      const standingsCleanupService = require('../services/standingsCleanupService');
      
      // Clean up standings before deleting the team
      const cleanupResult = await standingsCleanupService.cleanupAfterTeamDeletion(teamId);
      
      // Delete the team
      await Team.findByIdAndDelete(teamId).session(session);
      
      // Delete matches involving this team
      const Match = require('../models/Match');
      await Match.deleteMany({
        $or: [
          { homeTeam: teamId },
          { awayTeam: teamId }
        ]
      }).session(session);
      
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      
      res.status(200).json({ 
        message: 'Team deleted successfully',
        details: 'Team has been removed from the database and standings have been updated.',
        standingsCleanup: cleanupResult.success ? 'Standings updated successfully' : 'Failed to update standings'
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: error.message });
  }
};