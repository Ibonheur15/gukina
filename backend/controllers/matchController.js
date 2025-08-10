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
    
    // Calculate live minutes for each match
    const liveTimeService = require('../services/liveTimeService');
    const matchesWithLiveTime = matches.map(match => {
      const liveMinute = liveTimeService.calculateLiveMinute(match);
      return {
        ...match.toObject(),
        currentMinute: liveMinute
      };
    });
    
    res.status(200).json(matchesWithLiveTime);
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
    
    // Calculate live minute if match is live
    if (match.status === 'live') {
      const liveTimeService = require('../services/liveTimeService');
      const liveMinute = liveTimeService.calculateLiveMinute(match);
      const matchWithLiveTime = {
        ...match.toObject(),
        currentMinute: liveMinute
      };
      return res.status(200).json(matchWithLiveTime);
    }
    
    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new match
exports.createMatch = async (req, res) => {
  try {
    // Check if home team and away team are the same (only for regular matches)
    if (!req.body.isStandalone && req.body.homeTeam === req.body.awayTeam) {
      return res.status(400).json({ message: 'Home team and away team cannot be the same' });
    }
    
    // For standalone matches, check team names
    if (req.body.isStandalone && req.body.standaloneData) {
      const { homeTeamName, awayTeamName } = req.body.standaloneData;
      if (homeTeamName && awayTeamName && homeTeamName.trim() === awayTeamName.trim()) {
        return res.status(400).json({ message: 'Home team and away team cannot be the same' });
      }
    }
    
    const newMatch = new Match(req.body);
    const savedMatch = await newMatch.save();
    let populatedMatch;
    if (savedMatch.isStandalone) {
      populatedMatch = savedMatch;
    } else {
      populatedMatch = await Match.findById(savedMatch._id)
        .populate('homeTeam', 'name shortName logo')
        .populate('awayTeam', 'name shortName logo')
        .populate('league', 'name');
    }
    
    // If match is created with ended status, update standings (only for regular matches)
    if (populatedMatch.status === 'ended' && !populatedMatch.isStandalone) {
      try {
        // Import standings service
        const standingsService = require('../services/standingsService');
        
        // Update standings based on match result
        const standingsResult = await standingsService.updateStandingsFromMatch(populatedMatch);
        
        console.log('Standings updated for new match:', standingsResult.success ? 'Success' : 'Failed');
      } catch (standingsError) {
        console.error('Error updating standings for new match:', standingsError.message);
      }
    }
    
    res.status(201).json(populatedMatch);
  } catch (error) {
    console.error('Error in createMatch:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update match
exports.updateMatch = async (req, res) => {
  try {
    // Get the current match to check previous status
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Check validation based on match type
    if (match.isStandalone) {
      // For standalone matches, check team names
      if (req.body.standaloneData) {
        const { homeTeamName, awayTeamName } = req.body.standaloneData;
        if (homeTeamName && awayTeamName && homeTeamName.trim() === awayTeamName.trim()) {
          return res.status(400).json({ message: 'Home team and away team cannot be the same' });
        }
      }
    } else {
      // For regular matches, check team IDs
      if (req.body.homeTeam && req.body.awayTeam && req.body.homeTeam === req.body.awayTeam) {
        return res.status(400).json({ message: 'Home team and away team cannot be the same' });
      }
      
      // If only one team is being updated, check against the existing other team
      if (req.body.homeTeam && !req.body.awayTeam) {
        if (req.body.homeTeam === match.awayTeam?.toString()) {
          return res.status(400).json({ message: 'Home team and away team cannot be the same' });
        }
      } else if (!req.body.homeTeam && req.body.awayTeam) {
        if (req.body.awayTeam === match.homeTeam?.toString()) {
          return res.status(400).json({ message: 'Home team and away team cannot be the same' });
        }
      }
    }
    
    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    let populatedMatch;
    if (updatedMatch.isStandalone) {
      populatedMatch = updatedMatch;
    } else {
      populatedMatch = await Match.findById(updatedMatch._id)
        .populate('homeTeam', 'name shortName logo')
        .populate('awayTeam', 'name shortName logo')
        .populate('league', 'name');
    }
    
    // If match is now ended but wasn't before, finalize live standings (only for regular matches)
    if (populatedMatch.status === 'ended' && match.status !== 'ended' && !populatedMatch.isStandalone) {
      try {
        // Import live standings service to finalize
        const liveStandingsService = require('../services/liveStandingsService');
        
        // Finalize the live standings
        const standingsResult = await liveStandingsService.finalizeMatchStandings(populatedMatch._id);
        
        console.log('Live standings finalized for updated match:', standingsResult.success ? 'Success' : 'Failed');
      } catch (standingsError) {
        console.error('Error finalizing live standings:', standingsError.message);
      }
    }
    
    res.status(200).json(populatedMatch);
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
    
    // Skip event processing for standalone matches
    if (match.isStandalone) {
      return res.status(400).json({ message: 'Events not supported for standalone matches' });
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
      try {
        const liveStandingsService = require('../services/liveStandingsService');
        await liveStandingsService.updateLiveStandings(match._id, req.body);
      } catch (standingsError) {
        console.error('Error updating live standings for event:', standingsError.message);
      }
    }
    
    const updatedMatch = await Match.findById(req.params.id)
      .populate('homeTeam', 'name shortName logo')
      .populate('awayTeam', 'name shortName logo')
      .populate('league', 'name')
      .populate('events.team', 'name shortName');
    
    res.status(200).json(updatedMatch);
  } catch (error) {
    console.error('Error in addMatchEvent:', error);
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
    
    // Handle live timing
    let updateData = { status };
    const now = new Date();
    
    if (status === 'live') {
      if (match.status === 'not_started') {
        // Starting first half - give both teams 1 point initially
        updateData.liveStartTime = now;
        updateData.currentMinute = 0;
        
        // Initialize basePoints and give initial 1 point to each team when match starts
        try {
          const liveStandingsService = require('../services/liveStandingsService');
          await liveStandingsService.initializeMatchStandings(match._id);
          await liveStandingsService.updateLiveStandings(match._id, { type: 'match_start' });
        } catch (standingsError) {
          console.error('Error initializing live standings:', standingsError.message);
        }
      } else if (match.status === 'halftime') {
        // Starting second half
        updateData.halfTimeStartTime = now;
        updateData.currentMinute = 45;
      }
    } else if (status === 'halftime') {
      // Keep current minute when going to halftime
      updateData.liveStartTime = null;
    } else if (status === 'ended') {
      // Keep current minute when ending
      updateData.liveStartTime = null;
      updateData.halfTimeStartTime = null;
    }
    
    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('homeTeam', 'name shortName logo')
      .populate('awayTeam', 'name shortName logo')
      .populate('league', 'name');
    
    // If match is now ended, finalize live standings
    if (status === 'ended' && match.status !== 'ended') {
      try {
        // Import live standings service to finalize
        const liveStandingsService = require('../services/liveStandingsService');
        
        // Finalize the live standings
        const standingsResult = await liveStandingsService.finalizeMatchStandings(updatedMatch._id);
        
        console.log('Live standings finalized:', standingsResult.success ? 'Success' : 'Failed');
      } catch (standingsError) {
        console.error('Error finalizing live standings on status update:', standingsError.message);
      }
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