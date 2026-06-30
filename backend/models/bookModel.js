const { executeQuery } = require("../services/database")

class Book {
    constructor(data) {
        this.id = data.id
        this.google_id = data.google_id
        this.title = data.title
        this.author = data.author
        this.cover_url = data.cover_url
        this.genre = data.genre
        this.status = data.status
        this.description = data.description
        this.page_count = data.page_count
        this.published_date = data.published_date
        this.is_favorite = data.is_favorite
        this.date_added = data.date_added
        this.date_finished = data.date_finished
        this.last_read_date = data.last_read_date
        this.user_id = data.user_id
        this.format = data.format
        // Progress data from reading_progress table
        this.current_page = data.pages_read || 0
        this.progress_percentage = data.progress_percentage || 0
        this.total_pages_tracked = data.total_pages || data.page_count
        this.progress_last_updated = data.progress_last_updated
    }

    static async findById(id) {
        try {
            console.log("Finding book by ID:", id)
            const query = "SELECT * FROM books WHERE id = ?"
            const results = await executeQuery(query, [id])
            console.log("Found book:", results.length > 0 ? results[0].title : "Not found")
            return results.length > 0 ? new Book(results[0]) : null
        } catch (error) {
            console.error("Error finding book by ID:", error)
            throw error
        }
    }

    static async findByIdWithProgress(id, userId) {
        try {
            console.log("Finding book with progress by ID:", id, "for user:", userId)
            const query = `
                SELECT b.*, rp.pages_read, rp.total_pages, rp.progress_percentage, rp.last_updated as progress_last_updated
                FROM books b
                         LEFT JOIN reading_progress rp ON b.id = rp.book_id AND rp.user_id = ?
                WHERE b.id = ?
            `
            const results = await executeQuery(query, [userId, id])
            console.log("Found book with progress:", results.length > 0 ? results[0].title : "Not found")
            return results.length > 0 ? new Book(results[0]) : null
        } catch (error) {
            console.error("Error finding book with progress by ID:", error)
            throw error
        }
    }

    static async findByUserId(userId, limit = null) {
        try {
            console.log("=== FIND BY USER ID START ===")
            console.log("Finding books for user:", userId, "limit:", limit)

            let query = `
                SELECT b.*, rp.pages_read, rp.total_pages, rp.progress_percentage, rp.last_updated as progress_last_updated
                FROM books b
                         LEFT JOIN reading_progress rp ON b.id = rp.book_id AND rp.user_id = b.user_id
                WHERE b.user_id = ?
                ORDER BY b.date_added DESC
            `

            const params = [userId]

            if (limit) {
                query += ` LIMIT ${limit}` // Use string interpolation instead of parameter
            }

            console.log("Executing query:", query)
            console.log("With params:", params)

            const results = await executeQuery(query, params)
            console.log("Query result:", {
                count: results.length,
                books: results.map((book) => ({ id: book.id, title: book.title, status: book.status })),
            })
            console.log("=== FIND BY USER ID END ===")

            return results.map((book) => new Book(book))
        } catch (error) {
            console.error("=== FIND BY USER ID ERROR ===")
            console.error("Error finding books by user ID:", error)
            console.error("Error stack:", error.stack)
            throw error
        }
    }

    static async findByStatus(userId, status) {
        try {
            console.log("Finding books by status for user:", userId, "status:", status)
            const query = `
                SELECT b.*, rp.pages_read, rp.total_pages, rp.progress_percentage, rp.last_updated as progress_last_updated
                FROM books b
                         LEFT JOIN reading_progress rp ON b.id = rp.book_id AND rp.user_id = b.user_id
                WHERE b.user_id = ? AND b.status = ?
                ORDER BY b.date_added DESC
            `
            const results = await executeQuery(query, [userId, status])
            console.log("Found books by status:", results.length)
            return results.map((book) => new Book(book))
        } catch (error) {
            console.error("Error finding books by status:", error)
            throw error
        }
    }

    static async findFavorites(userId, limit = null) {
        try {
            console.log("=== FIND FAVORITES START ===")
            console.log("Finding favorite books for user:", userId, "limit:", limit)

            let query = `
                SELECT b.*, rp.pages_read, rp.total_pages, rp.progress_percentage, rp.last_updated as progress_last_updated
                FROM books b
                         LEFT JOIN reading_progress rp ON b.id = rp.book_id AND rp.user_id = b.user_id
                WHERE b.user_id = ? AND b.is_favorite = 1
                ORDER BY b.date_added DESC
            `

            const params = [userId]

            if (limit) {
                query += ` LIMIT ${limit}` // Use string interpolation instead of parameter
            }

            console.log("Executing query:", query)
            const results = await executeQuery(query, params)
            console.log("Favorite books found:", results.length)
            console.log("=== FIND FAVORITES END ===")

            return results.map((book) => new Book(book))
        } catch (error) {
            console.error("=== FIND FAVORITES ERROR ===")
            console.error("Error finding favorite books:", error)
            throw error
        }
    }

    static async findLatestRead(userId) {
        try {
            const query = `
                SELECT b.*, rp.pages_read, rp.total_pages, rp.progress_percentage, rp.last_updated as progress_last_updated
                FROM books b
                         LEFT JOIN reading_progress rp ON b.id = rp.book_id AND rp.user_id = b.user_id
                WHERE b.user_id = ? AND b.status = 'Read' AND b.date_finished IS NOT NULL
                ORDER BY b.date_finished DESC
                    LIMIT 1
            `
            const results = await executeQuery(query, [userId])
            console.log("Latest read book:", results.length > 0 ? results[0].title : "None")
            return results.length > 0 ? new Book(results[0]) : null
        } catch (error) {
            console.error("Error in Book.findLatestRead:", error)
            throw error
        }
    }

    static async findCurrentlyReading(userId) {
        try {
            console.log("=== FIND CURRENTLY READING START ===")
            console.log("Finding currently reading book for user:", userId)

            const query = `
                SELECT b.*, rp.pages_read, rp.total_pages, rp.progress_percentage, rp.last_updated as progress_last_updated
                FROM books b
                         LEFT JOIN reading_progress rp ON b.id = rp.book_id AND rp.user_id = b.user_id
                WHERE b.user_id = ? AND b.status = 'Currently Reading'
                ORDER BY b.last_read_date DESC, b.date_added DESC
                    LIMIT 1
            `

            console.log("Executing query:", query)
            const results = await executeQuery(query, [userId])
            console.log("Currently reading result:", results.length > 0 ? results[0].title : "None")
            console.log("=== FIND CURRENTLY READING END ===")

            return results.length > 0 ? new Book(results[0]) : null
        } catch (error) {
            console.error("=== FIND CURRENTLY READING ERROR ===")
            console.error("Error finding currently reading book:", error)
            throw error
        }
    }

    static async create(bookData) {
        try {
            console.log("=== BOOK CREATE START ===")
            console.log("Creating book with data:", bookData)

            // Ensure required fields are present
            if (!bookData.title || !bookData.author || !bookData.user_id) {
                throw new Error("Title, author, and user_id are required")
            }

            const query = `
                INSERT INTO books (
                    google_id, title, author, cover_url, genre, status,
                    description, page_count, published_date, is_favorite,
                    date_added, user_id, format
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
            `

            const params = [
                bookData.google_id || null,
                bookData.title,
                bookData.author,
                bookData.cover_url || null,
                bookData.genre || null,
                bookData.status || "Want to Read",
                bookData.description || null,
                bookData.page_count || null,
                bookData.published_date || null,
                bookData.is_favorite ? 1 : 0,
                bookData.user_id,
                bookData.format || "Physical",
            ]

            console.log("Executing query:", query)
            console.log("With params:", params)

            const result = await executeQuery(query, params)
            console.log("Insert result:", result)
            console.log("=== BOOK CREATE SUCCESS ===")

            return result.insertId
        } catch (error) {
            console.error("=== BOOK CREATE ERROR ===")
            console.error("Error creating book:", error)
            console.error("Error details:", {
                message: error.message,
                code: error.code,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage,
            })
            throw error
        }
    }

    static async update(id, bookData) {
        try {
            console.log("Updating book:", id, "with data:", bookData)
            const query = `
                UPDATE books
                SET title = ?, author = ?, genre = ?, status = ?,
                    is_favorite = ?, date_finished = ?, last_read_date = ?, format = ?
                WHERE id = ? AND user_id = ?
            `

            const result = await executeQuery(query, [
                bookData.title,
                bookData.author,
                bookData.genre,
                bookData.status,
                bookData.is_favorite ? 1 : 0,
                bookData.date_finished || null,
                bookData.last_read_date || null,
                bookData.format,
                id,
                bookData.user_id,
            ])

            console.log("Update result:", result.affectedRows > 0 ? "Success" : "No rows affected")
            return result.affectedRows > 0
        } catch (error) {
            console.error("Error updating book:", error)
            throw error
        }
    }

    static async toggleFavorite(id, userId) {
        try {
            console.log("Toggling favorite for book:", id, "user:", userId)
            const query = `
                UPDATE books
                SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END
                WHERE id = ? AND user_id = ?
            `

            const result = await executeQuery(query, [id, userId])
            console.log("Toggle favorite result:", result.affectedRows > 0 ? "Success" : "No rows affected")
            return result.affectedRows > 0
        } catch (error) {
            console.error("Error toggling favorite:", error)
            throw error
        }
    }

    static async delete(id, userId) {
        try {
            console.log("Deleting book:", id, "for user:", userId)

            // First delete any progress records using the existing Progress model
            try {
                const Progress = require("./progressModel")
                await Progress.deleteByBookAndUser(id, userId)
            } catch (progressError) {
                console.error("Error deleting progress records:", progressError)
                // Continue with book deletion even if progress deletion fails
            }

            const query = "DELETE FROM books WHERE id = ? AND user_id = ?"
            const result = await executeQuery(query, [id, userId])
            console.log("Delete result:", result.affectedRows > 0 ? "Success" : "No rows affected")
            return result.affectedRows > 0
        } catch (error) {
            console.error("Error deleting book:", error)
            throw error
        }
    }

    static async search(searchTerm, userId = null) {
        try {
            console.log("Searching books for user:", userId, "query:", searchTerm)
            let query = `
                SELECT b.*, rp.pages_read, rp.total_pages, rp.progress_percentage, rp.last_updated as progress_last_updated
                FROM books b
                         LEFT JOIN reading_progress rp ON b.id = rp.book_id AND rp.user_id = b.user_id
                WHERE (b.title LIKE ? OR b.author LIKE ? OR b.genre LIKE ?)
            `

            const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]

            if (userId) {
                query += " AND b.user_id = ?"
                params.push(userId)
            }

            query += " ORDER BY b.date_added DESC"

            const results = await executeQuery(query, params)
            console.log("Search results:", results.length)
            return results.map((book) => new Book(book))
        } catch (error) {
            console.error("Error searching books:", error)
            throw error
        }
    }

    // Add a method to get total count for debugging
    static async getTotalCount(userId) {
        try {
            console.log("Getting total book count for user:", userId)
            const query = "SELECT COUNT(*) as count FROM books WHERE user_id = ?"
            const results = await executeQuery(query, [userId])
            const count = results[0].count
            console.log("Total books for user:", count)
            return count
        } catch (error) {
            console.error("Error getting total count:", error)
            throw error
        }
    }

    static async getDashboardData(userId) {
        try {
            // Get latest 4 books
            const latestBooks = await this.findByUserId(userId, 4)

            // Get favorite books
            const favoriteBooks = await this.findFavorites(userId, 4)

            // Get currently reading book
            const currentlyReading = await this.findCurrentlyReading(userId)

            return {
                latestBooks,
                favoriteBooks,
                currentlyReading,
            }
        } catch (error) {
            console.error("Error in Book.getDashboardData:", error)
            throw error
        }
    }
}

module.exports = Book