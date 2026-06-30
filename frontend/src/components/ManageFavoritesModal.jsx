"use client"

import { useState, useEffect } from "react"
import { Search } from 'lucide-react'
import axios from "axios"

export default function ManageFavoritesModal({ open, onClose, onFavoritesUpdated }) {
    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [currentFavorites, setCurrentFavorites] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState("")

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden"
            fetchCurrentFavorites()
        } else {
            document.body.style.overflow = ""
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [open])

    if (!open) return null

    const token = localStorage.getItem("token")

    const fetchCurrentFavorites = async () => {
        try {
            setIsLoading(true)
            const response = await axios.get("/api/books", {
                headers: { Authorization: `Bearer ${token}` },
            })

            // Filter for favorite books
            const favorites = response.data.filter(book => book.is_favorite).slice(0, 4)
            setCurrentFavorites(favorites)
        } catch (error) {
            console.error("Failed to fetch favorites:", error)
            setError("Failed to load current favorites")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = async (e) => {
        if (e) e.preventDefault()
        if (!searchTerm.trim()) return

        setIsSearching(true)
        setShowResults(true)
        setError(null)

        try {
            // Search only in user's library (local books)
            const response = await axios.get("/api/books", {
                headers: { Authorization: `Bearer ${token}` },
            })

            // Filter books by search term and exclude already favorited books
            const filteredBooks = response.data.filter(book => {
                const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    book.author.toLowerCase().includes(searchTerm.toLowerCase())
                const notAlreadyFavorite = !currentFavorites.some(fav => fav.id === book.id)
                return matchesSearch && notAlreadyFavorite
            })

            setSearchResults(filteredBooks)
        } catch (error) {
            console.error("Search failed:", error)
            setError("Failed to search books. Please try again.")
            setSearchResults([])
        } finally {
            setIsSearching(false)
        }
    }

    const handleAddToFavorites = async (book) => {
        if (currentFavorites.length >= 4) {
            setError("You can only have 4 favorite books. Remove one first.")
            return
        }

        try {
            await axios.patch(`/api/books/${book.id}/favorite`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            })

            const updatedBook = { ...book, is_favorite: true }
            setCurrentFavorites(prev => [...prev, updatedBook])

            // Remove from search results
            setSearchResults(prev => prev.filter(b => b.id !== book.id))

            setSuccessMessage(`"${book.title}" added to favorites!`)
            setTimeout(() => setSuccessMessage(""), 3000)
        } catch (error) {
            console.error("Failed to add to favorites:", error)
            setError("Failed to add book to favorites. Please try again.")
        }
    }

    const handleRemoveFromFavorites = async (book) => {
        try {
            await axios.patch(`/api/books/${book.id}/favorite`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            })

            setCurrentFavorites(prev => prev.filter(fav => fav.id !== book.id))

            setSuccessMessage(`"${book.title}" removed from favorites!`)
            setTimeout(() => setSuccessMessage(""), 3000)
        } catch (error) {
            console.error("Failed to remove from favorites:", error)
            setError("Failed to remove book from favorites. Please try again.")
        }
    }

    const handleInputKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch(e)
        }
    }

    const handleInputChange = (e) => {
        const value = e.target.value
        setSearchTerm(value)

        if (error) {
            setError(null)
        }

        if (!value.trim()) {
            setShowResults(false)
            setSearchResults([])
        }
    }

    const handleClose = () => {
        setSearchTerm("")
        setSearchResults([])
        setShowResults(false)
        setError(null)
        setSuccessMessage("")
        if (onFavoritesUpdated) {
            onFavoritesUpdated(currentFavorites)
        }
        onClose()
    }

    return (
        <div
            className="focus-modal-overlay"
            style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1000 }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    handleClose();
                }
            }}
        >
            <div className="add-book-modal">
                <button className="focus-modal-close" onClick={handleClose}>
                    ×
                </button>
                <h2>MANAGE FAVORITES</h2>

                {successMessage && (
                    <div
                        className="success-message"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#e6f9ed",
                            color: "#217a4a",
                            border: "1px solid #b6e2c6",
                            borderRadius: 8,
                            padding: "0.75rem 1.25rem",
                            marginBottom: "1rem",
                            fontWeight: 500,
                            fontSize: "1rem",
                            gap: 8,
                        }}
                    >
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div
                        className="error-message"
                        style={{
                            color: "#ff6b6b",
                            marginBottom: "1rem",
                            background: "rgba(255, 107, 107, 0.1)",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            border: "1px solid rgba(255, 107, 107, 0.3)",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Current Favorites Section */}
                <div className="add-book-field">
                    <label>Current Favorites ({currentFavorites.length}/4):</label>
                    {isLoading ? (
                        <p style={{ color: "rgba(255, 255, 255, 0.8)" }}>Loading favorites...</p>
                    ) : currentFavorites.length === 0 ? (
                        <p style={{ color: "rgba(255, 255, 255, 0.7)" }}>No favorite books yet.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                            {currentFavorites.map((book) => (
                                <div
                                    key={book.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        background: "rgba(255, 255, 255, 0.1)",
                                        padding: "0.5rem",
                                        borderRadius: "0.5rem",
                                        gap: "0.75rem",
                                    }}
                                >
                                    <img
                                        src={book.cover_url || "/placeholder.svg"}
                                        alt={book.title}
                                        style={{ width: 32, height: 48, objectFit: "cover", borderRadius: "0.25rem" }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: "bold", color: "#FEFFEE" }}>{book.title}</div>
                                        <div style={{ fontSize: "0.9em", color: "rgba(255, 255, 255, 0.8)" }}>{book.author}</div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFromFavorites(book)}
                                        style={{
                                            background: "rgba(255, 107, 107, 0.2)",
                                            border: "1px solid #ff6b6b",
                                            color: "#ff6b6b",
                                            padding: "0.25rem 0.5rem",
                                            borderRadius: "0.25rem",
                                            cursor: "pointer",
                                            fontSize: "0.8rem",
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Search Section */}
                <div className="add-book-field">
                    <label htmlFor="book-search">Add to Favorites:</label>
                    <div className="search-container">
                        <div className="search-input-wrapper">
                            <input
                                id="book-search"
                                type="text"
                                value={searchTerm}
                                onChange={handleInputChange}
                                onKeyDown={handleInputKeyDown}
                                placeholder="Search your library..."
                                autoComplete="off"
                                disabled={currentFavorites.length >= 4}
                            />
                            <button
                                type="button"
                                className="search-icon-btn"
                                onClick={handleSearch}
                                style={{ background: "none", border: "none", padding: 0, margin: 0 }}
                                tabIndex={-1}
                                disabled={currentFavorites.length >= 4}
                            >
                                <Search className="search-icon" size={20} />
                            </button>
                        </div>

                        {currentFavorites.length >= 4 && (
                            <div style={{ color: "rgba(255, 255, 255, 0.7)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
                                Maximum of 4 favorites reached. Remove a book to add another.
                            </div>
                        )}

                        {isSearching && (
                            <div className="search-status" style={{ color: "rgba(255, 255, 255, 0.8)", marginTop: "0.5rem" }}>
                                Searching your library...
                            </div>
                        )}

                        {showResults && searchResults.length > 0 && (
                            <div className="search-results-dropdown">
                                {searchResults.map((book) => (
                                    <div
                                        key={book.id}
                                        className="search-result-item"
                                        style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "8px 0" }}
                                    >
                                        <img
                                            src={book.cover_url || "/placeholder.svg"}
                                            alt={book.title}
                                            style={{ width: 32, height: 48, objectFit: "cover", marginRight: 12 }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: "bold", marginBottom: "2px" }}>{book.title}</div>
                                            <div style={{ fontSize: "0.9em", color: "#666", marginBottom: "2px" }}>{book.author}</div>
                                            <div style={{ fontSize: "0.8em", color: "#888" }}>
                                                Status: {book.status}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddToFavorites(book)}
                                            style={{
                                                background: "#617b72",
                                                border: "none",
                                                color: "#FEFFEE",
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "0.25rem",
                                                cursor: "pointer",
                                                fontSize: "0.8rem",
                                            }}
                                        >
                                            Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {showResults && searchResults.length === 0 && !isSearching && (
                            <div className="search-status" style={{ color: "rgba(255, 255, 255, 0.7)", marginTop: "0.5rem" }}>
                                No books found in your library. Try a different search term.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}