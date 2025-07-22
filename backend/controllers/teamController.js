const Team = require('../models/Team');

// Get all teams
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('country', 'name code flag')
      .populate('league', 'name')
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
      .sort({ name: 1 });
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get teams by league
exports.getTeamsByLeague = async (req, res) => {
  try {
    const teams = await Team.find({ league: req.params.leagueId })
      .populate('country', 'name code flag')
      .populate('league', 'name')
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
      .populate('league', 'name');
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
    const newTeam = new Team(req.body);
    const savedTeam = await newTeam.save();
    const populatedTeam = await Team.findById(savedTeam._id)
      .populate('country', 'name code flag')
      .populate('league', 'name');
    res.status(201).json(populatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update team
exports.updateTeam = async (req, res) => {
  try {
    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('country', 'name code flag')
      .populate('league', 'name');
    
    if (!updatedTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.status(200).json(updatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete team
exports.deleteTeam = async (req, res) => {
  try {
    const deletedTeam = await Team.findByIdAndDelete(req.params.id);
    if (!deletedTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};