const mongoose = require('mongoose');

const leagueStandingSchema = new mongoose.Schema(
  {
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
      required: true
    },
    season: {
      type: String,
      required: true
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    position: {
      type: Number,
      required: true
    },
    played: {
      type: Number,
      default: 0
    },
    won: {
      type: Number,
      default: 0
    },
    drawn: {
      type: Number,
      default: 0
    },
    lost: {
      type: Number,
      default: 0
    },
    goalsFor: {
      type: Number,
      default: 0
    },
    goalsAgainst: {
      type: Number,
      default: 0
    },
    points: {
      type: Number,
      default: 0
    },
    basePoints: {
      type: Number,
      default: 0
    },
    tempPoints: {
      type: Number,
      default: 0
    },
    form: {
      type: [String],
      default: []
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Compound index to ensure unique team per league and season
leagueStandingSchema.index({ league: 1, season: 1, team: 1 }, { unique: true });

module.exports = mongoose.model('LeagueStanding', leagueStandingSchema);