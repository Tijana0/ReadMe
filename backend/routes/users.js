const express = require('express');
const { authenticateToken } = require('../services/authentication');
const {
    getProfile,
    updateProfile,
    getYearlyStats,
    getCurrentlyReading,
    getReadingStreak,
    getReadingStats,
    getMonthlyGoal
} = require('../controllers/userController');

const router = express.Router();

router.use(authenticateToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.patch('/profile', updateProfile);
router.get('/stats/yearly', getYearlyStats);
router.get('/currently-reading', getCurrentlyReading);
router.get('/reading-streak', getReadingStreak);
router.get('/reading-stats', getReadingStats);
router.get('/monthly-goal', getMonthlyGoal);

module.exports = router;