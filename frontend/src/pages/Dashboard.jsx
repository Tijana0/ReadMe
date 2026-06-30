"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/dashboard.css"

import AddBookModal from "../components/AddBookModal"
import ProfilePictureModal, { getProfilePicture } from "../components/ProfilePictureModal"
import NavMenu from "../components/NavMenu"
import axios from "axios"
import { FaEdit } from "react-icons/fa"
import ManageFavoritesModal from "../components/ManageFavoritesModal"

// Import all images
import defaultProfileImage from "../assets/pp.png"
import chartImage from "../assets/chart.jpeg"

const Dashboard = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)

    const [showAddBookModal, setShowAddBookModal] = useState(false)
    const [showProfilePictureModal, setShowProfilePictureModal] = useState(false)
    const [editingDescription, setEditingDescription] = useState(false)
    const [description, setDescription] = useState("")
    const [descInput, setDescInput] = useState("")
    const [descError, setDescError] = useState("")
    const [profilePicture, setProfilePicture] = useState(defaultProfileImage)
    const [currentlyReading, setCurrentlyReading] = useState(null)
    const [books, setBooks] = useState([]) // Same as Library page - all books
    const [myBooksLoading, setMyBooksLoading] = useState(true)
    const [myBooksError, setMyBooksError] = useState(null)
    const [showManageFavoritesModal, setShowManageFavoritesModal] = useState(false)
    const [favoriteBooks, setFavoriteBooks] = useState([])

    const fetchBooks = async () => {
        try {
            setMyBooksLoading(true)
            setMyBooksError(null)

            const token = localStorage.getItem("token")
            const response = await axios.get("/api/books", {
                headers: { Authorization: `Bearer ${token}` },
            })

            console.log("Dashboard books response:", response.data)
            setBooks(response.data)
        } catch (error) {
            console.error("Failed to fetch books for dashboard:", error)
            setMyBooksError("Failed to load books")
            setBooks([])
        } finally {
            setMyBooksLoading(false)
        }
    }

    const fetchFavoriteBooks = async () => {
        try {
            const token = localStorage.getItem("token")
            const response = await axios.get("/api/books", {
                headers: { Authorization: `Bearer ${token}` },
            })

            // Filter for favorite books and limit to 4
            const favorites = response.data.filter((book) => book.is_favorite).slice(0, 4)
            setFavoriteBooks(favorites)
        } catch (error) {
            console.error("Failed to fetch favorite books:", error)
            setFavoriteBooks([])
        }
    }

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                console.log("Fetching user profile...")
                const token = localStorage.getItem("token")
                const response = await axios.get("/api/users/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                console.log("User profile response:", response.data)
                setUser(response.data)
                setDescription(response.data.description || "")
                setProfilePicture(getProfilePicture(response.data.profilePicture))
                localStorage.setItem("user", JSON.stringify(response.data))
            } catch (error) {
                console.error("Failed to fetch user profile:", error)
                if (error.response?.status === 401) {
                    navigate("/login")
                }
            }
        }

        const fetchCurrentlyReading = async () => {
            try {
                const token = localStorage.getItem("token")
                const response = await axios.get("/api/books/status/Currently Reading", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (response.data && response.data.length > 0) {
                    setCurrentlyReading(response.data[0])
                }
            } catch (error) {
                console.error("Failed to fetch currently reading book:", error)
            }
        }

        // Check if user is logged in
        const token = localStorage.getItem("token")
        if (!token) {
            console.log("No token found, redirecting to login")
            navigate("/login")
            return
        }

        fetchUserProfile()
        fetchCurrentlyReading()
        fetchBooks()
        fetchFavoriteBooks() // Add this line
    }, [navigate])

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
    }

    const handleBookClick = (book) => {
        // Same navigation logic as Library page
        navigate(`/view-book/${book.id}`)
    }

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={`star ${i < Math.floor(rating) ? "" : "empty"}`}>
        ⭐
      </span>
        ))
    }

    const handleMyBooksClick = () => {
        navigate("/library")
    }

    const handleDescriptionClick = () => {
        setDescInput(description)
        setEditingDescription(true)
        setDescError("")
    }

    const handleDescriptionSave = async () => {
        if (descInput.length > 170) {
            setDescError("Description must be 170 characters or less.")
            return
        }
        try {
            const token = localStorage.getItem("token")
            await axios.patch(
                "/api/users/profile",
                { description: descInput },
                { headers: { Authorization: `Bearer ${token}` } },
            )
            setDescription(descInput)
            setEditingDescription(false)
            // Update localStorage user
            const updatedUser = { ...user, description: descInput }
            setUser(updatedUser)
            localStorage.setItem("user", JSON.stringify(updatedUser))
        } catch (err) {
            console.error("Failed to update description:", err)
            setDescError("Failed to update description.")
        }
    }

    const handleProfilePictureUpdated = (newProfilePictureId) => {
        setProfilePicture(getProfilePicture(newProfilePictureId))
        // Update user state
        const updatedUser = { ...user, profilePicture: newProfilePictureId }
        setUser(updatedUser)
    }

    const handleBookAdded = () => {
        console.log("Book added, refreshing books...")
        fetchBooks() // Refresh books when a new one is added
    }

    const handleFavoritesUpdated = (updatedFavorites) => {
        console.log("Favorites updated, refreshing...")
        setFavoriteBooks(updatedFavorites)
        fetchFavoriteBooks() // Refresh to ensure consistency
    }

    const renderCurrentlyReading = () => {
        if (!currentlyReading) {
            return (
                <div className="current-read-section">
                    <h2 className="section-title">Currently Reading:</h2>
                    <p style={{ color: "#666" }}>No books currently being read. Start a new book!</p>
                </div>
            )
        }

        return (
            <div className="current-read-section">
                <h2 className="section-title">Currently Reading:</h2>
                <div
                    className="current-read-content book-clickable"
                    onClick={() => handleBookClick(currentlyReading)}
                    style={{ cursor: "pointer" }}
                >
                    <div className="current-read-cover">
                        <img
                            src={currentlyReading.cover_url || "/placeholder.svg"}
                            alt={currentlyReading.title ? `Cover of ${currentlyReading.title}` : "Book cover"}
                            className="book-cover"
                        />
                    </div>

                    <div className="current-read-info">
                        <h3 className="current-read-title">{currentlyReading.title}</h3>
                        <p className="current-read-author">{currentlyReading.author}</p>

                        <div className="book-details">
                            <p>
                                <strong>Status:</strong> {currentlyReading.status}
                            </p>
                            {currentlyReading.date_added && (
                                <p>
                                    <strong>Started:</strong> {new Date(currentlyReading.date_added).toLocaleDateString()}
                                </p>
                            )}
                            {currentlyReading.last_read_date && (
                                <p>
                                    <strong>Last Read:</strong> {new Date(currentlyReading.last_read_date).toLocaleDateString()}
                                </p>
                            )}
                            {currentlyReading.page_count && (
                                <p>
                                    <strong>Pages:</strong> {currentlyReading.page_count}
                                </p>
                            )}
                            {currentlyReading.genre && (
                                <p>
                                    <strong>Genre:</strong> {currentlyReading.genre}
                                </p>
                            )}
                            {currentlyReading.format && (
                                <p>
                                    <strong>Format:</strong> {currentlyReading.format}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderMyBooks = () => {
        if (myBooksLoading) {
            return (
                <div className="book-section">
                    <h2 className="section-title">My Books:</h2>
                    <p style={{ color: "#666", padding: "20px 0" }}>Loading books...</p>
                </div>
            )
        }

        if (myBooksError) {
            return (
                <div className="book-section">
                    <h2 className="section-title">My Books:</h2>
                    <div>
                        <p style={{ color: "#c00", marginBottom: "8px" }}>Error: {myBooksError}</p>
                        <button
                            onClick={fetchBooks}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#617B72",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )
        }

        if (books.length === 0) {
            return (
                <div className="book-section">
                    <h2 className="section-title">My Books:</h2>
                    <div>
                        <p style={{ color: "#666" }}>No books in your library yet.</p>
                        <p style={{ color: "#999", fontSize: "14px" }}>Add some books to see them here!</p>
                    </div>
                </div>
            )
        }

        // Get the last 4 books (most recently added) - same logic as Library but limited to 4
        const recentBooks = books.slice(0, 4)

        return (
            <div className="book-section">
                <h2 className="section-title">My Books:</h2>
                <div className="books-grid">
                    {recentBooks.map((book) => (
                        <div key={book.id} className="book-item book-clickable" onClick={() => handleBookClick(book)}>
                            <img src={book.cover_url || "/placeholder.svg"} alt={book.title ? `Cover of ${book.title}` : "Book cover"} className="book-cover" />
                        </div>
                    ))}
                </div>
                <button className="see-more-btn" onClick={handleMyBooksClick}>
                    + See All
                </button>
            </div>
        )
    }

    return (
        <div className="dashboard-container">
            <NavMenu />

            <div className="dashboard-content">
                <div className="main-layout">
                    {/* Left Column */}
                    <div className="left-column">
                        {/* Profile Section */}
                        <div className="profile-section">
                            <div className="profile-image profile-image-hover" onClick={() => setShowProfilePictureModal(true)}>
                                <img src={profilePicture || "/placeholder.svg"} alt="Profile picture" />
                                <div className="profile-image-overlay">
                                    <span>Change Profile Picture</span>
                                </div>
                            </div>

                            <div className="profile-info">
                                <h1 className="profile-name">{user ? `${user.name} ${user.surname}` : "Jane Doe"}</h1>
                                {/* Description section */}
                                {!editingDescription ? (
                                    <div
                                        style={{
                                            color: description ? "#333" : "#aaa",
                                            minHeight: 24,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                        }}
                                    >
                    <span style={{ cursor: "pointer" }} onClick={handleDescriptionClick}>
                      {description ? description : "Add description..."}
                    </span>
                                        {description && (
                                            <button
                                                onClick={handleDescriptionClick}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    padding: 0,
                                                    marginLeft: 4,
                                                    cursor: "pointer",
                                                    color: "#617B72",
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                                title="Edit description"
                                            >
                                                <FaEdit size={18} />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label htmlFor="dashboard-description" style={{ position: 'absolute', left: '-9999px' }}>Description</label>
                    <textarea
                        id="dashboard-description"
                        className="dashboard-description-input"
                        placeholder="Add your description..."
                        value={descInput}
                        onChange={(e) => setDescInput(e.target.value)}
                        maxLength={170}
                        rows={3}
                        style={{ resize: "vertical" }}
                        autoFocus
                    />
                                        <div className="dashboard-description-buttons">
                                            <button className="dashboard-save-description" onClick={handleDescriptionSave}>
                                                Save
                                            </button>
                                            <button className="dashboard-cancel-description" onClick={() => setEditingDescription(false)}>
                                                Cancel
                                            </button>
                                        </div>
                                        {descError && <span style={{ color: "#c00", fontSize: 12 }}>{descError}</span>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button className="action-btn" onClick={() => setShowAddBookModal(true)}>
                                <span>+</span>
                                <span>Add Book</span>
                            </button>
                            <button className="action-btn" onClick={() => setShowManageFavoritesModal(true)}>
                                <span>♡</span>
                                <span>Manage Favorites</span>
                            </button>
                            <button className="action-btn" onClick={() => window.dispatchEvent(new CustomEvent('open-focus-modal'))}>
                                <span>⏱</span>
                                <span>Focused Reading</span>
                            </button>
                        </div>

                        {/* My Books Section - Same as Library page logic */}
                        {renderMyBooks()}

                        {/* Favorites Shelf */}
                        <div className="book-section">
                            <h2 className="section-title">Favorites Shelf:</h2>
                            {favoriteBooks.length === 0 ? (
                                <div>
                                    <p style={{ color: "#666" }}>No favorite books yet.</p>
                                    <p style={{ color: "#999", fontSize: "14px" }}>Use "Manage Favorites" to add some!</p>
                                </div>
                            ) : (
                                <div className="books-grid">
                                    {favoriteBooks.map((book) => (
                                        <div key={book.id} className="book-item book-clickable" onClick={() => handleBookClick(book)}>
                                            <img src={book.cover_url || "/placeholder.svg"} alt={book.title ? `Cover of ${book.title}` : "Book cover"} className="book-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="right-column">
                        {/* Currently Reading */}
                        {renderCurrentlyReading()}

                        {/* Yearly Stats */}
                        <div>
                            <h2 className="section-title">Yearly Stats:</h2>
                            <div className="stats-section">
                                <img
                                    src={chartImage || "/placeholder.svg"}
                                    alt="Yearly Reading Stats Chart"
                                    className="stats-chart-image"
                                />
                                <p>Genre distribution stats among readers from example-source.com.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="dashboard-footer">Copyright 2025 - All rights reserved</footer>


            <AddBookModal open={showAddBookModal} onClose={() => setShowAddBookModal(false)} onBookAdded={handleBookAdded} />
            <ProfilePictureModal
                open={showProfilePictureModal}
                onClose={() => setShowProfilePictureModal(false)}
                currentProfilePicture={profilePicture}
                onProfilePictureUpdated={handleProfilePictureUpdated}
            />
            <ManageFavoritesModal
                open={showManageFavoritesModal}
                onClose={() => setShowManageFavoritesModal(false)}
                onFavoritesUpdated={handleFavoritesUpdated}
            />
        </div>
    )
}

export default Dashboard