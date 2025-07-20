const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { protect, restrictTo } = require('../middleware/auth');

// Public routes
router.get('/', teamController.getAllTeams);
router.get('/:id', teamController.getTeamById);
router.get('/country/:countryId', teamController.getTeamsByCountry);
router.get('/league/:leagueId', teamController.getTeamsByLeague);

// Protected routes (admin/editor only)
router.post('/', protect, restrictTo('admin', 'editor'), teamController.createTeam);
router.put('/:id', protect, restrictTo('admin', 'editor'), teamController.updateTeam);
router.delete('/:id', protect, restrictTo('admin'), teamController.deleteTeam);

module.exports = router;