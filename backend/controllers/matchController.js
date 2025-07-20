const Match = require('../models/Match');

// Get all matches
exports.getAllMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('homeTeam', 'name shortName logo')
      .populate('awayTeam', 'name shortName logo')
      .populate('league', 'name')
      .sort({ matchDate: -1 });
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get live matches
exports.getLiveMatches = async (req, res) => {
  try {
    const matches = await Match.find({ status: { $in: ['live', 'halftime'] } })
      .populate('homeTeam', 'name shortName logo')
      .populate('awayTeam', 'name shortName logo')
      .populate({
        path: 'league',
        select: 'name',
        populate: {
          path: 'country',
          select: 'name flag'
        }
      })
      .sort({ matchDate: 1 });
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get matches by date range
exports.getMatchesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {
      matchDate: {}
    };
    
    if (startDate) {
      query.matchDate.$gte = new Date(startDate);
    }
    
    if (endDate) {
      query.matchDate.$lte = new Date(endDate);
    }
    
    const matches = await Match.find(query)
      .populate('homeTeam', 'name shortName logo')
      .populate('awayTeam', 'name shortName logo')
      .populate({
        path: 'league',
        select: 'name',
        populate: {
          path: 'country',
          select: 'name flag'
        }
      })
      .sort({ matchDate: 1 });
    
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get matches by league
exports.getMatchesByLeague = async (req, res) => {
  try {
    const matches = await Match.find({ league: req.params.leagueId })
      .populate('homeTeam', 'name shortName logo')
      .populate('awayTeam', 'name shortName logo')
      .populate('league', 'name')
      .sort({ matchDate: -1 });
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get matches by team
exports.getMatchesByTeam = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const matches = await Match.find({
      $or: [{ homeTeam: teamId }, { awayTeam: teamId }]
    })
      .populate('homeTeam', 'name shortName logo')
      .populate('awayTeam', 'name shortName logo')
      .populate('league', 'name')
      .sort({ matchDate: -1 });
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get match by ID
exports.getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('homeTeam', 'name shortName logo')
      .populate('awayTeam', 'name shortName logo')
      .populate({
        path: 'league',
        select: 'name',
        populate: {
          path: 'country',
          select: 'name flag'
        }
      })
      .populate('events.team', 'name shortName');
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new match
exports.createMatch = async (req, res) => {
  try {
    const newMatch = new Match(req.body);
    const savedMatch = await newMatch.save();
    const populatedMatch = await Match.findById(savedMatch._id)
      .populate('homeTeam', 'name shortName logo')
      .populate('awayTeam', 'name shortName logo')
      .populate('league', 'name');
    res.status(201).json(populatedMatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update match
exports.updateMatch = async (req, res) => {
  try {
    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('homeTeam', 'name shortName logo')
      .populate('awayTeam', 'name shortName logo')
      .populate('league', 'name');
    
    if (!updatedMatch) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.status(200).json(updatedMatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add event to match
exports.addMatchEvent = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Add the new event
    match.events.push(req.body);
    
    // Update score if it's a goal
    if (req.body.type === 'goal') {
      const scoringTeam = req.body.team.toString();
      
      if (scoringTeam === match.homeTeam.toString()) {
        match.homeScore += 1;
      } else if (scoringTeam === match.awayTeam.toString()) {
        match.awayScore += 1;
      }
    }
    
    await match.save();
    
    const updatedMatch = await Match.findById(req.params.id)
      .populate('homeTeam', 'name shortName logo')
      .populate('awayTeam', 'name shortName logo')
      .populate('league', 'name')
      .populate('events.team', 'name shortName');
    
    res.status(200).json(updatedMatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update match status
exports.updateMatchStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['not_started', 'live', 'halftime', 'ended', 'postponed', 'canceled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid match status' });
    }
    
    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('homeTeam', 'name shortName logo')
      .populate('awayTeam', 'name shortName logo')
      .populate('league', 'name');
    
    if (!updatedMatch) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.status(200).json(updatedMatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete match
exports.deleteMatch = async (req, res) => {
  try {
    const deletedMatch = await Match.findByIdAndDelete(req.params.id);
    if (!deletedMatch) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.status(200).json({ message: 'Match deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};