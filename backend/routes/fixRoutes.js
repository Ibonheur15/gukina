const express = require('express');
const router = express.Router();
const fixController = require('../controllers/fixController');

// Fix data issues for a specific league
router.get('/league/:leagueId', fixController.fixLeagueData);

module.exports = router;