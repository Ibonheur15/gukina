const mongoose = require('mongoose');
const Match = require('../models/Match');
const LeagueStanding = require('../models/LeagueStanding');
const Team = require('../models/Team');
const standingsService = require('../services/standingsService');

// Fix data issues for a specific league
exports.fixLeagueData = async (req, res) => {
  try {
    const leagueId = req.params.leagueId;
    
    // Check if ID is valid MongoDB ObjectId
    if (!leagueId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid league ID format' });
    }
    
    const results = {
      matchesFixed: 0,
      standingsDeleted: 0,
      standingsGenerated: 0,
      errors: []
    };
    
    // 1. Fix matches without season field
    try {
      const matchesWithoutSeason = await Match.find({ 
        league: leagueId,
        season: { $exists: false } 
      });
      
      for (const match of matchesWithoutSeason) {
        const matchDate = new Date(match.matchDate);
        const season = matchDate.getFullYear().toString();
        
        match.season = season;
        await match.save();
        results.matchesFixed++;
      }
    } catch (err) {
      results.errors.push(`Error fixing matches: ${err.message}`);
    }
    
    // 2. Get all available seasons for this league
    const seasons = await Match.distinct('season', { league: leagueId });
    if (seasons.length === 0) {
      // If no seasons found, use current year
      seasons.push(new Date().getFullYear().toString());
    }
    
    // 3. Delete all existing standings for this league
    try {
      const deleteResult = await LeagueStanding.deleteMany({ league: leagueId });
      results.standingsDeleted = deleteResult.deletedCount;
    } catch (err) {
      results.errors.push(`Error deleting standings: ${err.message}`);
    }
    
    // 4. For each season, recalculate standings from match results
    for (const season of seasons) {
      try {
        // Use the standings service to recalculate standings
        const recalculateResult = await standingsService.recalculateStandings(leagueId, season);
        
        if (recalculateResult.success) {
          results.standingsGenerated += recalculateResult.standings.length;
          continue; // Skip the rest of this iteration
        }
        
        // If recalculation failed, fall back to manual calculation
        // Get teams for this league
        const teams = await Team.find({ league: leagueId });
        
        if (teams.length > 0) {
          // Get matches for this league and season
          const matches = await Match.find({
            league: leagueId,
            season: season,
            status: 'ended'
          }).populate('homeTeam awayTeam');
          
          // Create standings map
          const standingsMap = {};
          
          // Initialize standings for all teams
          teams.forEach((team, index) => {
            standingsMap[team._id.toString()] = {
              team: team._id,
              league: leagueId,
              season: season,
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
          
          // Calculate standings from match data if available
          if (matches.length > 0) {
            matches.forEach(match => {
              const homeTeamId = match.homeTeam._id.toString();
              const awayTeamId = match.awayTeam._id.toString();
              
              // Skip if team not found in standings map
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
          // We always want to start with 0 points, so we don't need the else block
          
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
          for (const standing of standingsArray) {
            const newStanding = new LeagueStanding(standing);
            await newStanding.save();
            results.standingsGenerated++;
          }
        }
      } catch (err) {
        results.errors.push(`Error generating standings for season ${season}: ${err.message}`);
      }
    }
    
    res.status(200).json({
      message: 'League standings initialized successfully',
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};