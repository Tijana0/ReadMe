"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "../styles/book-detail.css"
import LightNavMenu from "../components/LightNavMenu"
import axios from "axios"

const BookView = () => {
    const { bookId } = useParams()
    const navigate = useNavigate()
    const [book, setBook] = useState(null)
    const [reviews, setReviews] = useState([])
    const [newReview, setNewReview] = useState("")
    const [newRating, setNewRating] = useState(0)
    const [editingReviewId, setEditingReviewId] = useState(null)
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
    const [showAllReviews, setShowAllReviews] = useState(false)
    const [isSubmittingReview, setIsSubmittingReview] = useState(false)
    const [averageRating, setAverageRating] = useState(0)
    const [reviewCount, setReviewCount] = useState(0)

    useEffect(() => {
        if (bookId) {
            fetchBook()
            fetchReviews()
            fetchBookRating()
        }
    }, [bookId])

    const fetchBook = async () => {
        try {
            console.log("=== FETCHING BOOK START ===")
            console.log("Book ID:", bookId)

            const token = localStorage.getItem("token")
            const response = await axios.get(`/api/books/${bookId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            console.log("Book data received:", response.data)
            setBook(response.data)
            console.log("=== FETCHING BOOK SUCCESS ===")
        } catch (error) {
            console.error("=== FETCHING BOOK ERROR ===")
            console.error("Failed to fetch book:", error)
            setBook(null)
        }
    }

    const fetchReviews = async () => {
        try {
            console.log("=== FETCHING REVIEWS START ===")
            const token = localStorage.getItem("token")
            const response = await axios.get(`/api/reviews/book/${bookId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
 
            console.log("Reviews data received:", response.data)
            // Transform reviews to match original format
            const transformedReviews = response.data.map((review) => ({
                id: review.id,
                user: review.name || review.email || review.username || "Anonymous",
                userId: review.user_id,
                comment: review.comment,
                rating: review.rating,
                created_at: review.created_at,
            }))
            setReviews(transformedReviews)
            console.log("=== FETCHING REVIEWS SUCCESS ===")
        } catch (error) {
            console.error("=== FETCHING REVIEWS ERROR ===")
            console.error("Failed to fetch reviews:", error)
            setReviews([])
        }
    }

    const fetchBookRating = async () => {
        try {
            console.log("=== FETCHING RATING START ===")
            const token = localStorage.getItem("token")
            const response = await axios.get(`/api/reviews/book/${bookId}/rating`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            console.log("Rating data received:", response.data)
            setAverageRating(response.data.average_rating || 0)
            setReviewCount(response.data.review_count || 0)
            console.log("=== FETCHING RATING SUCCESS ===")
        } catch (error) {
            console.error("=== FETCHING RATING ERROR ===")
            console.error("Failed to fetch rating:", error)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        navigate("/login")
    }
 
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
 
    const handleEditClick = (review) => {
        setEditingReviewId(review.id)
        setNewReview(review.comment)
        setNewRating(review.rating)
    }
 
    const handleCancelEdit = () => {
        setEditingReviewId(null)
        setNewReview("")
        setNewRating(0)
    }
 
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete your review?")) {
            return
        }
 
        try {
            const token = localStorage.getItem("token")
            await axios.delete(`/api/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
 
            await fetchReviews()
            await fetchBookRating()
            alert("Review deleted successfully!")
        } catch (error) {
            console.error("Failed to delete review:", error)
            alert(error.response?.data?.error || "Failed to delete review. Please try again.")
        }
    }

    const handleAddReview = async () => {
        if (!newReview.trim()) {
            alert("Please write a review before submitting.")
            return
        }
 
        if (newRating === 0) {
            alert("Please select a rating before submitting.")
            return
        }
 
        setIsSubmittingReview(true)
 
        try {
            const token = localStorage.getItem("token")
 
            if (editingReviewId) {
                // Editing existing review
                console.log("=== UPDATING REVIEW START ===")
                await axios.put(
                    `/api/reviews/${editingReviewId}`,
                    {
                        rating: newRating,
                        comment: newReview.trim(),
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    },
                )
                console.log("=== UPDATING REVIEW SUCCESS ===")
                setEditingReviewId(null)
                alert("Review updated successfully!")
            } else {
                // Creating new review
                console.log("=== SUBMITTING REVIEW START ===")
                await axios.post(
                    "/api/reviews",
                    {
                        bookId: Number.parseInt(bookId),
                        rating: newRating,
                        comment: newReview.trim(),
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    },
                )
                console.log("=== SUBMITTING REVIEW SUCCESS ===")
                alert("Review added successfully!")
            }
 
            // Reset form
            setNewReview("")
            setNewRating(0)
 
            // Refresh reviews and rating
            await fetchReviews()
            await fetchBookRating()
        } catch (error) {
            console.error("=== SUBMITTING REVIEW ERROR ===")
            console.error("Failed to add review:", error)
            console.error("Error response:", error.response?.data)
 
            const errorMessage =
                error.response?.data?.error || error.response?.data?.details || "Failed to add review. Please try again."
            alert(errorMessage)
        } finally {
            setIsSubmittingReview(false)
        }
    }

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={`book-detail-star ${i < rating ? "filled" : ""}`}>
        ⭐
      </span>
        ))
    }

    const renderInteractiveStars = (rating, onStarClick) => {
        return [...Array(5)].map((_, i) => (
            <span
                key={i}
                className={`star ${i < rating ? "filled" : ""}`}
                onClick={() => onStarClick(i + 1)}
                style={{
                    cursor: "pointer",
                    fontSize: "1.2em",
                    margin: "0 1px",
                    transition: "all 0.2s ease",
                    filter: i < rating ? "drop-shadow(0 0 2px #ffd700)" : "none",
                }}
                onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.1)"
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)"
                }}
            >
        {i < rating ? "⭐" : "☆"}
      </span>
        ))
    }

    if (!book) {
        return <div className="book-detail-loading">Loading...</div>
    }

    // Use average rating from database, fallback to book rating
    const displayRating = averageRating > 0 ? Math.round(averageRating) : book.rating || 0

    return (
        <div className="book-detail-container">
            <LightNavMenu />
            <div className="book-detail-content">
                {/* Left Column */}
                <div className="book-detail-left">
                    <div className="book-detail-info">
                        <h1 className="book-detail-title">{book.title}</h1>
                        <p className="book-detail-author">{book.author}</p>

                        <div className="book-detail-section">
                            <h2 className="book-detail-section-title">Description</h2>
                            <p className="book-detail-description">
                                {book.description && book.description.length > 222 && !isDescriptionExpanded
                                    ? `${book.description.substring(0, 222)}...`
                                    : book.description || "No description available."}
                            </p>
                            {book.description && book.description.length > 222 && (
                                <button className="read-more-btn" onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                                    {isDescriptionExpanded ? "Read Less" : "Read More"}
                                </button>
                            )}
                        </div>

                        <div className="book-detail-section">
                            <h2 className="book-detail-section-title">Genres</h2>
                            <div className="book-detail-genres">
                                {book.genre ? (
                                    <span className="book-detail-genre-tag">{book.genre}</span>
                                ) : (
                                    <span>No genres listed</span>
                                )}
                            </div>
                        </div>

                        <div className="book-detail-section">
                            <h2 className="book-detail-section-title">Status</h2>
                            <div className="book-detail-status">
                                <span className="book-detail-status-badge">{book.status}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="book-detail-right">
                    <div className="book-detail-cover-section">
                        <img
                            src={book.cover_url || "/placeholder.svg"}
                            alt={book.title ? `Cover of ${book.title}` : "Book cover"}
                            className="book-detail-cover"
                            onError={(e) => {
                                console.log("Image failed to load:", book.cover_url)
                                e.target.src = "/placeholder.svg"
                            }}
                        />

                        <div className="book-detail-rating">
                            <div>
                            {[...Array(5)].map((_, index) => (
                                <span
                                    key={index}
                                    className={`star ${index < displayRating ? "filled" : ""}`}
                                    style={{
                                        fontSize: "1.1em",
                                        margin: "0 1px",
                                        filter: index < displayRating ? "drop-shadow(0 0 1px #ffd700)" : "none",
                                    }}
                                >
                  {index < displayRating ? "⭐" : "☆"}
                </span>
                            ))}
                            </div>
                            {averageRating > 0 && (
                                <div className="book-detail-rating-summary">
                                    ({averageRating.toFixed(1)} - {reviewCount} reviews)
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="book-detail-reviews-section">
                        <h2 className="book-detail-reviews-title">Reviews</h2>

                            <div className="book-detail-reviews-list">
                                {reviews.length > 0 ? (
                                    reviews.slice(0, showAllReviews ? reviews.length : 2).map((review) => (
                                        <div key={review.id} className="book-detail-review">
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                <span className="book-detail-review-user">@{review.user}:</span>
                                                {review.userId === currentUser.id && (
                                                    <div style={{ display: "flex", gap: "8px", fontSize: "0.85em" }}>
                                                        <button 
                                                            onClick={() => handleEditClick(review)}
                                                            style={{
                                                                background: "none",
                                                                border: "none",
                                                                color: "#feffee",
                                                                cursor: "pointer",
                                                                padding: 0,
                                                                opacity: 0.8
                                                            }}
                                                        >
                                                            edit
                                                        </button>
                                                        <span style={{ opacity: 0.3 }}>|</span>
                                                        <button 
                                                            onClick={() => handleDeleteReview(review.id)}
                                                            style={{
                                                                background: "none",
                                                                border: "none",
                                                                color: "#ff6b6b",
                                                                cursor: "pointer",
                                                                padding: 0
                                                            }}
                                                        >
                                                            delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="book-detail-review-text">"{review.comment}"</span>
                                            {review.rating && (
                                                <div className="review-rating" style={{ marginTop: "5px" }}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <span
                                                            key={i}
                                                            className={`star ${i < review.rating ? "filled" : ""}`}
                                                            style={{
                                                                fontSize: "0.8em",
                                                                margin: "0 1px",
                                                                filter: i < review.rating ? "drop-shadow(0 0 1px #ffd700)" : "none",
                                                            }}
                                                        >
                                                            {i < review.rating ? "⭐" : "☆"}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="book-detail-review">
                                        <span className="book-detail-review-text">No reviews yet. Be the first to review!</span>
                                    </div>
                                )}
                            </div>

                            {reviews.length > 2 && (
                                <button className="book-detail-see-more" onClick={() => setShowAllReviews(!showAllReviews)}>
                                    {showAllReviews ? "See Less" : "+ See More"}
                                </button>
                            )}

                            <div className="book-detail-add-review">
                                <div style={{ marginBottom: "12px" }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "6px",
                                            fontWeight: "bold",
                                            color: "#FEFFEE",
                                            fontSize: "0.9em",
                                        }}
                                    >
                                        {editingReviewId ? "Edit Your Rating:" : "Your Rating:"}
                                    </label>
                                    <div className="book-detail-rating">{renderInteractiveStars(newRating, setNewRating)}</div>
                                </div>
 
                                <textarea
                                    className="book-detail-review-input"
                                    placeholder={editingReviewId ? "Edit Your Review..." : "Add Your Review..."}
                                    value={newReview}
                                    onChange={(e) => setNewReview(e.target.value)}
                                    rows={4}
                                    disabled={isSubmittingReview}
                                />
                                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                                    <button 
                                        className="book-detail-submit-review" 
                                        onClick={handleAddReview} 
                                        disabled={isSubmittingReview}
                                        style={{ flex: 1 }}
                                    >
                                        {isSubmittingReview ? "Submitting..." : (editingReviewId ? "Update Review" : "Submit Review")}
                                    </button>
                                    {editingReviewId && (
                                        <button 
                                            className="book-detail-submit-review" 
                                            onClick={handleCancelEdit} 
                                            disabled={isSubmittingReview}
                                            style={{ 
                                                backgroundColor: "transparent", 
                                                border: "1px solid #FEFFEE", 
                                                color: "#FEFFEE",
                                                flex: "0 0 auto"
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="book-detail-footer">Copyright 2025 - All rights reserved</footer>
        </div>
    )
}

export default BookView