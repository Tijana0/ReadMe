"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/library.css"
import NavMenu from "../components/NavMenu"
import axios from "axios"
import EditBookModal from "../components/EditBookModal"
import DeleteConfirmModal from "../components/DeleteConfirmModal"

const Library = () => {
    const navigate = useNavigate()
    const [activeFilter, setActiveFilter] = useState("See All")
    const [books, setBooks] = useState([])
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedBook, setSelectedBook] = useState(null)

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const token = localStorage.getItem("token")
                const response = await axios.get("/api/books", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setBooks(response.data) // Adjust if your backend returns { books: [...] }
            } catch (error) {
                console.error("Failed to fetch books:", error)
            }
        }
        fetchBooks()
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
    }

    const handleBookClick = (book) => {
        if (book.route) {
            navigate(book.route)
            return
        }
        navigate(`/view-book/${book.id}`)
    }

    const filterOptions = ["See All", "Currently Reading", "Read", "Want to Read"] // , "DNF"

    const filteredBooks = books.filter((book) => {
        if (activeFilter === "See All") return true
        return book.status === activeFilter
    })

    const renderStars = (rating, total) => {
        return [...Array(total)].map((_, i) => (
            <span key={i} className={`library-star ${i < rating ? "" : "library-empty"}`}>
        ⭐
      </span>
        ))
    }

    const handleEdit = (book, e) => {
        e.stopPropagation()
        setSelectedBook(book)
        setShowEditModal(true)
    }

    const handleDelete = (book, e) => {
        e.stopPropagation()
        setSelectedBook(book)
        setShowDeleteModal(true)
    }

    const handleBookUpdated = (updatedBook) => {
        setBooks((prevBooks) => prevBooks.map((book) => (book.id === updatedBook.id ? updatedBook : book)))
    }

    const handleBookDeleted = (deletedBookId) => {
        setBooks((prevBooks) => prevBooks.filter((book) => book.id !== deletedBookId))
    }

    return (
        <div className="library-page">
            <NavMenu />

            <div className="library-content-wrapper">
                {/* Sidebar */}
                <aside className="library-sidebar">
                    <ul className="library-sidebar-nav">
                        {filterOptions.map((option) => (
                            <li key={option}>
                                <button
                                    className={`library-sidebar-link ${activeFilter === option ? "library-active" : ""}`}
                                    onClick={() => setActiveFilter(option)}
                                >
                                    {option}
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Main Content */}
                <main className="library-main-content">
                    <h1 className="library-page-title">My Library</h1>

                    <div className="library-books-list">
                        {filteredBooks.map((book) => (
                            <div
                                key={book.id}
                                className="library-book-item library-book-clickable"
                                onClick={() => handleBookClick(book)}
                            >
                                <img src={book.cover_url || "/placeholder.svg"} alt={book.title ? `Cover of ${book.title}` : "Book cover"} className="library-book-cover" />

                                <div className="library-book-info">
                                    <div>
                                        <h3 className="library-book-title">{book.title}</h3>
                                        <p className="library-book-author">{book.author}</p>

                                        {/*<div className="library-book-meta">*/}
                                        {/*    {book.format && <span className="library-format-badge">{book.format}</span>}*/}
                                        {/*    /!*<div className="library-rating">*!/*/}
                                        {/*    /!*    {renderStars(book.rating || 0, book.totalRating || 5)}*!/*/}
                                        {/*    /!*    <span className="library-rating-text">*!/*/}
                                        {/*    /!*        {(book.rating || 0)}/{book.totalRating || 5}*!/*/}
                                        {/*    /!*    </span>*!/*/}
                                        {/*    /!*</div>*!/*/}
                                        {/*</div>*/}
                                        {/*</div>*/}
                                    </div>

                                    <div className="library-book-actions">
                                        {book.hasReview ? (
                                            <button className="library-action-btn" onClick={(e) => handleReview(book.id, e)}>
                                                📝 Review
                                            </button>
                                        ) : (
                                            <>
                                                <button className="library-action-btn" onClick={(e) => handleEdit(book, e)}>
                                                    ✏️ Edit
                                                </button>
                                                <span className="library-action-separator">|</span>
                                                <button className="library-action-btn" onClick={(e) => handleDelete(book, e)}>
                                                    🗑️ Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <footer className="library-page-footer">Copyright 2025 - All rights reserved</footer>
                </main>
            </div>
            <EditBookModal
                open={showEditModal}
                onClose={() => {
                    setShowEditModal(false)
                    setSelectedBook(null)
                }}
                book={selectedBook}
                onBookUpdated={handleBookUpdated}
            />

            <DeleteConfirmModal
                open={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false)
                    setSelectedBook(null)
                }}
                book={selectedBook}
                onBookDeleted={handleBookDeleted}
            />
        </div>
    )
}

export default Library