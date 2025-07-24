const League = require('../models/League');
const mongoose = require('mongoose');

// Get all leagues
exports.getAllLeagues = async (req, res) => {
  try {
    const leagues = await League.find()
      .populate('country', 'name code flag')
      .sort({ priority: -1, name: 1 });
    res.status(200).json(leagues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get top leagues by priority
exports.getTopLeagues = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const leagues = await League.find()
      .populate('country', 'name code flag')
      .sort({ priority: -1 })
      .limit(limit);
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
    console.log('Getting league with ID:', req.params.id);
    
    // Check if ID is valid MongoDB ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid league ID format');
      return res.status(400).json({ message: 'Invalid league ID format' });
    }
    
    const league = await League.findById(req.params.id)
      .populate('country', 'name code flag');
    
    console.log('League found:', league ? 'Yes' : 'No');
    
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    
    // Get teams in this league
    const Team = require('../models/Team');
    let teams = [];
    try {
      teams = await Team.find({ league: req.params.id })
        .select('name shortName logo');
    } catch (err) {
      console.error('Error fetching teams:', err);
      // Continue with empty teams array
    }
    
    // Get recent matches for this league
    const Match = require('../models/Match');
    let recentMatches = [];
    try {
      recentMatches = await Match.find({ league: req.params.id })
        .populate('homeTeam', 'name shortName logo')
        .populate('awayTeam', 'name shortName logo')
        .sort({ matchDate: -1 })
        .limit(5);
    } catch (err) {
      console.error('Error fetching recent matches:', err);
      // Continue with empty matches array
    }
    
    // Get upcoming matches for this league
    let upcomingMatches = [];
    try {
      upcomingMatches = await Match.find({ 
        league: req.params.id,
        matchDate: { $gte: new Date() }
      })
        .populate('homeTeam', 'name shortName logo')
        .populate('awayTeam', 'name shortName logo')
        .sort({ matchDate: 1 })
        .limit(5);
    } catch (err) {
      console.error('Error fetching upcoming matches:', err);
      // Continue with empty matches array
    }
    
    // Get all available seasons for this league from matches
    let availableSeasons = [];
    try {
      availableSeasons = await Match.distinct('season', { league: req.params.id });
      // Sort seasons in descending order (newest first)
      availableSeasons.sort((a, b) => parseInt(b) - parseInt(a));
      console.log(`Found ${availableSeasons.length} available seasons:`, availableSeasons);
      
      // If no seasons found, add current year
      if (availableSeasons.length === 0) {
        const currentYear = new Date().getFullYear().toString();
        availableSeasons.push(currentYear);
      }
    } catch (err) {
      console.error('Error fetching available seasons:', err);
      // Default to current year if error
      availableSeasons = [new Date().getFullYear().toString()];
    }
    
    // Get season from query parameter or use first available season (newest) as default
    const currentSeason = req.query.season || availableSeasons[0];
    console.log('Using season:', currentSeason);
    
    // Get standings directly
    const LeagueStanding = require('../models/LeagueStanding');
    let standings = [];
    try {
      standings = await LeagueStanding.find({ 
        league: req.params.id,
        season: currentSeason
      })
      .populate('team', 'name shortName logo')
      .sort({ position: 1 });
      
      console.log(`Found ${standings.length} standings for league ${req.params.id}`);
      
      // If no standings found, create them based on actual match data or default values
      if (standings.length === 0 && teams.length > 0) {
        console.log('No standings found, generating standings for season:', currentSeason);
        
        // Create standings map to track team statistics
        const standingsMap = {};
        
        // Initialize standings for all teams with 0 points
        teams.forEach((team, index) => {
          standingsMap[team._id.toString()] = {
            team: team._id,
            league: req.params.id,
            season: currentSeason,
            position: index + 1,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0,
            form: [],
            lastUpdated: new Date()
          };
        });
        
        // Try to generate standings from actual match data
        const matchData = await Match.find({
          league: req.params.id,
          season: currentSeason,
          status: 'ended' // Only count completed matches
        }).populate('homeTeam awayTeam');
        
        console.log(`Found ${matchData.length} completed matches for standings calculation`);
        
        // Calculate standings from match data if available
        if (matchData.length > 0) {
          matchData.forEach(match => {
            const homeTeamId = match.homeTeam._id.toString();
            const awayTeamId = match.awayTeam._id.toString();
            
            // Skip if team not found in standings map (shouldn't happen)
            if (!standingsMap[homeTeamId] || !standingsMap[awayTeamId]) return;
            
            // Update matches played
            standingsMap[homeTeamId].played += 1;
            standingsMap[awayTeamId].played += 1;
            
            // Update goals
            standingsMap[homeTeamId].goalsFor += match.homeScore || 0;
            standingsMap[homeTeamId].goalsAgainst += match.awayScore || 0;
            standingsMap[awayTeamId].goalsFor += match.awayScore || 0;
            standingsMap[awayTeamId].goalsAgainst += match.homeScore || 0;
            
            // Update wins, draws, losses and points
            if (match.homeScore > match.awayScore) {
              // Home team won
              standingsMap[homeTeamId].won += 1;
              standingsMap[homeTeamId].points += 3;
              standingsMap[homeTeamId].form.unshift('W');
              
              standingsMap[awayTeamId].lost += 1;
              standingsMap[awayTeamId].form.unshift('L');
            } else if (match.homeScore < match.awayScore) {
              // Away team won
              standingsMap[awayTeamId].won += 1;
              standingsMap[awayTeamId].points += 3;
              standingsMap[awayTeamId].form.unshift('W');
              
              standingsMap[homeTeamId].lost += 1;
              standingsMap[homeTeamId].form.unshift('L');
            } else {
              // Draw
              standingsMap[homeTeamId].drawn += 1;
              standingsMap[homeTeamId].points += 1;
              standingsMap[homeTeamId].form.unshift('D');
              
              standingsMap[awayTeamId].drawn += 1;
              standingsMap[awayTeamId].points += 1;
              standingsMap[awayTeamId].form.unshift('D');
            }
            
            // Keep only last 5 form results
            standingsMap[homeTeamId].form = standingsMap[homeTeamId].form.slice(0, 5);
            standingsMap[awayTeamId].form = standingsMap[awayTeamId].form.slice(0, 5);
          });
        }
        
        // Convert map to array and sort by points
        const standingsArray = Object.values(standingsMap);
        standingsArray.sort((a, b) => {
          // Sort by points (descending)
          if (b.points !== a.points) return b.points - a.points;
          // If points are equal, sort by goal difference
          const aGoalDiff = a.goalsFor - a.goalsAgainst;
          const bGoalDiff = b.goalsFor - b.goalsAgainst;
          if (bGoalDiff !== aGoalDiff) return bGoalDiff - aGoalDiff;
          // If goal difference is equal, sort by goals scored
          return b.goalsFor - a.goalsFor;
        });
        
        // Update positions based on sorted order
        standingsArray.forEach((standing, index) => {
          standing.position = index + 1;
        });
        
        // Save all standings
        const defaultStandings = [];
        for (const standing of standingsArray) {
          try {
            const newStanding = new LeagueStanding(standing);
            await newStanding.save();
            defaultStandings.push(newStanding);
          } catch (err) {
            console.error(`Error saving standing for team ${standing.team}:`, err.message);
          }
        }
        
        console.log(`Created ${defaultStandings.length} default standings`);
        
        // Get updated standings
        standings = await LeagueStanding.find({ 
          league: req.params.id,
          season: currentSeason
        })
        .populate('team', 'name shortName logo')
        .sort({ position: 1 });
      }
    } catch (err) {
      console.error('Error fetching standings:', err);
      // Continue with empty standings array
    }
    
    // Get live matches for this league to show indicators
    const liveMatches = await Match.find({
      league: req.params.id,
      status: { $in: ['live', 'halftime'] }
    }).populate('homeTeam awayTeam', '_id name');
    
    // Create a set of team IDs that have live matches
    const liveTeamIds = new Set();
    liveMatches.forEach(match => {
      if (match.homeTeam) liveTeamIds.add(match.homeTeam._id.toString());
      if (match.awayTeam) liveTeamIds.add(match.awayTeam._id.toString());
    });
    
    // Filter out standings with missing teams and add goal difference + live indicator
    const formattedStandings = standings
      .filter(standing => standing.team) // Only include standings with valid teams
      .map(standing => {
        const goalDifference = standing.goalsFor - standing.goalsAgainst;
        const isLive = liveTeamIds.has(standing.team._id.toString());
        return {
          ...standing.toObject(),
          goalDifference,
          isLive
        };
      });
    
    res.status(200).json({
      league,
      teams,
      recentMatches,
      upcomingMatches,
      season: currentSeason,
      availableSeasons, // Include available seasons for dropdown
      standings: formattedStandings // Include formatted standings in the league response
    });
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