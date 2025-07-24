/**
 * Calculate current live minute for a match
 * @param {Object} match - The match object
 * @returns {Number} - Current minute
 */
exports.calculateLiveMinute = (match) => {
  if (!['live'].includes(match.status)) {
    return match.currentMinute;
  }

  const now = new Date();
  
  if (match.status === 'live') {
    if (match.halfTimeStartTime) {
      // Second half - calculate from half time start
      const secondHalfMinutes = Math.floor((now - match.halfTimeStartTime) / (1000 * 60));
      return 45 + secondHalfMinutes; // No max limit, count until admin stops
    } else if (match.liveStartTime) {
      // First half - calculate from match start
      const firstHalfMinutes = Math.floor((now - match.liveStartTime) / (1000 * 60));
      return firstHalfMinutes; // Start from 0, count until admin stops
    }
  }
  
  return match.currentMinute;
};

/**
 * Get live matches with calculated minutes
 */
exports.getLiveMatchesWithMinutes = async () => {
  const Match = require('../models/Match');
  
  const liveMatches = await Match.find({ 
    status: { $in: ['live', 'halftime'] } 
  })
  .populate('homeTeam', 'name shortName logo')
  .populate('awayTeam', 'name shortName logo')
  .populate('league', 'name');
  
  return liveMatches.map(match => {
    const liveMinute = this.calculateLiveMinute(match);
    return {
      ...match.toObject(),
      currentMinute: liveMinute
    };
  });
};