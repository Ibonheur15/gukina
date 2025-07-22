const express = require('express');
const router = express.Router();
const seasonController = require('../controllers/seasonController');

// Get all available seasons for a league
router.get('/league/:leagueId', seasonController.getLeagueSeasons);

module.exports = router;