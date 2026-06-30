"use client"

import { useState, useEffect } from "react"
import axios from "axios"

export default function DeleteConfirmModal({ open, onClose, book, onBookDeleted }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState(null)

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

    const handleDelete = async () => {
        setIsDeleting(true)
        setError(null)

        try {
            const response = await axios.delete(`/api/books/${book.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (response.data) {
                if (onBookDeleted) onBookDeleted(book.id)
                onClose()
            }
        } catch (error) {
            console.error("Failed to delete book:", error)
            setError(error.response?.data?.error || "Failed to delete book. Please try again.")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div
            className="focus-modal-overlay"
            style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1000 }}
        >
            <div className="add-book-modal" style={{ maxWidth: "500px", height: "auto", padding: "2rem" }}>
                <button className="focus-modal-close" onClick={onClose}>
                    ×
                </button>

                <h2 style={{ color: "#ff6b6b", marginBottom: "1.5rem" }}>DELETE BOOK</h2>

                {error && (
                    <div className="error-message" style={{ color: "#ff6b6b", marginBottom: "1rem" }}>
                        {error}
                    </div>
                )}

                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <p style={{ color: "#FEFFEE", fontSize: "1.1rem", marginBottom: "1rem" }}>
                        Are you sure you want to delete this book?
                    </p>
                    <div
                        style={{
                            background: "rgba(255, 255, 255, 0.1)",
                            padding: "1rem",
                            borderRadius: "0.5rem",
                            marginBottom: "1.5rem",
                        }}
                    >
                        <h3 style={{ color: "#FEFFEE", margin: "0 0 0.5rem 0" }}>{book.title}</h3>
                        <p style={{ color: "rgba(255, 255, 255, 0.8)", margin: 0 }}>{book.author}</p>
                    </div>
                    <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.9rem" }}>This action cannot be undone.</p>
                </div>

                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: "0.75rem 1.5rem",
                            fontSize: "1rem",
                            borderRadius: "9999px",
                            border: "1px solid #FEFFEE",
                            backgroundColor: "transparent",
                            color: "#FEFFEE",
                            cursor: "pointer",
                            transition: "background-color 0.2s, color 0.2s",
                            height: "48px", // Fixed height
                            minWidth: "120px",
                        }}
                        disabled={isDeleting}
                        onMouseOver={(e) => {
                            if (!isDeleting) {
                                e.target.style.backgroundColor = "rgba(254, 255, 238, 0.2)"
                            }
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = "transparent"
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        style={{
                            backgroundColor: "#ff6b6b",
                            color: "#FEFFEE",
                            padding: "0.75rem 1.5rem",
                            fontSize: "1rem",
                            border: "none",
                            borderRadius: "9999px",
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                            height: "48px", // Fixed height
                            minWidth: "120px",
                        }}
                        disabled={isDeleting}
                        onMouseOver={(e) => {
                            if (!isDeleting) {
                                e.target.style.backgroundColor = "#e55555"
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!isDeleting) {
                                e.target.style.backgroundColor = "#ff6b6b"
                            }
                        }}
                    >
                        {isDeleting ? "Deleting..." : "Delete Book"}
                    </button>
                </div>
            </div>
        </div>
    )
}