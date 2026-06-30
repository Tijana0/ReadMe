import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

export default function ErrorPage() {
    const navigate = useNavigate();

    return (
        <div className="error-page-container">
            <div>
                <h1>Oopsies! Something went wrong.</h1>
                <p>We couldn't find the page you were looking for.</p>
                <button onClick={() => navigate("/dashboard")}>
                    Go Back to Dashboard
                </button>
            </div>
        </div>
    );
}