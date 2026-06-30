const Progress = require('../models/progressModel');
const { executeQuery } = require('../services/database');

const updateProgress = async (req, res) => {
    try {
        const { userBookId, pagesRead, totalPages, sessionMinutes, notes, isPublic } = req.body;

        // Validation
        if (!userBookId || pagesRead === undefined || !totalPages) {
            return res.status(400).json({ error: 'User book ID, pages read, and total pages are required' });
        }

        if (pagesRead < 0 || totalPages < 1 || pagesRead > totalPages) {
            return res.status(400).json({ error: 'Invalid page numbers' });
        }

        // Verify user owns this book
        const userBookQuery = 'SELECT id, book_id FROM user_books WHERE id = ? AND user_id = ?';
        const userBooks = await executeQuery(userBookQuery, [userBookId, req.user.userId]);

        if (userBooks.length === 0) {
            return res.status(404).json({ error: 'Book not found in your library' });
        }

        // Create progress entry
        const progressId = await Progress.create({
            userBookId,
            pagesRead,
            totalPages,
            sessionMinutes: sessionMinutes || 0,
            notes,
            isPublic: isPublic !== false
        });

        // Update book status if needed
        await Progress.updateBookStatus(userBookId, pagesRead, totalPages);

        res.status(201).json({
            message: 'Progress updated successfully',
            progressId
        });
    } catch (error) {
        console.error('Progress update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getProgress = async (req, res) => {
    try {
        const { userBookId } = req.params;
        const { limit = 50 } = req.query;

        // Verify user owns this book
        const userBookQuery = 'SELECT id FROM user_books WHERE id = ? AND user_id = ?';
        const userBooks = await executeQuery(userBookQuery, [userBookId, req.user.userId]);

        if (userBooks.length === 0) {
            return res.status(404).json({ error: 'Book not found in your library' });
        }

        const progress = await Progress.findByUserBookId(userBookId, parseInt(limit));
        res.json(progress);
    } catch (error) {
        console.error('Progress fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getLatestProgress = async (req, res) => {
    try {
        const { userBookId } = req.params;

        // Verify user owns this book
        const userBookQuery = 'SELECT id FROM user_books WHERE id = ? AND user_id = ?';
        const userBooks = await executeQuery(userBookQuery, [userBookId, req.user.userId]);

        if (userBooks.length === 0) {
            return res.status(404).json({ error: 'Book not found in your library' });
        }

        const progress = await Progress.getLatestProgress(userBookId);
        res.json(progress);
    } catch (error) {
        console.error('Latest progress fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getCurrentlyReading = async (req, res) => {
    try {
        const currentlyReading = await Progress.getCurrentlyReading(req.user.userId);
        res.json(currentlyReading);
    } catch (error) {
        console.error('Currently reading fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getReadingStats = async (req, res) => {
    try {
        const { days = 30 } = req.query;

        if (days < 1 || days > 365) {
            return res.status(400).json({ error: 'Days must be between 1 and 365' });
        }

        const stats = await Progress.getUserReadingStats(req.user.userId, parseInt(days));
        res.json(stats);
    } catch (error) {
        console.error('Reading stats fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getReadingStreak = async (req, res) => {
    try {
        const streak = await Progress.getReadingStreak(req.user.userId);
        res.json({ streak });
    } catch (error) {
        console.error('Reading streak fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getMonthlyGoal = async (req, res) => {
    try {
        const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;

        if (year < 2000 || year > 2100) {
            return res.status(400).json({ error: 'Invalid year' });
        }

        if (month < 1 || month > 12) {
            return res.status(400).json({ error: 'Invalid month' });
        }

        const goal = await Progress.getMonthlyReadingGoal(req.user.userId, year, month);
        res.json(goal);
    } catch (error) {
        console.error('Monthly goal fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    updateProgress,
    getProgress,
    getLatestProgress,
    getCurrentlyReading,
    getReadingStats,
    getReadingStreak,
    getMonthlyGoal
};