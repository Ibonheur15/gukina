const League = require('../models/League');

// Get all leagues
exports.getAllLeagues = async (req, res) => {
  try {
    const leagues = await League.find()
      .populate('country', 'name code flag')
      .sort({ name: 1 });
    res.status(200).json(leagues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get leagues by country
exports.getLeaguesByCountry = async (req, res) => {
  try {
    const leagues = await League.find({ country: req.params.countryId })
      .populate('country', 'name code flag')
      .sort({ name: 1 });
    res.status(200).json(leagues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get league by ID
exports.getLeagueById = async (req, res) => {
  try {
    const league = await League.findById(req.params.id)
      .populate('country', 'name code flag');
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    res.status(200).json(league);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new league
exports.createLeague = async (req, res) => {
  try {
    const newLeague = new League(req.body);
    const savedLeague = await newLeague.save();
    const populatedLeague = await League.findById(savedLeague._id)
      .populate('country', 'name code flag');
    res.status(201).json(populatedLeague);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update league
exports.updateLeague = async (req, res) => {
  try {
    const updatedLeague = await League.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('country', 'name code flag');
    
    if (!updatedLeague) {
      return res.status(404).json({ message: 'League not found' });
    }
    res.status(200).json(updatedLeague);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete league
exports.deleteLeague = async (req, res) => {
  try {
    const deletedLeague = await League.findByIdAndDelete(req.params.id);
    if (!deletedLeague) {
      return res.status(404).json({ message: 'League not found' });
    }
    res.status(200).json({ message: 'League deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};