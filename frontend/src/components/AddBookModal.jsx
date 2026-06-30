"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import axios from "axios"

export default function AddBookModal({ open, onClose, onBookAdded }) {
  const [bookTitle, setBookTitle] = useState("")
  const [status, setStatus] = useState("Want to Read") // Default status
  const [format, setFormat] = useState("Physical") // Default format
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  const token = localStorage.getItem("token")

  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    if (!bookTitle.trim()) return

    setIsSearching(true)
    setShowResults(true)
    setError(null)

    try {
      console.log("Searching for books:", bookTitle.trim())

      const response = await axios.get("/api/books/search", {
        params: { q: bookTitle.trim() },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Search response:", response.data)

      if (response?.data?.success && Array.isArray(response.data.data)) {
        const booksData = response.data.data
        setSearchResults(
            booksData.map((book) => ({
              id: book.id || book.googleId,
              title: book.title || "Untitled",
              authors: book.authors || "Unknown author",
              thumbnail: book.thumbnail || "/placeholder.svg",
              description: book.description || "No description available",
              pageCount: book.pageCount || null,
              publishedDate: book.publishedDate || null,
              categories: book.categories || [],
              source: book.source || "unknown",
            })),
        )
      } else {
        console.log("No valid data in response")
        setSearchResults([])
        if (response.data.message) {
          setError(response.data.message)
        }
      }
    } catch (error) {
      console.error("Search failed:", error)
      setSearchResults([])

      if (error.response?.status === 401) {
        setError("Authentication failed. Please log in again.")
        // Optionally redirect to login
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
      } else if (error.response?.data?.error) {
        setError(error.response.data.error)
      } else {
        setError("Failed to search for books. Please check your internet connection and try again.")
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleResultClick = (book) => {
    console.log("Selected book:", book)
    setSelectedBook(book)
    setBookTitle(book.title)
    setShowResults(false)
    setSearchResults([])
    setError(null)
  }

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(e)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setBookTitle(value)

    // Clear error when user starts typing again
    if (error) {
      setError(null)
    }

    // Hide results when input is cleared
    if (!value.trim()) {
      setShowResults(false)
      setSearchResults([])
      setSelectedBook(null)
    }
  }

  const handleLogBook = async () => {
    if (!selectedBook) {
      setError("Please search for and select a book first")
      return
    }

    if (!token) {
      setError("Authentication required. Please log in again.")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage("")

    try {
      console.log("=== FRONTEND ADD BOOK START ===")
      console.log("Selected book:", selectedBook)
      console.log("Status:", status)
      console.log("Format:", format)

      // Prepare the book data with proper validation
      const bookData = {
        google_id: selectedBook.source === "google" ? selectedBook.id : null,
        title: selectedBook.title || "Untitled",
        author: selectedBook.authors || "Unknown Author",
        cover_url:
            selectedBook.thumbnail && selectedBook.thumbnail !== "/placeholder.svg" ? selectedBook.thumbnail : null,
        status: status,
        description: selectedBook.description || null,
        page_count: selectedBook.pageCount || null,
        published_date: selectedBook.publishedDate || null,
        format: format,
        genre: selectedBook.categories && selectedBook.categories.length > 0 ? selectedBook.categories[0] : null,
      }

      console.log("Sending book data:", bookData)

      const response = await axios.post("/api/books", bookData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Add book response:", response.data)

      if (response.data) {
        // Notify parent component that a book was added
        if (onBookAdded) onBookAdded(response.data.book)
        // Show success message
        setSuccessMessage("Book added successfully!")

        // Reset form fields after a short delay
        setTimeout(() => {
          setBookTitle("")
          setSelectedBook(null)
          setStatus("Want to Read")
          setFormat("Physical")
          setSearchResults([])
          setShowResults(false)
          setSuccessMessage("")
          onClose()
        }, 1500)
      }
    } catch (error) {
      console.error("=== FRONTEND ADD BOOK ERROR ===")
      console.error("Failed to add book:", error)
      console.error("Error response:", error.response?.data)

      if (error.response?.status === 401) {
        setError("Authentication failed. Please log in again.")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
      } else if (error.response?.data?.error) {
        setError(error.response.data.error)
      } else if (error.response?.status === 500) {
        setError("Server error. Please check that all required fields are filled and try again.")
      } else {
        setError("Failed to add book. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    // Reset all state when closing
    setBookTitle("")
    setSelectedBook(null)
    setStatus("Want to Read")
    setFormat("Physical")
    setSearchResults([])
    setShowResults(false)
    setError(null)
    setSuccessMessage("")
    onClose()
  }

  return (
      <div
          className="focus-modal-overlay"
          style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1000 }}
      >
        <div className="add-book-modal">
          <button className="focus-modal-close" onClick={handleClose}>
            ×
          </button>
          <h2>ADD BOOK</h2>

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

          <div className="add-book-field">
            <label htmlFor="book-search">Book:</label>
            <div className="search-container">
              <div className="search-input-wrapper">
                <input
                    id="book-search"
                    type="text"
                    value={bookTitle}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Search for a book..."
                    autoComplete="off"
                />
                <button
                    type="button"
                    className="search-icon-btn"
                    onClick={handleSearch}
                    style={{ background: "none", border: "none", padding: 0, margin: 0 }}
                    tabIndex={-1}
                >
                  <Search className="search-icon" size={20} />
                </button>
              </div>

              {isSearching && (
                  <div className="search-status" style={{ color: "rgba(255, 255, 255, 0.8)", marginTop: "0.5rem" }}>
                    Searching Google Books and your library...
                  </div>
              )}

              {showResults && searchResults.length > 0 && (
                  <div className="search-results-dropdown">
                    {searchResults.map((book) => (
                        <div
                            key={`${book.source}-${book.id}`}
                            className="search-result-item"
                            onClick={() => handleResultClick(book)}
                            tabIndex={0}
                            style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "8px 0" }}
                        >
                          <img
                              src={book.thumbnail || "/placeholder.svg"}
                              alt={book.title}
                              style={{ width: 32, height: 48, objectFit: "cover", marginRight: 12 }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: "bold", marginBottom: "2px" }}>{book.title}</div>
                            <div style={{ fontSize: "0.9em", color: "#666", marginBottom: "2px" }}>{book.authors}</div>
                            {book.source && (
                                <div style={{ fontSize: "0.8em", color: "#888", textTransform: "capitalize" }}>
                                  Source: {book.source === "google" ? "Google Books" : "Your Library"}
                                </div>
                            )}
                          </div>
                        </div>
                    ))}
                  </div>
              )}

              {showResults && searchResults.length === 0 && !isSearching && (
                  <div className="search-status" style={{ color: "rgba(255, 255, 255, 0.7)", marginTop: "0.5rem" }}>
                    No books found. Try a different search term.
                  </div>
              )}
            </div>
          </div>

          <div className="add-book-field">
            <label>Status:</label>
            <div className="button-group">
              <button className={`pill-button ${status === "Read" ? "active" : ""}`} onClick={() => setStatus("Read")}>
                Read
              </button>
              <button
                  className={`pill-button ${status === "Currently Reading" ? "active" : ""}`}
                  onClick={() => setStatus("Currently Reading")}
              >
                Reading
              </button>
              <button
                  className={`pill-button ${status === "Want to Read" ? "active" : ""}`}
                  onClick={() => setStatus("Want to Read")}
              >
                TBR
              </button>
            </div>
          </div>

          <div className="add-book-field">
            <label>Format:</label>
            <div className="button-group">
              <button
                  className={`pill-button ${format === "Physical" ? "active" : ""}`}
                  onClick={() => setFormat("Physical")}
              >
                Physical
              </button>
              <button
                  className={`pill-button ${format === "E-Book" ? "active" : ""}`}
                  onClick={() => setFormat("E-Book")}
              >
                E-Book
              </button>
              <button
                  className={`pill-button ${format === "Audiobook" ? "active" : ""}`}
                  onClick={() => setFormat("Audiobook")}
              >
                Audiobook
              </button>
            </div>
          </div>

          <button className="log-book-btn" onClick={handleLogBook} disabled={isSubmitting || !selectedBook}>
            {isSubmitting ? "Adding Book..." : "Log Book"}
          </button>
        </div>
      </div>
  )
}