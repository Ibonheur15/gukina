const LeagueStanding = require('../models/LeagueStanding');
const Match = require('../models/Match');
const Team = require('../models/Team');

/**
 * Update standings based on a completed match
 * @param {Object} match - The completed match object
 */
exports.updateStandingsFromMatch = async (match) => {
  try {
    // Only process ended matches
    if (match.status !== 'ended') {
      return { success: false, message: 'Match is not ended' };
    }

    const { league, season, homeTeam, awayTeam, homeScore, awayScore } = match;

    // Get or create home team standing
    let homeStanding = await LeagueStanding.findOne({
      league,
      season,
      team: homeTeam
    });

    if (!homeStanding) {
      homeStanding = new LeagueStanding({
        league,
        season,
        team: homeTeam,
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

    // Get or create away team standing
    let awayStanding = await LeagueStanding.findOne({
      league,
      season,
      team: awayTeam
    });

    if (!awayStanding) {
      awayStanding = new LeagueStanding({
        league,
        season,
        team: awayTeam,
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

    // Update matches played
    homeStanding.played += 1;
    awayStanding.played += 1;

    // Update goals
    homeStanding.goalsFor += homeScore;
    homeStanding.goalsAgainst += awayScore;
    awayStanding.goalsFor += awayScore;
    awayStanding.goalsAgainst += homeScore;

    // Update wins, draws, losses only (points handled by live system)
    if (homeScore > awayScore) {
      // Home team won
      homeStanding.won += 1;
      homeStanding.form.unshift('W');

      awayStanding.lost += 1;
      awayStanding.form.unshift('L');
    } else if (homeScore < awayScore) {
      // Away team won
      awayStanding.won += 1;
      awayStanding.form.unshift('W');

      homeStanding.lost += 1;
      homeStanding.form.unshift('L');
    } else {
      // Draw
      homeStanding.drawn += 1;
      homeStanding.form.unshift('D');

      awayStanding.drawn += 1;
      awayStanding.form.unshift('D');
    }

    // Keep only last 5 form results
    homeStanding.form = homeStanding.form.slice(0, 5);
    awayStanding.form = awayStanding.form.slice(0, 5);

    // Save standings
    await homeStanding.save();
    await awayStanding.save();

    // Update positions for all teams in this league and season
    await updateLeaguePositions(league, season);

    return {
      success: true,
      homeStanding,
      awayStanding
    };
  } catch (error) {
    console.error('Error updating standings from match:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Recalculate all standings for a league and season from match results
 * @param {String} leagueId - The league ID
 * @param {String} season - The season
 */
exports.recalculateStandings = async (leagueId, season) => {
  try {
    // Delete existing standings for this league and season
    await LeagueStanding.deleteMany({ league: leagueId, season });

    // Get all teams in this league
    const teams = await Team.find({ 
      $or: [
        { league: leagueId },
        { leagues: leagueId }
      ]
    });

    if (teams.length === 0) {
      return { success: false, message: 'No teams found for this league' };
    }

    // Initialize standings for all teams
    const standingsMap = {};
    for (const team of teams) {
      standingsMap[team._id.toString()] = {
        league: leagueId,
        season,
        team: team._id,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
        form: []
      };
    }

    // Get all completed matches for this league and season
    const matches = await Match.find({
      league: leagueId,
      season,
      status: 'ended'
    });

    // Calculate standings from match data
    for (const match of matches) {
      const homeTeamId = match.homeTeam.toString();
      const awayTeamId = match.awayTeam.toString();

      // Skip if team not found in standings map
      if (!standingsMap[homeTeamId] || !standingsMap[awayTeamId]) continue;

      // Update matches played
      standingsMap[homeTeamId].played += 1;
      standingsMap[awayTeamId].played += 1;

      // Update goals
      standingsMap[homeTeamId].goalsFor += match.homeScore;
      standingsMap[homeTeamId].goalsAgainst += match.awayScore;
      standingsMap[awayTeamId].goalsFor += match.awayScore;
      standingsMap[awayTeamId].goalsAgainst += match.homeScore;

      // Update wins, draws, losses and points (correct point system)
      if (match.homeScore > match.awayScore) {
        // Home team won - gets 3 points total for this match, away gets 0
        standingsMap[homeTeamId].won += 1;
        standingsMap[homeTeamId].points += 3;
        standingsMap[homeTeamId].form.unshift('W');

        standingsMap[awayTeamId].lost += 1;
        standingsMap[awayTeamId].form.unshift('L');
        // Away team gets 0 points total for this match
      } else if (match.homeScore < match.awayScore) {
        // Away team won - gets 3 points total for this match, home gets 0
        standingsMap[awayTeamId].won += 1;
        standingsMap[awayTeamId].points += 3;
        standingsMap[awayTeamId].form.unshift('W');

        standingsMap[homeTeamId].lost += 1;
        standingsMap[homeTeamId].form.unshift('L');
        // Home team gets 0 points total for this match
      } else {
        // Draw - each team gets 1 point total for this match
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
    if (standingsArray.length > 0) {
      await LeagueStanding.insertMany(standingsArray);
    }

    return {
      success: true,
      standings: standingsArray,
      matchesProcessed: matches.length
    };
  } catch (error) {
    console.error('Error recalculating standings:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update positions for all teams in a league and season
 * @param {String} leagueId - The league ID
 * @param {String} season - The season
 */
async function updateLeaguePositions(leagueId, season) {
  try {
    // Get all standings for this league and season
    const standings = await LeagueStanding.find({ league: leagueId, season });

    // Sort by points, goal difference, goals scored
    standings.sort((a, b) => {
      // Sort by points (descending)
      if (b.points !== a.points) return b.points - a.points;
      // If points are equal, sort by goal difference
      const aGoalDiff = a.goalsFor - a.goalsAgainst;
      const bGoalDiff = b.goalsFor - b.goalsAgainst;
      if (bGoalDiff !== aGoalDiff) return bGoalDiff - aGoalDiff;
      // If goal difference is equal, sort by goals scored
      return b.goalsFor - a.goalsFor;
    });

    // Update positions
    for (let i = 0; i < standings.length; i++) {
      standings[i].position = i + 1;
      await standings[i].save();
    }

    return true;
  } catch (error) {
    console.error('Error updating league positions:', error);
    return false;
  }
}