import {useLocation, useNavigate} from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/light-nav-menu.css";

const LightNavMenu = ({ showLogo = true }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const isActive = (path) => {
        return location.pathname.includes(path);
    };

    return (
        <header className="dashboard-header">
            {showLogo && (
                <div className="logo-section" style={{cursor: 'pointer'}} onClick={() => navigate('/dashboard')}>
                    <img src={logo || "/placeholder.svg"} alt="ReadMe Logo" className="logo-image" />
                </div>
            )}

            <nav className="nav-menu">
                <a href="/dashboard" className={`nav-link-light ${isActive('dashboard') ? 'active' : ''}`}>
                    Dashboard
                </a>
                <span className="nav-separator-light">|</span>
                <a href="/public-feed" className={`nav-link-light ${isActive('public-feed') ? 'active' : ''}`}>
                    Public Feed
                </a>
                <span className="nav-separator-light">|</span>
                <a href="/library" className={`nav-link-light ${isActive('library') ? 'active' : ''}`}>
                    My Library
                </a>
                <button onClick={handleLogout} className="logout-btn-light">
                    Logout
                </button>
            </nav>
        </header>
    );
};

export default LightNavMenu; 