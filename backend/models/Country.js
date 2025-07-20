const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    flag: {
      type: String,
      default: ''
    },
    region: {
      type: String,
      enum: ['East Africa', 'West Africa', 'North Africa', 'Southern Africa', 'Central Africa'],
      required: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Country', countrySchema);