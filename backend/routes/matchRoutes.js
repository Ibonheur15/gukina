const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { protect, restrictTo } = require('../middleware/auth');

// Public routes
router.get('/', matchController.getAllMatches);
router.get('/live', matchController.getLiveMatches);
router.get('/date', matchController.getMatchesByDateRange);
router.get('/:id', matchController.getMatchById);
router.get('/league/:leagueId', matchController.getMatchesByLeague);
router.get('/team/:teamId', matchController.getMatchesByTeam);

// Protected routes (admin/editor only)
router.post('/', protect, restrictTo('admin', 'editor'), matchController.createMatch);
router.put('/:id', protect, restrictTo('admin', 'editor'), matchController.updateMatch);
router.post('/:id/events', protect, restrictTo('admin', 'editor'), matchController.addMatchEvent);
router.put('/:id/events/:eventId', protect, restrictTo('admin', 'editor'), matchController.updateMatchEvent);
router.delete('/:id/events/:eventId', protect, restrictTo('admin', 'editor'), matchController.deleteMatchEvent);
router.put('/:id/status', protect, restrictTo('admin', 'editor'), matchController.updateMatchStatus);
router.put('/:id/minute', protect, restrictTo('admin', 'editor'), matchController.updateMatchMinute);
router.delete('/:id', protect, restrictTo('admin'), matchController.deleteMatch);

module.exports = router;