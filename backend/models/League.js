const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      required: true
    },
    logo: {
      type: String,
      default: ''
    },
    season: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Compound index to ensure unique league name per country and season
leagueSchema.index({ name: 1, country: 1, season: 1 }, { unique: true });

module.exports = mongoose.model('League', leagueSchema);