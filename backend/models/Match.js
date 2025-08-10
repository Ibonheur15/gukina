const mongoose = require('mongoose');

const matchEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['goal', 'yellow_card', 'red_card', 'substitution', 'penalty'],
    required: true
  },
  minute: {
    type: Number,
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  player: {
    type: String,
    required: true
  },
  additionalInfo: {
    type: String
  }
}, { timestamps: true });

const matchSchema = new mongoose.Schema(
  {
    homeTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    awayTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      validate: {
        validator: function(awayTeamId) {
          return !awayTeamId.equals(this.homeTeam);
        },
        message: 'Home team and away team cannot be the same'
      }
    },
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
      required: true
    },
    matchDate: {
      type: Date,
      required: true
    },
    venue: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['not_started', 'live', 'halftime', 'ended', 'postponed', 'canceled'],
      default: 'not_started'
    },
    currentMinute: {
      type: Number,
      default: 0
    },
    liveStartTime: {
      type: Date
    },
    halfTimeStartTime: {
      type: Date
    },
    homeScore: {
      type: Number,
      default: 0
    },
    awayScore: {
      type: Number,
      default: 0
    },
    events: [matchEventSchema],
    round: {
      type: String
    },
    season: {
      type: String,
      required: true
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model('Match', matchSchema);