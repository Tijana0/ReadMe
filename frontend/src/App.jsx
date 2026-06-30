import React, { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Registration"
import Dashboard from "./pages/Dashboard"
import Library from "./pages/Library"
import BookView from "./pages/BookView"
import PublicFeed from "./pages/PublicFeed"
import ErrorPage from "./pages/ErrorPage"
import FocusModeModal from "./components/FocusModeModal"

const ForgotPassword = () => <div>Forgot Password Page (Coming Soon)</div>

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token")
    if (!token) {
        return <Navigate to="/login" replace />
    }
    return <>{children}</>
}

const App = () => {
    const [showFocusModal, setShowFocusModal] = useState(false)

    useEffect(() => {
        const handleOpen = () => setShowFocusModal(true)
        const handleClose = () => setShowFocusModal(false)
        window.addEventListener("open-focus-modal", handleOpen)
        window.addEventListener("close-focus-modal", handleClose)
        return () => {
            window.removeEventListener("open-focus-modal", handleOpen)
            window.removeEventListener("close-focus-modal", handleClose)
        }
    }, [])

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/library"
                    element={
                        <ProtectedRoute>
                            <Library />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/book/:bookId"
                    element={
                        <ProtectedRoute>
                            {/* <BookDetail /> */}
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/view-book/:bookId"
                    element={
                        <ProtectedRoute>
                            <BookView />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/public-feed"
                    element={
                        <ProtectedRoute>
                            <PublicFeed />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/books/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<ErrorPage />} />
            </Routes>
            <FocusModeModal
                open={showFocusModal}
                onClose={() => setShowFocusModal(false)}
                onOpen={() => setShowFocusModal(true)}
            />
        </Router>
    )
}

export default App