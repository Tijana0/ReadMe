const express = require('express');
const { authenticateToken } = require('../services/authentication');
const {
    updateProgress,
    getProgress,
    getLatestProgress,
    getCurrentlyReading,
    getReadingStats,
    getReadingStreak,
    getMonthlyGoal
} = require('../controllers/progressController');

const router = express.Router();

// All progress routes require authentication
router.use(authenticateToken);

router.post('/', updateProgress);
router.get('/currently-reading', getCurrentlyReading);
router.get('/stats', getReadingStats);
router.get('/streak', getReadingStreak);
router.get('/monthly-goal', getMonthlyGoal);
router.get('/:userBookId', getProgress);
router.get('/:userBookId/latest', getLatestProgress);

module.exports = router;