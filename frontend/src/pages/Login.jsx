"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/auth.css"
import logo from "../assets/logo.png"

const Login = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Login failed")
            }

            if (data.token) {
                // store token in localStorage
                localStorage.setItem("user", JSON.stringify({
                    ...data.user,
                    token: data.token
                }));
                localStorage.setItem("token", data.token);

                // Redirect to dashboard
                navigate("/dashboard")
            } else {
                throw new Error("No token received")
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred during login")
        } finally {
            setIsLoading(false)
        }
    }

        return (

            <div className="auth-container">
                <div className="logo-section">
                    <img src={logo || "/placeholder.svg"} alt="ReadMe Logo" className="logo-image" />
                </div>


                <div className="login-form">
                    <h1>LOG IN</h1>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="info-input">
                            <label>E-mail:</label>
                            <input
                                type="email"
                                name="email"
                                className="line-input"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="info-input">
                            <label>Password:</label>
                            <input
                                type="password"
                                name="password"
                                className="line-input"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-buttons">
                            <button type="submit" className="main-btn" disabled={isLoading}>
                                {isLoading ? "Logging in..." : "Log in"}
                            </button>
                            <a href="/register" className="second-btn">
                                Sign up
                            </a>
                        </div>
                    </form>
                </div>
            </div>

        );
}

export default Login