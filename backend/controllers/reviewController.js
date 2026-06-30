const Review = require("../models/reviewModel")
const Book = require("../models/bookModel")

const getReviewsByBook = async (req, res) => {
    try {
        const { bookId } = req.params
        console.log("Getting reviews for book ID:", bookId)

        // Check if book exists
        const book = await Book.findById(bookId)
        if (!book) {
            console.log("Book not found:", bookId)
            return res.status(404).json({ error: "Book not found" })
        }

        console.log("Book found:", book.title)
        const reviews = await Review.findByBookId(bookId)
        console.log("Reviews found:", reviews.length)

        res.json(reviews)
    } catch (error) {
        console.error("Error fetching reviews:", error)
        res.status(500).json({ error: "Failed to fetch reviews" })
    }
}

const getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.findByUserId(req.user.userId)
        res.json(reviews)
    } catch (error) {
        console.error("Error fetching user reviews:", error)
        res.status(500).json({ error: "Failed to fetch reviews" })
    }
}

const createReview = async (req, res) => {
    try {
        console.log("=== CREATE REVIEW START ===")
        console.log("Request body:", req.body)
        console.log("User from token:", req.user)

        const { bookId, rating, comment } = req.body

        // Enhanced validation
        if (!bookId) {
            console.log("Missing bookId")
            return res.status(400).json({ error: "Book ID is required" })
        }

        if (!rating) {
            console.log("Missing rating")
            return res.status(400).json({ error: "Rating is required" })
        }

        if (!comment || !comment.trim()) {
            console.log("Missing or empty comment")
            return res.status(400).json({ error: "Comment is required" })
        }

        // Type conversion and validation
        const numericBookId = Number(bookId)
        const numericRating = Number(rating)

        if (isNaN(numericBookId) || numericBookId <= 0) {
            console.log("Invalid bookId:", bookId)
            return res.status(400).json({ error: "Invalid book ID" })
        }

        if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            console.log("Invalid rating:", rating)
            return res.status(400).json({ error: "Rating must be between 1 and 5" })
        }

        // Check if book exists
        const book = await Book.findById(numericBookId)
        if (!book) {
            console.log("Book not found for ID:", numericBookId)
            return res.status(404).json({ error: "Book not found" })
        }

        // Check if user already reviewed this book
        const existingReviews = await Review.findByBookId(numericBookId)
        const userReview = existingReviews.find((review) => review.user_id === req.user.userId)

        if (userReview) {
            console.log("User already reviewed this book")
            return res.status(400).json({ error: "You have already reviewed this book" })
        }

        console.log("Creating review with data:", {
            rating: numericRating,
            comment: comment.trim(),
            book_id: numericBookId,
            user_id: req.user.userId,
        })

        // Create the review
        const reviewId = await Review.create({
            rating: numericRating,
            comment: comment.trim(),
            book_id: numericBookId,
            user_id: req.user.userId,
        })

        console.log("Review created successfully with ID:", reviewId)
        console.log("=== CREATE REVIEW SUCCESS ===")

        res.status(201).json({
            message: "Review created successfully",
            reviewId: reviewId,
        })
    } catch (error) {
        console.error("=== CREATE REVIEW ERROR ===")
        console.error("Error creating review:", error)
        console.error("Error stack:", error.stack)
        res.status(500).json({
            error: "Failed to create review",
            details: error.message,
        })
    }
}

const updateReview = async (req, res) => {
    try {
        const { id } = req.params
        const { rating, comment } = req.body

        console.log("Updating review:", { id, rating, comment, userId: req.user.userId })

        // Validation
        if (!rating && comment === undefined) {
            return res.status(400).json({ error: "Rating or comment is required" })
        }

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" })
        }

        // Check if review exists
        const review = await Review.findById(id)
        if (!review) {
            return res.status(404).json({ error: "Review not found" })
        }

        // Check if review belongs to user
        if (review.user_id !== req.user.userId) {
            return res.status(403).json({ error: "Access denied" })
        }

        const success = await Review.update(
            id,
            {
                rating: rating || review.rating,
                comment: comment !== undefined ? comment : review.comment,
            },
            req.user.userId,
        )

        if (!success) {
            return res.status(404).json({ error: "Review not found" })
        }

        console.log("Review updated successfully")
        res.json({ message: "Review updated successfully" })
    } catch (error) {
        console.error("Error updating review:", error)
        res.status(500).json({ error: "Failed to update review" })
    }
}

const deleteReview = async (req, res) => {
    try {
        const { id } = req.params
        console.log("Deleting review:", { id, userId: req.user.userId })

        const success = await Review.delete(id, req.user.userId)

        if (!success) {
            return res.status(404).json({ error: "Review not found or access denied" })
        }

        console.log("Review deleted successfully")
        res.json({ message: "Review deleted successfully" })
    } catch (error) {
        console.error("Error deleting review:", error)
        res.status(500).json({ error: "Failed to delete review" })
    }
}

const getBookRating = async (req, res) => {
    try {
        const { bookId } = req.params

        // Check if book exists
        const book = await Book.findById(bookId)
        if (!book) {
            return res.status(404).json({ error: "Book not found" })
        }

        const ratingStats = await Review.getAverageRating(bookId)
        res.json(ratingStats)
    } catch (error) {
        console.error("Error fetching book rating:", error)
        res.status(500).json({ error: "Failed to fetch rating" })
    }
}

module.exports = {
    getReviewsByBook,
    getUserReviews,
    createReview,
    updateReview,
    deleteReview,
    getBookRating,
}