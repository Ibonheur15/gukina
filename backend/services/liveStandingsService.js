const LeagueStanding = require('../models/LeagueStanding');
const Match = require('../models/Match');

/**
 * Initialize standings before match starts
 * @param {String} matchId - The match ID
 */
exports.initializeMatchStandings = async (matchId) => {
  try {
    const match = await Match.findById(matchId).populate('homeTeam awayTeam league');
    if (!match) {
      throw new Error('Match not found');
    }

    const { league, season, homeTeam, awayTeam } = match;

    // Get current standings for both teams
    const [homeStanding, awayStanding] = await Promise.all([
      LeagueStanding.findOne({ league: league._id, team: homeTeam._id, season }),
      LeagueStanding.findOne({ league: league._id, team: awayTeam._id, season })
    ]);

    if (homeStanding && awayStanding) {
      // Set basePoints to current points (excluding any temp points)
      homeStanding.basePoints = homeStanding.points - (homeStanding.tempPoints || 0);
      awayStanding.basePoints = awayStanding.points - (awayStanding.tempPoints || 0);
      
      // Reset temp points
      homeStanding.tempPoints = 0;
      awayStanding.tempPoints = 0;
      
      await Promise.all([
        homeStanding.save(),
        awayStanding.save()
      ]);
    }

    return { success: true };
  } catch (error) {
    console.error('Error initializing match standings:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update standings in real-time when match events occur
 * @param {String} matchId - The match ID
 * @param {Object} eventData - The event data (goal, card, etc.)
 */
exports.updateLiveStandings = async (matchId, eventData) => {
  try {
    // Get the match details
    const match = await Match.findById(matchId).populate('homeTeam awayTeam league');
    if (!match) {
      throw new Error('Match not found');
    }

    // Handle match start or live matches
    if (!['live', 'halftime'].includes(match.status) && eventData.type !== 'match_start') {
      return { success: false, message: 'Match is not live' };
    }

    const { league, season, homeTeam, awayTeam, homeScore, awayScore } = match;

    // Get current standings for both teams
    const [homeStanding, awayStanding] = await Promise.all([
      LeagueStanding.findOne({ league: league._id, team: homeTeam._id, season }),
      LeagueStanding.findOne({ league: league._id, team: awayTeam._id, season })
    ]);

    if (!homeStanding || !awayStanding) {
      throw new Error('Team standings not found');
    }

    // Calculate current match stats (goals scored in this match)
    const homeGoalsInMatch = homeScore || 0;
    const awayGoalsInMatch = awayScore || 0;

    // Update goals for/against (this will be temporary until match ends)
    homeStanding.goalsFor = (homeStanding.goalsFor - homeStanding.tempGoalsFor || 0) + homeGoalsInMatch;
    homeStanding.goalsAgainst = (homeStanding.goalsAgainst - homeStanding.tempGoalsAgainst || 0) + awayGoalsInMatch;
    homeStanding.tempGoalsFor = homeGoalsInMatch; // Track temp goals for this match
    homeStanding.tempGoalsAgainst = awayGoalsInMatch;

    awayStanding.goalsFor = (awayStanding.goalsFor - awayStanding.tempGoalsFor || 0) + awayGoalsInMatch;
    awayStanding.goalsAgainst = (awayStanding.goalsAgainst - awayStanding.tempGoalsAgainst || 0) + homeGoalsInMatch;
    awayStanding.tempGoalsFor = awayGoalsInMatch;
    awayStanding.tempGoalsAgainst = homeGoalsInMatch;

    // Initialize basePoints if not set (first time) - this should be the points before this match
    if (homeStanding.basePoints === undefined || homeStanding.basePoints === null) {
      homeStanding.basePoints = homeStanding.points - (homeStanding.tempPoints || 0);
    }
    if (awayStanding.basePoints === undefined || awayStanding.basePoints === null) {
      awayStanding.basePoints = awayStanding.points - (awayStanding.tempPoints || 0);
    }

    // Determine temp points for this live match only
    if (homeGoalsInMatch > awayGoalsInMatch) {
      // Home team leading - gets 3 points for this match, away gets 0
      homeStanding.tempPoints = 3;
      awayStanding.tempPoints = 0;
    } else if (homeGoalsInMatch < awayGoalsInMatch) {
      // Away team leading - gets 3 points for this match, home gets 0  
      homeStanding.tempPoints = 0;
      awayStanding.tempPoints = 3;
    } else {
      // Draw (including 0-0) - each team gets 1 point for this match
      homeStanding.tempPoints = 1;
      awayStanding.tempPoints = 1;
    }

    // Final points = base points + temp points for this match
    const homeTempPoints = homeStanding.basePoints + homeStanding.tempPoints;
    const awayTempPoints = awayStanding.basePoints + awayStanding.tempPoints;

    homeStanding.points = homeTempPoints;
    awayStanding.points = awayTempPoints;

    // Mark as live update
    homeStanding.isLiveUpdate = true;
    awayStanding.isLiveUpdate = true;
    homeStanding.lastUpdated = new Date();
    awayStanding.lastUpdated = new Date();

    // Save updated standings
    await Promise.all([
      homeStanding.save(),
      awayStanding.save()
    ]);

    // Recalculate positions for the league
    await exports.recalculateLivePositions(league._id, season);

    return {
      success: true,
      message: 'Live standings updated successfully',
      homeStanding,
      awayStanding
    };

  } catch (error) {
    console.error('Error updating live standings:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Recalculate positions for live standings
 * @param {String} leagueId - The league ID
 * @param {String} season - The season
 */
exports.recalculateLivePositions = async (leagueId, season) => {
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
    console.error('Error recalculating live positions:', error);
    return false;
  }
};

/**
 * Finalize standings when match ends
 * @param {String} matchId - The match ID
 */
exports.finalizeMatchStandings = async (matchId) => {
  try {
    const match = await Match.findById(matchId).populate('homeTeam awayTeam league');
    if (!match) {
      throw new Error('Match not found');
    }

    const { league, season, homeTeam, awayTeam } = match;

    // Get standings for both teams
    const [homeStanding, awayStanding] = await Promise.all([
      LeagueStanding.findOne({ league: league._id, team: homeTeam._id, season }),
      LeagueStanding.findOne({ league: league._id, team: awayTeam._id, season })
    ]);

    if (homeStanding && awayStanding) {
      // Finalize points: keep the current total (basePoints + tempPoints)
      const finalHomePoints = (homeStanding.basePoints || 0) + (homeStanding.tempPoints || 0);
      const finalAwayPoints = (awayStanding.basePoints || 0) + (awayStanding.tempPoints || 0);
      
      homeStanding.points = finalHomePoints;
      awayStanding.points = finalAwayPoints;
      homeStanding.basePoints = finalHomePoints;
      awayStanding.basePoints = finalAwayPoints;
      
      // Clear temporary fields and mark as finalized
      homeStanding.tempGoalsFor = undefined;
      homeStanding.tempGoalsAgainst = undefined;
      homeStanding.tempPoints = 0;
      homeStanding.isLiveUpdate = false;
      homeStanding.played += 1;

      awayStanding.tempGoalsFor = undefined;
      awayStanding.tempGoalsAgainst = undefined;
      awayStanding.tempPoints = 0;
      awayStanding.isLiveUpdate = false;
      awayStanding.played += 1;

      // Update win/draw/loss counts
      const homeScore = match.homeScore || 0;
      const awayScore = match.awayScore || 0;

      if (homeScore > awayScore) {
        homeStanding.won += 1;
        awayStanding.lost += 1;
        homeStanding.form.unshift('W');
        awayStanding.form.unshift('L');
      } else if (homeScore < awayScore) {
        homeStanding.lost += 1;
        awayStanding.won += 1;
        homeStanding.form.unshift('L');
        awayStanding.form.unshift('W');
      } else {
        homeStanding.drawn += 1;
        awayStanding.drawn += 1;
        homeStanding.form.unshift('D');
        awayStanding.form.unshift('D');
      }

      // Keep only last 5 form results
      homeStanding.form = homeStanding.form.slice(0, 5);
      awayStanding.form = awayStanding.form.slice(0, 5);

      await Promise.all([
        homeStanding.save(),
        awayStanding.save()
      ]);
    }

    return { success: true, message: 'Match standings finalized' };
  } catch (error) {
    console.error('Error finalizing match standings:', error);
    return { success: false, error: error.message };
  }
};