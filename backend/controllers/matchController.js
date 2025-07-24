const Match = require('../models/Match');

// Get all matches
exports.getAllMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('homeTeam', 'name shortName logo')
      .populate('awayTeam', 'name shortName logo')
      .populate({
        path: 'league',
        select: 'name logo priority',
        options: { sort: { priority: -1 } }
      })
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
    const { startDate, endDate, day } = req.query;
    
    console.log('getMatchesByDateRange called with:', { startDate, endDate, day });
    
    const query = {
      matchDate: {}
    };
    
    // Handle day parameter (yesterday, today, tomorrow)
    if (day) {
      const now = new Date();
      let targetDate;
      
      if (day === 'yesterday') {
        targetDate = new Date(now);
        targetDate.setDate(now.getDate() - 1);
      } else if (day === 'today') {
        targetDate = now;
      } else if (day === 'tomorrow') {
        targetDate = new Date(now);
        targetDate.setDate(now.getDate() + 1);
      } else {
        return res.status(400).json({ message: 'Invalid day parameter' });
      }
      
      // Set start and end of the target day
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.matchDate = {
        $gte: startOfDay,
        $lte: endOfDay
      };
      
      console.log(`Fetching matches for ${day}:`, {
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString(),
        query: JSON.stringify(query)
      });
    } else {
      // Use explicit date range if provided
      if (startDate) {
        query.matchDate.$gte = new Date(startDate);
      }
      
      if (endDate) {
        query.matchDate.$lte = new Date(endDate);
      }
    }
    
    // Log the query before execution
    console.log('Final query:', JSON.stringify(query));
    
    const matches = await Match.find(query)
      .populate('homeTeam', 'name shortName logo')
      .populate('awayTeam', 'name shortName logo')
      .populate({
        path: 'league',
        select: 'name priority',
        populate: {
          path: 'country',
          select: 'name flag'
        }
      })
      .sort({ matchDate: 1 });
    
    console.log(`Found ${matches.length} matches for query`);
    
    // If no matches found and day parameter is provided, return sample data
    if (matches.length === 0 && day) {
      console.log('No matches found, checking if we need to seed data');
      
      // Check if we need to seed data
      const totalMatches = await Match.countDocuments();
      if (totalMatches === 0) {
        console.log('No matches in database, consider running fix-matches.js');
      }
    }
    
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
    // Check if home team and away team are the same
    if (req.body.homeTeam === req.body.awayTeam) {
      return res.status(400).json({ message: 'Home team and away team cannot be the same' });
    }
    
    const newMatch = new Match(req.body);
    const savedMatch = await newMatch.save();
    const populatedMatch = await Match.findById(savedMatch._id)
      .populate('homeTeam', 'name shortName logo')
      .populate('awayTeam', 'name shortName logo')
      .populate('league', 'name');
    
    // If match is created with ended status, update standings
    if (populatedMatch.status === 'ended') {
      // Import standings service
      const standingsService = require('../services/standingsService');
      
      // Update standings based on match result
      const standingsResult = await standingsService.updateStandingsFromMatch(populatedMatch);
      
      console.log('Standings updated for new match:', standingsResult.success ? 'Success' : 'Failed');
    }
    
    res.status(201).json(populatedMatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update match
exports.updateMatch = async (req, res) => {
  try {
    // Check if home team and away team are the same
    if (req.body.homeTeam && req.body.awayTeam && req.body.homeTeam === req.body.awayTeam) {
      return res.status(400).json({ message: 'Home team and away team cannot be the same' });
    }
    
    // Get the current match to check previous status
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // If only one team is being updated, check against the existing other team
    if (req.body.homeTeam && !req.body.awayTeam) {
      if (req.body.homeTeam === match.awayTeam.toString()) {
        return res.status(400).json({ message: 'Home team and away team cannot be the same' });
      }
    } else if (!req.body.homeTeam && req.body.awayTeam) {
      if (req.body.awayTeam === match.homeTeam.toString()) {
        return res.status(400).json({ message: 'Home team and away team cannot be the same' });
      }
    }
    
    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('homeTeam', 'name shortName logo')
      .populate('awayTeam', 'name shortName logo')
      .populate('league', 'name');
    
    // If match is now ended but wasn't before, update standings
    if (updatedMatch.status === 'ended' && match.status !== 'ended') {
      // Import standings service
      const standingsService = require('../services/standingsService');
      
      // Update standings based on match result
      const standingsResult = await standingsService.updateStandingsFromMatch(updatedMatch);
      
      console.log('Standings updated for updated match:', standingsResult.success ? 'Success' : 'Failed');
    }
    
    res.status(200).json(updatedMatch);
  } catch (error) {
    console.error('Error updating match:', error);
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
    
    // Update live standings if match is live
    if (['live', 'halftime'].includes(match.status)) {
      const liveStandingsService = require('../services/liveStandingsService');
      await liveStandingsService.updateLiveStandings(match._id, req.body);
    }
    
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

// Update match event
exports.updateMatchEvent = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    const eventId = req.params.eventId;
    const eventIndex = match.events.findIndex(e => e._id.toString() === eventId);
    
    if (eventIndex === -1) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const oldEvent = match.events[eventIndex];
    const newEvent = req.body;
    
    // Update score if event type changes to/from goal
    if (oldEvent.type === 'goal' && newEvent.type !== 'goal') {
      // Remove goal
      const scoringTeam = oldEvent.team.toString();
      if (scoringTeam === match.homeTeam.toString()) {
        match.homeScore = Math.max(0, match.homeScore - 1);
      } else if (scoringTeam === match.awayTeam.toString()) {
        match.awayScore = Math.max(0, match.awayScore - 1);
      }
    } else if (oldEvent.type !== 'goal' && newEvent.type === 'goal') {
      // Add goal
      const scoringTeam = newEvent.team.toString();
      if (scoringTeam === match.homeTeam.toString()) {
        match.homeScore += 1;
      } else if (scoringTeam === match.awayTeam.toString()) {
        match.awayScore += 1;
      }
    } else if (oldEvent.type === 'goal' && newEvent.type === 'goal' && 
               oldEvent.team.toString() !== newEvent.team.toString()) {
      // Goal team changed
      const oldTeam = oldEvent.team.toString();
      const newTeam = newEvent.team.toString();
      
      if (oldTeam === match.homeTeam.toString()) {
        match.homeScore = Math.max(0, match.homeScore - 1);
      } else if (oldTeam === match.awayTeam.toString()) {
        match.awayScore = Math.max(0, match.awayScore - 1);
      }
      
      if (newTeam === match.homeTeam.toString()) {
        match.homeScore += 1;
      } else if (newTeam === match.awayTeam.toString()) {
        match.awayScore += 1;
      }
    }
    
    // Update the event
    match.events[eventIndex] = { ...match.events[eventIndex].toObject(), ...newEvent };
    
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

// Delete match event
exports.deleteMatchEvent = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    const eventId = req.params.eventId;
    const eventIndex = match.events.findIndex(e => e._id.toString() === eventId);
    
    if (eventIndex === -1) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const event = match.events[eventIndex];
    
    // Update score if it's a goal
    if (event.type === 'goal') {
      const scoringTeam = event.team.toString();
      
      if (scoringTeam === match.homeTeam.toString()) {
        match.homeScore = Math.max(0, match.homeScore - 1);
      } else if (scoringTeam === match.awayTeam.toString()) {
        match.awayScore = Math.max(0, match.awayScore - 1);
      }
    }
    
    // Remove the event
    match.events.splice(eventIndex, 1);
    
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
    
    // Get the current match to check previous status
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Reset currentMinute to 0 when starting or to 45 when second half starts
    let updateData = { status };
    if (status === 'live') {
      // If coming from not_started, set to 1, if coming from halftime, set to 46
      if (match.status === 'not_started') {
        updateData.currentMinute = 1;
      } else if (match.status === 'halftime') {
        updateData.currentMinute = 46;
      }
    } else if (status === 'halftime') {
      updateData.currentMinute = 45;
    } else if (status === 'ended') {
      updateData.currentMinute = 90;
    }
    
    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('homeTeam', 'name shortName logo')
      .populate('awayTeam', 'name shortName logo')
      .populate('league', 'name');
    
    // If match is now ended, update standings
    if (status === 'ended' && match.status !== 'ended') {
      // Import standings service
      const standingsService = require('../services/standingsService');
      
      // Update standings based on match result
      const standingsResult = await standingsService.updateStandingsFromMatch(updatedMatch);
      
      console.log('Standings updated:', standingsResult.success ? 'Success' : 'Failed');
    }
    
    res.status(200).json(updatedMatch);
  } catch (error) {
    console.error('Error updating match status:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update match minute
exports.updateMatchMinute = async (req, res) => {
  try {
    const { currentMinute } = req.body;
    
    if (currentMinute < 0 || currentMinute > 120) {
      return res.status(400).json({ message: 'Invalid match minute' });
    }
    
    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      { currentMinute },
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