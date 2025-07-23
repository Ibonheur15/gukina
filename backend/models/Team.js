const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    shortName: {
      type: String,
      required: true,
      trim: true
    },
    logo: {
      type: String,
      default: ''
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      required: true
    },
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League'
    },
    leagues: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League'
    }],
    popularity: {
      type: Number,
      default: 0
    },
    city: {
      type: String,
      trim: true
    },
    stadium: {
      type: String,
      trim: true
    },
    foundedYear: {
      type: Number
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Compound index to ensure unique team name per country
teamSchema.index({ name: 1, country: 1 }, { unique: true });

module.exports = mongoose.model('Team', teamSchema);