import React from "react"
import { useNavigate } from "react-router-dom"
import { BookOpen } from "lucide-react"
import "../styles/error-page.css"

export default function ErrorPage() {
    const navigate = useNavigate()

    return (
        <div className="error-page-wrapper">
            <div className="error-page-card">
                <div className="error-page-icon-container">
                    <BookOpen size={64} />
                </div>
                <h1 className="error-page-title">Lost in the Stacks?</h1>
                <p className="error-page-text">
                    It seems the page you are looking for has been misplaced or never written.
                </p>
                <div className="error-page-actions">
                    <button className="error-page-btn-primary" onClick={() => navigate("/dashboard")}>
                        Go to Dashboard
                    </button>
                    <button className="error-page-btn-secondary" onClick={() => navigate("/library")}>
                        My Library
                    </button>
                </div>
            </div>
        </div>
    )
}