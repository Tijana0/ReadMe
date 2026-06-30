const { executeQuery } = require("../services/database")

class Review {
    constructor(data) {
        this.id = data.id
        this.rating = data.rating
        this.comment = data.comment
        this.book_id = data.book_id
        this.user_id = data.user_id
        this.created_at = data.created_at
        this.updated_at = data.updated_at
    }

    static async findById(id) {
        try {
            const query = "SELECT * FROM reviews WHERE id = ?"
            const results = await executeQuery(query, [id])
            return results.length > 0 ? new Review(results[0]) : null
        } catch (error) {
            console.error("Error in Review.findById:", error)
            throw error
        }
    }

    static async findByBookId(bookId) {
        try {
            console.log("=== REVIEW FIND BY BOOK ID START ===")
            console.log("Book ID:", bookId)

            const query = `
            SELECT r.*, u.email, u.name
            FROM reviews r
            LEFT JOIN readers u ON r.user_id = u.id
            WHERE r.book_id = ?
            ORDER BY r.created_at DESC
          `

            console.log("Executing query:", query)
            const results = await executeQuery(query, [bookId])
            console.log("Reviews query results:", results)
            console.log("=== REVIEW FIND BY BOOK ID SUCCESS ===")

            return results
        } catch (error) {
            console.error("=== REVIEW FIND BY BOOK ID ERROR ===")
            console.error("Error in Review.findByBookId:", error)
            throw error
        }
    }

    static async findByUserId(userId) {
        try {
            const query = `
        SELECT r.*, b.title, b.author
        FROM reviews r
        JOIN books b ON r.book_id = b.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
      `
            const results = await executeQuery(query, [userId])
            return results
        } catch (error) {
            console.error("Error in Review.findByUserId:", error)
            throw error
        }
    }

    static async create(reviewData) {
        try {
            console.log("=== REVIEW CREATE START ===")
            console.log("Review data received:", reviewData)

            const { rating, comment, book_id, user_id } = reviewData

            // Validate required fields
            if (!rating || !comment || !book_id || !user_id) {
                const missingFields = []
                if (!rating) missingFields.push("rating")
                if (!comment) missingFields.push("comment")
                if (!book_id) missingFields.push("book_id")
                if (!user_id) missingFields.push("user_id")

                console.error("Missing required fields:", missingFields)
                throw new Error(`Missing required fields: ${missingFields.join(", ")}`)
            }

            const query = `
        INSERT INTO reviews (rating, comment, book_id, user_id, created_at, updated_at) 
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `

            console.log("Executing insert query:", query)
            console.log("With values:", [rating, comment, book_id, user_id])

            const result = await executeQuery(query, [rating, comment, book_id, user_id])

            console.log("Insert result:", result)
            console.log("Insert ID:", result.insertId)
            console.log("=== REVIEW CREATE SUCCESS ===")

            return result.insertId
        } catch (error) {
            console.error("=== REVIEW CREATE ERROR ===")
            console.error("Error in Review.create:", error)
            console.error("Error message:", error.message)
            console.error("Error stack:", error.stack)
            throw error
        }
    }

    static async update(id, reviewData, userId) {
        try {
            const query = `
        UPDATE reviews 
        SET rating = ?, comment = ?, updated_at = NOW()
        WHERE id = ? AND user_id = ?
      `
            const result = await executeQuery(query, [reviewData.rating, reviewData.comment, id, userId])

            return result.affectedRows > 0
        } catch (error) {
            console.error("Error in Review.update:", error)
            throw error
        }
    }

    static async delete(id, userId) {
        try {
            const query = "DELETE FROM reviews WHERE id = ? AND user_id = ?"
            const result = await executeQuery(query, [id, userId])
            return result.affectedRows > 0
        } catch (error) {
            console.error("Error in Review.delete:", error)
            throw error
        }
    }

    static async getAverageRating(bookId) {
        try {
            console.log("=== GET AVERAGE RATING START ===")
            console.log("Book ID:", bookId)

            const query = `
        SELECT AVG(rating) as average_rating, COUNT(*) as review_count
        FROM reviews
        WHERE book_id = ?
      `

            console.log("Executing rating query:", query)
            const results = await executeQuery(query, [bookId])

            const result = {
                average_rating: results[0].average_rating ? Number.parseFloat(results[0].average_rating) : 0,
                review_count: Number.parseInt(results[0].review_count) || 0,
            }

            console.log("Rating result:", result)
            console.log("=== GET AVERAGE RATING SUCCESS ===")

            return result
        } catch (error) {
            console.error("=== GET AVERAGE RATING ERROR ===")
            console.error("Error in Review.getAverageRating:", error)
            throw error
        }
    }
}

module.exports = Review