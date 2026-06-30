"use client"

import { useNavigate, useLocation } from "react-router-dom"
import logo from "../assets/logo.png"

const NavMenu = ({ showLogo = true }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
    }

    const isActive = (path) => {
        return location.pathname.includes(path)
    }

    return (
        <header className="dashboard-header">
            {showLogo && (
                <div className="logo-section" style={{ cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
                    <img src={logo || "/placeholder.svg"} alt="ReadMe Logo" className="logo-image" />
                </div>
            )}

            <nav className="nav-menu">
                <a href="dashboard" className={`nav-link ${isActive("dashboard") ? "active" : ""}`}>
                    Dashboard
                </a>

                <span className="nav-separator">|</span>

                <a href="public-feed" className={`nav-link ${isActive("public-feed") ? "active" : ""}`}>
                    Public Feed
                </a>

                <span className="nav-separator">|</span>

                <a href="library" className={`nav-link ${isActive("library") ? "active" : ""}`}>
                    My Library
                </a>

                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </nav>
        </header>
    )
}

export default NavMenu