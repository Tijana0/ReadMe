const axios = require("axios")
const Book = require("../models/bookModel")
const Review = require("../models/reviewModel")

// Google Books API configuration
const GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes"
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY || "" // Add this to your .env file

const getHighResCoverUrl = (url) => {
    if (!url) return null
    // Replace zoom=1 or zoom=5 with zoom=2
    let highResUrl = url.replace(/zoom=[15]/, "zoom=2")
    // Remove the edge=curl parameter
    highResUrl = highResUrl.replace(/&edge=curl/, "")
    // Ensure https
    if (highResUrl.startsWith("http://")) {
        highResUrl = highResUrl.replace("http://", "https://")
    }
    return highResUrl
}

const getAllBooks = async (req, res) => {
    try {
        console.log("getAllBooks called for user:", req.user.userId)
        const books = await Book.findByUserId(req.user.userId)
        console.log("Found books:", books.length)
        res.json(books)
    } catch (error) {
        console.error("Error fetching books:", error)
        res.status(500).json({ error: "Failed to fetch books" })
    }
}

const getBooksByStatus = async (req, res) => {
    try {
        const { status } = req.params
        console.log("getBooksByStatus called for user:", req.user.userId, "status:", status)

        // Validate status
        const validStatuses = ["Currently Reading", "Read", "Want to Read"]
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status" })
        }

        const books = await Book.findByStatus(req.user.userId, status)
        console.log("Found books by status:", books.length)
        res.json(books)
    } catch (error) {
        console.error("Error fetching books by status:", error)
        res.status(500).json({ error: "Failed to fetch books" })
    }
}

const getBookById = async (req, res) => {
    try {
        const { id } = req.params
        console.log("getBookById called for book:", id, "user:", req.user.userId)

        const book = await Book.findById(id)

        if (!book) {
            return res.status(404).json({ error: "Book not found" })
        }

        // Check if book belongs to user
        if (book.user_id !== req.user.userId) {
            return res.status(403).json({ error: "Access denied" })
        }

        // Get reviews for the book
        const reviews = await Review.findByBookId(id)
        const bookWithReviews = {
            ...book,
            reviews,
        }

        res.json(bookWithReviews)
    } catch (error) {
        console.error("Error fetching book:", error)
        res.status(500).json({ error: "Failed to fetch book" })
    }
}

const addBook = async (req, res) => {
    try {
        console.log("=== ADD BOOK REQUEST START ===")
        console.log("Add book request received:", req.body)
        console.log("User:", req.user)

        const { google_id, title, author, cover_url, genre, status, description, page_count, published_date, format } =
            req.body

        // Validation
        if (!title || !author) {
            console.log("Validation failed: missing title or author")
            return res.status(400).json({ error: "Title and author are required" })
        }

        // Validate status
        const validStatuses = ["Currently Reading", "Read", "Want to Read"]
        if (status && !validStatuses.includes(status)) {
            console.log("Validation failed: invalid status", status)
            return res.status(400).json({ error: "Invalid status" })
        }

        // Validate format
        const validFormats = ["Physical", "E-Book", "Audiobook"]
        if (format && !validFormats.includes(format)) {
            console.log("Validation failed: invalid format", format)
            return res.status(400).json({ error: "Invalid format" })
        }

        // Ensure user_id is available
        if (!req.user || !req.user.userId) {
            console.log("Authentication error: no user ID")
            return res.status(401).json({ error: "User authentication required" })
        }

        console.log("Creating book with data:", {
            google_id,
            title,
            author,
            cover_url,
            genre,
            status: status || "Want to Read",
            description,
            page_count,
            published_date,
            format: format || "Physical",
            user_id: req.user.userId,
        })

        const bookId = await Book.create({
            google_id,
            title,
            author,
            cover_url,
            genre,
            status: status || "Want to Read",
            description,
            page_count,
            published_date,
            format: format || "Physical",
            user_id: req.user.userId,
        })

        console.log("Book created with ID:", bookId)

        // Fetch the created book to return it
        const createdBook = await Book.findById(bookId)
        console.log("Created book:", createdBook)

        console.log("=== ADD BOOK REQUEST SUCCESS ===")
        res.status(201).json({
            message: "Book added successfully",
            book: createdBook,
        })
    } catch (error) {
        console.error("=== ADD BOOK REQUEST ERROR ===")
        console.error("Error adding book:", error)
        console.error("Error stack:", error.stack)

        // Check if it's a database column error
        if (error.message && error.message.includes("Unknown column")) {
            return res.status(500).json({
                error: "Database schema error. Please run the database migration scripts to update the books table structure.",
            })
        }

        res.status(500).json({ error: "Failed to add book: " + error.message })
    }
}

const updateBook = async (req, res) => {
    try {
        const { id } = req.params
        const { title, author, genre, status, is_favorite, format } = req.body
        console.log("updateBook called for book:", id, "user:", req.user.userId)

        // Check if book exists and belongs to user
        const book = await Book.findById(id)
        if (!book) {
            return res.status(404).json({ error: "Book not found" })
        }

        if (book.user_id !== req.user.userId) {
            return res.status(403).json({ error: "Access denied" })
        }

        // Set date_finished if status is being changed to 'Read'
        let date_finished = book.date_finished
        if (status === "Read" && book.status !== "Read") {
            date_finished = new Date()
        } else if (status !== "Read") {
            date_finished = null
        }

        const success = await Book.update(id, {
            title: title || book.title,
            author: author || book.author,
            genre: genre || book.genre,
            status: status || book.status,
            is_favorite: is_favorite !== undefined ? is_favorite : book.is_favorite,
            date_finished,
            last_read_date: status === "Currently Reading" ? new Date() : book.last_read_date,
            format: format || book.format,
            user_id: req.user.userId,
        })

        if (!success) {
            return res.status(404).json({ error: "Book not found" })
        }

        res.json({ message: "Book updated successfully" })
    } catch (error) {
        console.error("Error updating book:", error)
        res.status(500).json({ error: "Failed to update book" })
    }
}

const toggleFavorite = async (req, res) => {
    try {
        const { id } = req.params
        console.log("toggleFavorite called for book:", id, "user:", req.user.userId)

        // Check if book exists and belongs to user
        const book = await Book.findById(id)
        if (!book) {
            return res.status(404).json({ error: "Book not found" })
        }

        if (book.user_id !== req.user.userId) {
            return res.status(403).json({ error: "Access denied" })
        }

        const success = await Book.toggleFavorite(id, req.user.userId)

        if (!success) {
            return res.status(404).json({ error: "Book not found" })
        }

        res.json({ message: "Favorite status updated successfully" })
    } catch (error) {
        console.error("Error toggling favorite:", error)
        res.status(500).json({ error: "Failed to update favorite status" })
    }
}

const deleteBook = async (req, res) => {
    try {
        const { id } = req.params
        console.log("deleteBook called for book:", id, "user:", req.user.userId)

        const success = await Book.delete(id, req.user.userId)

        if (!success) {
            return res.status(404).json({ error: "Book not found or access denied" })
        }

        res.json({ message: "Book deleted successfully" })
    } catch (error) {
        console.error("Error deleting book:", error)
        res.status(500).json({ error: "Failed to delete book" })
    }
}

const getDashboardData = async (req, res) => {
    try {
        console.log("=== BACKEND DASHBOARD REQUEST START ===")
        console.log("Dashboard data request received")
        console.log("Request headers:", req.headers.authorization ? "Bearer token present" : "No auth header")
        console.log("Authenticated user:", req.user)

        if (!req.user || !req.user.userId) {
            console.log("Authentication error: no user ID")
            return res.status(401).json({ error: "User authentication required" })
        }

        console.log("Fetching dashboard data for user:", req.user.userId)

        // Test basic database connection first
        try {
            console.log("=== TESTING DATABASE CONNECTION ===")
            const testCount = await Book.getTotalCount(req.user.userId)
            console.log("Total books in database for user:", testCount)
        } catch (testError) {
            console.error("Database connection test failed:", testError)
        }

        let latestBooks = []
        let favoriteBooks = []
        let currentlyReading = null

        try {
            // Get latest 4 books with detailed logging
            console.log("=== FETCHING LATEST BOOKS ===")
            latestBooks = await Book.findByUserId(req.user.userId, 4)
            console.log("Latest books query completed")
            console.log("Latest books count:", latestBooks ? latestBooks.length : 0)

            if (latestBooks && latestBooks.length > 0) {
                console.log("Latest books sample:")
                latestBooks.forEach((book, index) => {
                    console.log(`  ${index + 1}. ${book.title} by ${book.author} (Status: ${book.status})`)
                })
            } else {
                console.log("No latest books found - this might be the issue!")
            }
        } catch (latestError) {
            console.error("=== ERROR FETCHING LATEST BOOKS ===")
            console.error("Latest books error:", latestError)
            console.error("Error details:", {
                message: latestError.message,
                code: latestError.code,
                sqlState: latestError.sqlState,
            })
            latestBooks = []
        }

        try {
            // Get favorite books with error handling
            console.log("=== FETCHING FAVORITE BOOKS ===")
            favoriteBooks = await Book.findFavorites(req.user.userId, 4)
            console.log("Favorite books found:", favoriteBooks ? favoriteBooks.length : 0)
        } catch (favoriteError) {
            console.error("Error fetching favorite books:", favoriteError)
            favoriteBooks = []
        }

        try {
            // Get currently reading book with error handling
            console.log("=== FETCHING CURRENTLY READING ===")
            currentlyReading = await Book.findCurrentlyReading(req.user.userId)
            console.log("Currently reading book:", currentlyReading ? currentlyReading.title : "None")
        } catch (currentError) {
            console.error("Error fetching currently reading book:", currentError)
            currentlyReading = null
        }

        const dashboardData = {
            latestBooks: latestBooks || [],
            favoriteBooks: favoriteBooks || [],
            currentlyReading: currentlyReading || null,
        }

        console.log("=== FINAL DASHBOARD DATA ===")
        console.log("Dashboard data prepared:")
        console.log("- Latest books:", dashboardData.latestBooks.length)
        console.log("- Favorite books:", dashboardData.favoriteBooks.length)
        console.log("- Currently reading:", !!dashboardData.currentlyReading)

        // Log the actual data being sent
        console.log("Sending response data:", JSON.stringify(dashboardData, null, 2))
        console.log("=== BACKEND DASHBOARD REQUEST SUCCESS ===")

        res.json(dashboardData)
    } catch (error) {
        console.error("=== BACKEND DASHBOARD REQUEST ERROR ===")
        console.error("Error fetching dashboard data:", error)
        console.error("Error stack:", error.stack)
        res.status(500).json({
            error: "Failed to fetch dashboard data",
            details: error.message,
        })
    }
}

const searchGoogleBooks = async (query) => {
    try {
        console.log("Searching Google Books API for:", query)

        const params = {
            q: query,
            maxResults: 10,
            printType: "books",
            langRestrict: "en",
        }

        // Add API key if available
        if (GOOGLE_BOOKS_API_KEY) {
            params.key = GOOGLE_BOOKS_API_KEY
        }

        const response = await axios.get(GOOGLE_BOOKS_API_URL, {
            params,
            timeout: 10000, // 10 second timeout
        })

        console.log("Google Books API response received")

        if (!response.data || !response.data.items) {
            console.log("No items found in Google Books response")
            return []
        }

        const books = response.data.items.map((item) => {
            const volumeInfo = item.volumeInfo || {}
            const imageLinks = volumeInfo.imageLinks || {}

            return {
                googleId: item.id,
                title: volumeInfo.title || "Unknown Title",
                authors: Array.isArray(volumeInfo.authors)
                    ? volumeInfo.authors.join(", ")
                    : volumeInfo.authors || "Unknown Author",
                description: volumeInfo.description || "No description available",
                thumbnail: getHighResCoverUrl(imageLinks.thumbnail || imageLinks.smallThumbnail),
                publishedDate: volumeInfo.publishedDate || null,
                pageCount: volumeInfo.pageCount || null,
                categories: volumeInfo.categories || [],
                language: volumeInfo.language || "en",
                publisher: volumeInfo.publisher || null,
                isbn: volumeInfo.industryIdentifiers
                    ? volumeInfo.industryIdentifiers.find((id) => id.type === "ISBN_13")?.identifier ||
                    volumeInfo.industryIdentifiers.find((id) => id.type === "ISBN_10")?.identifier
                    : null,
            }
        })

        console.log(`Found ${books.length} books from Google Books API`)
        return books
    } catch (error) {
        console.error("Google Books API error:", error.message)

        if (error.response) {
            console.error("API Response status:", error.response.status)
            console.error("API Response data:", error.response.data)
        }

        // Don't throw error, just return empty array to allow fallback
        return []
    }
}

const searchBooks = async (req, res) => {
    try {
        console.log("Search request received")
        console.log("User:", req.user)
        console.log("Query:", req.query)

        const { q: query, source = "all" } = req.query

        console.log("Raw query value:", query)
        if (!query || query.trim().length < 2) {
            console.log("Query is invalid. Returning 400.")
            return res.status(400).json({ error: "Search query must be at least 2 characters" })
        }

        const trimmedQuery = query.trim()
        let results = []

        // Search Google Books API first (unless source is explicitly 'local')
        if (source !== "local") {
            try {
                console.log("Searching Google Books API...")
                const googleBooks = await searchGoogleBooks(trimmedQuery)
                console.log("Google Books results:", googleBooks.length)

                results = googleBooks.map((book) => ({
                    id: book.googleId,
                    title: book.title,
                    authors: book.authors,
                    description: book.description,
                    thumbnail: book.thumbnail,
                    publishedDate: book.publishedDate,
                    pageCount: book.pageCount,
                    categories: book.categories,
                    source: "google",
                }))
            } catch (googleError) {
                console.error("Google Books API search error:", googleError)
                // Continue with local search even if Google fails
            }
        }

        // Search local database if no Google results or if source includes local
        if (results.length === 0 || source === "all" || source === "local") {
            try {
                console.log("Searching local database...")
                const localBooks = await Book.search(trimmedQuery, req.user.userId)
                console.log("Local search results:", localBooks.length)

                const localResults = localBooks.map((book) => ({
                    id: book.id,
                    title: book.title,
                    authors: book.author,
                    description: book.description,
                    thumbnail: book.cover_url,
                    publishedDate: book.published_date,
                    pageCount: book.page_count,
                    source: "local",
                }))

                results = [...results, ...localResults]
            } catch (localError) {
                console.error("Local database search error:", localError)
            }
        }

        // If still no results, provide a helpful message
        if (results.length === 0) {
            console.log("No results found, providing fallback message")
            return res.json({
                success: true,
                count: 0,
                data: [],
                message: `No books found for "${trimmedQuery}". Try different search terms or check your spelling.`,
            })
        }

        console.log("Total results:", results.length)
        res.json({
            success: true,
            count: results.length,
            data: results,
        })
    } catch (error) {
        console.error("Error in searchBooks:", error)
        console.error("Error stack:", error.stack)
        res.status(500).json({
            error: "Failed to search books",
            details: error.message,
        })
    }
}

const getGoogleBookById = async (req, res) => {
    try {
        const { googleId } = req.params
        console.log("Fetching Google Book details from API for ID:", googleId)
        
        const url = `${GOOGLE_BOOKS_API_URL}/${googleId}`
        const params = {}
        if (GOOGLE_BOOKS_API_KEY) {
            params.key = GOOGLE_BOOKS_API_KEY
        }
        
        const response = await axios.get(url, { params })
        const item = response.data
        const volumeInfo = item.volumeInfo || {}
        const imageLinks = volumeInfo.imageLinks || {}
        
        const bookData = {
            google_id: item.id,
            title: volumeInfo.title || "Unknown Title",
            author: Array.isArray(volumeInfo.authors)
                ? volumeInfo.authors.join(", ")
                : volumeInfo.authors || "Unknown Author",
            cover_url: getHighResCoverUrl(imageLinks.thumbnail || imageLinks.smallThumbnail),
            description: volumeInfo.description || "No description available",
            genre: volumeInfo.categories && volumeInfo.categories.length > 0 ? volumeInfo.categories[0] : null,
            status: "Not in Library",
            page_count: volumeInfo.pageCount || null,
            published_date: volumeInfo.publishedDate || null,
        }
        
        res.json(bookData)
    } catch (error) {
        console.error("Error fetching Google Book by ID:", error)
        res.status(500).json({ error: "Failed to fetch Google Book details" })
    }
}

module.exports = {
    getAllBooks,
    getBooksByStatus,
    getBookById,
    addBook,
    updateBook,
    toggleFavorite,
    deleteBook,
    getDashboardData,
    searchBooks,
    getGoogleBookById,
}