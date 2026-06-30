"use client"

import { useState, useEffect } from "react"
import axios from "axios"

export default function EditBookModal({ open, onClose, book, onBookUpdated }) {
    const [formData, setFormData] = useState({
        status: "Want to Read",
        format: "Physical",
        is_favorite: false,
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState("")

    useEffect(() => {
        if (book && open) {
            setFormData({
                status: book.status || "Want to Read",
                format: book.format || "Physical",
                is_favorite: book.is_favorite || false,
            })
        }
    }, [book, open])

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

    if (!open || !book) return null

    const token = localStorage.getItem("token")

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        setSuccessMessage("")

        try {
            const response = await axios.put(`http://localhost:3001/api/books/${book.id}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (response.data) {
                setSuccessMessage("Book updated successfully!")
                if (onBookUpdated) onBookUpdated({ ...book, ...formData })

                // Close modal after a short delay
                setTimeout(() => {
                    setSuccessMessage("")
                    onClose()
                }, 1500)
            }
        } catch (error) {
            console.error("Failed to update book:", error)
            setError(error.response?.data?.error || "Failed to update book. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const statusOptions = ["Want to Read", "Currently Reading", "Read"]
    const formatOptions = ["Physical", "E-Book", "Audiobook"]

    return (
        <div
            className="focus-modal-overlay"
            style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1000 }}
        >
            <div className="add-book-modal" style={{ textAlign: "center" }}>
                <button
                    className="focus-modal-close"
                    onClick={() => {
                        setSuccessMessage("")
                        onClose()
                    }}
                >
                    ×
                </button>
                <h2>EDIT BOOK</h2>

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
                    <div className="error-message" style={{ color: "#ff6b6b", marginBottom: "1rem" }}>
                        {error}
                    </div>
                )}

                {/* Read-only book information */}
                <div className="add-book-field" style={{ textAlign: "center" }}>
                    <label>Title:</label>
                    <div
                        style={{
                            color: "#FEFFEE",
                            fontSize: "1.1rem",
                            padding: "0.5rem 0",
                            borderBottom: "1px solid rgba(254, 255, 238, 0.3)",
                            marginBottom: "0.5rem",
                        }}
                    >
                        {book.title}
                    </div>
                </div>

                <div className="add-book-field" style={{ textAlign: "center" }}>
                    <label>Author:</label>
                    <div
                        style={{
                            color: "#FEFFEE",
                            fontSize: "1.1rem",
                            padding: "0.5rem 0",
                            borderBottom: "1px solid rgba(254, 255, 238, 0.3)",
                            marginBottom: "0.5rem",
                        }}
                    >
                        {book.author}
                    </div>
                </div>

                {book.genre && (
                    <div className="add-book-field" style={{ textAlign: "center" }}>
                        <label>Genre:</label>
                        <div
                            style={{
                                color: "#FEFFEE",
                                fontSize: "1.1rem",
                                padding: "0.5rem 0",
                                borderBottom: "1px solid rgba(254, 255, 238, 0.3)",
                                marginBottom: "0.5rem",
                            }}
                        >
                            {book.genre}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="add-book-field" style={{ textAlign: "center" }}>
                        <label>Status:</label>
                        <div
                            className="button-group"
                            style={{
                                display: "flex",
                                gap: "0.5rem",
                                flexWrap: "nowrap",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            {statusOptions.map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    className={`pill-button ${formData.status === status ? "active" : ""}`}
                                    onClick={() => setFormData((prev) => ({ ...prev, status }))}
                                    style={{ whiteSpace: "nowrap" }}
                                >
                                    {status === "Currently Reading" ? "Reading" : status === "Want to Read" ? "TBR" : status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="add-book-field" style={{ textAlign: "center" }}>
                        <label>Format:</label>
                        <div
                            className="button-group"
                            style={{
                                display: "flex",
                                gap: "0.5rem",
                                flexWrap: "nowrap",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            {formatOptions.map((format) => (
                                <button
                                    key={format}
                                    type="button"
                                    className={`pill-button ${formData.format === format ? "active" : ""}`}
                                    onClick={() => setFormData((prev) => ({ ...prev, format }))}
                                    style={{ whiteSpace: "nowrap" }}
                                >
                                    {format}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="add-book-field" style={{ textAlign: "center" }}>
                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                cursor: "pointer",
                                justifyContent: "center",
                            }}
                        >
                            <input
                                type="checkbox"
                                name="is_favorite"
                                checked={formData.is_favorite}
                                onChange={handleInputChange}
                                style={{ margin: 0 }}
                            />
                            Mark as Favorite
                        </label>
                    </div>

                    <button type="submit" className="log-book-btn" disabled={isSubmitting}>
                        {isSubmitting ? "Updating Book..." : "Update Book"}
                    </button>
                </form>
            </div>
        </div>
    )
}