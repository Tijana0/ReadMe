import { useLocation, useNavigate, Link } from "react-router-dom";
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
                <Link to="/dashboard" className={`nav-link-light ${isActive('dashboard') ? 'active' : ''}`}>
                    Dashboard
                </Link>
                <span className="nav-separator-light">|</span>
                <Link to="/public-feed" className={`nav-link-light ${isActive('public-feed') ? 'active' : ''}`}>
                    Public Feed
                </Link>
                <span className="nav-separator-light">|</span>
                <Link to="/library" className={`nav-link-light ${isActive('library') ? 'active' : ''}`}>
                    My Library
                </Link>
                <span className="nav-separator-light">|</span>
                <Link to="/search" className={`nav-link-light ${isActive('search') ? 'active' : ''}`}>
                    Search
                </Link>
                <button onClick={handleLogout} className="logout-btn-light">
                    Logout
                </button>
            </nav>
        </header>
    );
};

export default LightNavMenu; 