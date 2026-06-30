const { executeQuery } = require('../services/database');

class Progress {
    constructor(data) {
        this.id = data.id;
        this.userBookId = data.user_book_id;
        this.pagesRead = data.pages_read;
        this.totalPages = data.total_pages;
        this.notes = data.notes;
        this.isPublic = data.is_public;
        this.createdAt = data.created_at;
    }

    static async findByUserBookId(userBookId, limit = 50) {
        const query = `
      SELECT rp.*, ub.book_id, b.title, b.total_pages as book_total_pages
      FROM reading_progress rp
      JOIN user_books ub ON rp.user_book_id = ub.id
      JOIN books b ON ub.book_id = b.id
      WHERE rp.user_book_id = ?
      ORDER BY rp.created_at DESC
      LIMIT ?
    `;
        return await executeQuery(query, [userBookId, limit]);
    }

    static async create(progressData) {
        const query = `
      INSERT INTO reading_progress (user_book_id, pages_read, total_pages, session_minutes, notes, is_public, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
        const result = await executeQuery(query, [
            progressData.userBookId,
            progressData.pagesRead,
            progressData.totalPages,
            progressData.sessionMinutes || 0,
            progressData.notes,
            progressData.isPublic !== false
        ]);

        return result.insertId;
    }

    static async getLatestProgress(userBookId) {
        const query = `
      SELECT * FROM reading_progress 
      WHERE user_book_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
        const results = await executeQuery(query, [userBookId]);
        return results.length > 0 ? results[0] : null;
    }

    static async getUserReadingStats(userId, days = 30) {
        const query = `
      SELECT 
        DATE(rp.created_at) as date,
        SUM(rp.session_minutes) as total_minutes,
        COUNT(DISTINCT rp.user_book_id) as books_read,
        SUM(rp.pages_read - LAG(rp.pages_read, 1, 0) OVER (PARTITION BY rp.user_book_id ORDER BY rp.created_at)) as pages_read
      FROM reading_progress rp
      JOIN user_books ub ON rp.user_book_id = ub.id
      WHERE ub.user_id = ? 
        AND rp.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(rp.created_at)
      ORDER BY date DESC
    `;
        return await executeQuery(query, [userId, days]);
    }

    static async getCurrentlyReading(userId) {
        const query = `
      SELECT 
        ub.id as user_book_id,
        ub.status,
        ub.format,
        b.id as book_id,
        b.title,
        b.author,
        b.cover_image,
        b.total_pages,
        COALESCE(MAX(rp.pages_read), 0) as current_page,
        COALESCE(MAX(rp.pages_read) / b.total_pages * 100, 0) as progress_percentage,
        ub.started_at
      FROM user_books ub
      JOIN books b ON ub.book_id = b.id
      LEFT JOIN reading_progress rp ON ub.id = rp.user_book_id
      WHERE ub.user_id = ? AND ub.status = 'reading'
      GROUP BY ub.id
      ORDER BY ub.started_at DESC
    `;
        return await executeQuery(query, [userId]);
    }

    static async getReadingStreak(userId) {
        const query = `
      SELECT COUNT(DISTINCT DATE(rp.created_at)) as streak_days
      FROM reading_progress rp
      JOIN user_books ub ON rp.user_book_id = ub.id
      WHERE ub.user_id = ? 
        AND rp.created_at >= (
          SELECT DATE_SUB(MAX(DATE(created_at)), INTERVAL 
            (SELECT COUNT(*) FROM (
              SELECT DATE(created_at) as date
              FROM reading_progress rp2
              JOIN user_books ub2 ON rp2.user_book_id = ub2.id
              WHERE ub2.user_id = ?
              GROUP BY DATE(created_at)
              ORDER BY date DESC
            ) as consecutive_days) DAY)
          FROM reading_progress rp3
          JOIN user_books ub3 ON rp3.user_book_id = ub3.id
          WHERE ub3.user_id = ?
        )
    `;
        const results = await executeQuery(query, [userId, userId, userId]);
        return results[0]?.streak_days || 0;
    }

    static async updateBookStatus(userBookId, pagesRead, totalPages) {
        if (pagesRead >= totalPages) {
            const query = `
        UPDATE user_books 
        SET status = 'read', completed_at = NOW(), updated_at = NOW()
        WHERE id = ?
      `;
            await executeQuery(query, [userBookId]);
        } else if (pagesRead > 0) {
            const query = `
        UPDATE user_books 
        SET status = 'reading', started_at = COALESCE(started_at, NOW()), updated_at = NOW()
        WHERE id = ?
      `;
            await executeQuery(query, [userBookId]);
        }
    }

    static async getMonthlyReadingGoal(userId, year, month) {
        const query = `
      SELECT 
        COUNT(DISTINCT ub.id) as books_completed,
        SUM(COALESCE(rp.session_minutes, 0)) as total_minutes,
        u.daily_reading_goal * DAY(LAST_DAY(CONCAT(?, '-', ?, '-01'))) as monthly_goal_minutes
      FROM users u
      LEFT JOIN user_books ub ON u.id = ub.user_id 
        AND ub.status = 'read' 
        AND YEAR(ub.completed_at) = ? 
        AND MONTH(ub.completed_at) = ?
      LEFT JOIN reading_progress rp ON ub.id = rp.user_book_id
        AND YEAR(rp.created_at) = ? 
        AND MONTH(rp.created_at) = ?
      WHERE u.id = ?
      GROUP BY u.id
    `;
        const results = await executeQuery(query, [year, month, year, month, year, month, userId]);
        return results[0] || { books_completed: 0, total_minutes: 0, monthly_goal_minutes: 0 };
    }
}

module.exports = Progress;