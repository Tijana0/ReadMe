"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/auth.css"
import logo from "../assets/logo.png"

const Register = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        email: "",
        password: "",
        confirmPassword: "",
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

        // validate passwords
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    surname: formData.surname,
                    email: formData.email,
                    password: formData.password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Registration failed")
            }
            navigate("/login")
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred during registration")
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
                <h1>SIGN UP</h1>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="info-input">
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            className="line-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="info-input">
                        <label>Surname:</label>
                        <input
                            type="text"
                            name="surname"
                            className="line-input"
                            value={formData.surname}
                            onChange={handleChange}
                            required
                        />
                    </div>

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

                    <div className="info-input">
                        <label>Confirm:</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="line-input"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-buttons">
                        <button type="submit" className="main-btn" disabled={isLoading}>
                            {isLoading ? "Creating account..." : "Sign up"}
                        </button>
                        <a href="/login" className="second-btn">
                            Log in
                        </a>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Register