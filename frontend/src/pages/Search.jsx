import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import NavMenu from "../components/NavMenu"
import { Search as SearchIcon } from "lucide-react"
import "../styles/search.css"

export default function SearchPage() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const token = localStorage.getItem("token")

    const handleSearch = async (e) => {
        if (e) e.preventDefault()
        if (!query.trim()) return

        setIsSearching(true)
        setError(null)

        try {
            const response = await axios.get("/api/books/search", {
                params: { q: query.trim() },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.data?.success && Array.isArray(response.data.data)) {
                setResults(response.data.data)
            } else {
                setResults([])
                setError("No books found matching your query.")
            }
        } catch (error) {
            console.error("Search failed:", error)
            setError("Failed to search for books. Please try again.")
        } finally {
            setIsSearching(false)
        }
    }

    const handleViewDetails = (googleId) => {
        navigate(`/book/google/${googleId}`)
    }

    return (
        <div className="search-page-container">
            <div style={{ backgroundColor: "#feffee" }}>
                <NavMenu />
            </div>
            <div className="search-page-content">
                <h1 className="search-page-title">Search Books</h1>
                
                <form onSubmit={handleSearch} className="search-bar-form">
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            placeholder="Search by title, author, genre..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="search-page-input"
                        />
                        <button type="submit" className="search-page-btn" disabled={isSearching}>
                            <SearchIcon size={20} />
                        </button>
                    </div>
                </form>

                {error && <div className="search-error-msg">{error}</div>}

                {isSearching ? (
                    <div className="search-loading">Searching...</div>
                ) : (
                    <div className="search-results-grid">
                        {results.map((book) => (
                            <div key={book.id} className="search-result-card" onClick={() => handleViewDetails(book.id)}>
                                <img
                                    src={book.thumbnail || "/placeholder.svg"}
                                    alt={book.title}
                                    className="search-result-cover"
                                    onError={(e) => {
                                        e.target.src = "/placeholder.svg"
                                    }}
                                />
                                <div className="search-result-info">
                                    <h3 className="search-result-title">{book.title}</h3>
                                    <p className="search-result-author">{book.authors || "Unknown Author"}</p>
                                    {book.description && (
                                        <p className="search-result-description">
                                            {book.description.length > 120
                                                ? `${book.description.substring(0, 120)}...`
                                                : book.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
