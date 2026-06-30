"use client"

import { useState, useEffect } from "react"
import axios from "axios"

// Import profile picture options
import profilePic1 from "../assets/pp.png"
import profilePic2 from "../assets/pp-1.jpg"
import profilePic3 from "../assets/pp-2.webp"
import profilePic4 from "../assets/pp-3.jpg"
import profilePic5 from "../assets/pp-4.jpg"
import profilePic6 from "../assets/pp-5.jpg"

const ProfilePictureModal = ({ open, onClose, currentProfilePicture, onProfilePictureUpdated }) => {
    const [selectedPicture, setSelectedPicture] = useState(currentProfilePicture)
    const [isUpdating, setIsUpdating] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState("")

    const profilePictures = [
        { id: 1, src: profilePic1, name: "Profile 1" },
        { id: 2, src: profilePic2, name: "Profile 2" },
        { id: 3, src: profilePic3, name: "Profile 3" },
        { id: 4, src: profilePic4, name: "Profile 4" },
        { id: 5, src: profilePic5, name: "Profile 5" },
        { id: 6, src: profilePic6, name: "Profile 6" },
    ]

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden"
            setSelectedPicture(currentProfilePicture)
            setError(null)
            setSuccessMessage("")
        } else {
            document.body.style.overflow = ""
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [open, currentProfilePicture])

    if (!open) return null

    const token = localStorage.getItem("token")

    const handlePictureSelect = (picture) => {
        setSelectedPicture(picture.src)
        setError(null)
    }

    const handleSave = async () => {
        if (!selectedPicture) {
            setError("Please select a profile picture")
            return
        }

        setIsUpdating(true)
        setError(null)
        setSuccessMessage("")

        try {
            const response = await axios.patch(
                "/api/users/profile",
                { profilePicture: selectedPicture },
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            )

            if (response.data) {
                setSuccessMessage("Profile picture updated successfully!")

                // Update the user in localStorage
                const user = JSON.parse(localStorage.getItem("user") || "{}")
                const updatedUser = { ...user, profilePicture: selectedPicture }
                localStorage.setItem("user", JSON.stringify(updatedUser))

                // Notify parent component
                if (onProfilePictureUpdated) {
                    onProfilePictureUpdated(selectedPicture)
                }

                // Close modal after a short delay
                setTimeout(() => {
                    setSuccessMessage("")
                    onClose()
                }, 1500)
            }
        } catch (error) {
            console.error("Failed to update profile picture:", error)
            setError(error.response?.data?.error || "Failed to update profile picture. Please try again.")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleClose = () => {
        setSelectedPicture(currentProfilePicture)
        setError(null)
        setSuccessMessage("")
        onClose()
    }

    return (
        <div
            className="focus-modal-overlay"
            style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1000 }}
        >
            <div className="add-book-modal" style={{ maxWidth: "600px", height: "auto", padding: "2rem" }}>
                <button className="focus-modal-close" onClick={handleClose}>
                    ×
                </button>

                <h2 style={{ marginBottom: "1.5rem" }}>CHANGE PROFILE PICTURE</h2>

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
                    <div
                        className="error-message"
                        style={{
                            color: "#ff6b6b",
                            marginBottom: "1rem",
                            background: "rgba(255, 107, 107, 0.1)",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            border: "1px solid rgba(255, 107, 107, 0.3)",
                        }}
                    >
                        {error}
                    </div>
                )}

                <div
                    className="profile-pictures-grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "1rem",
                        marginBottom: "2rem",
                    }}
                >
                    {profilePictures.map((picture) => (
                        <div
                            key={picture.id}
                            className="profile-picture-option"
                            style={{
                                position: "relative",
                                cursor: "pointer",
                                borderRadius: "50%",
                                overflow: "hidden",
                                border: selectedPicture === picture.src ? "3px solid #FEFFEE" : "3px solid transparent",
                                transition: "all 0.2s ease",
                                aspectRatio: "1",
                            }}
                            onClick={() => handlePictureSelect(picture)}
                        >
                            <img
                                src={picture.src || "/placeholder.svg"}
                                alt={picture.name}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    transition: "transform 0.2s ease",
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.transform = "scale(1.05)"
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.transform = "scale(1)"
                                }}
                            />
                            {selectedPicture === picture.src && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        background: "rgba(254, 255, 238, 0.9)",
                                        color: "#617b72",
                                        borderRadius: "50%",
                                        width: "30px",
                                        height: "30px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "1.2rem",
                                        fontWeight: "bold",
                                    }}
                                >
                                    ✓
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                    <button
                        onClick={handleClose}
                        style={{
                            padding: "0.75rem 1.5rem",
                            fontSize: "1rem",
                            borderRadius: "9999px",
                            border: "1px solid #FEFFEE",
                            backgroundColor: "transparent",
                            color: "#FEFFEE",
                            cursor: "pointer",
                            transition: "background-color 0.2s, color 0.2s",
                            height: "48px",
                            minWidth: "120px",
                        }}
                        disabled={isUpdating}
                        onMouseOver={(e) => {
                            if (!isUpdating) {
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
                        onClick={handleSave}
                        style={{
                            backgroundColor: "#FEFFEE",
                            color: "#617b72",
                            padding: "0.75rem 1.5rem",
                            fontSize: "1rem",
                            border: "none",
                            borderRadius: "9999px",
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                            height: "48px",
                            minWidth: "120px",
                            fontWeight: "500",
                        }}
                        disabled={isUpdating || !selectedPicture}
                        onMouseOver={(e) => {
                            if (!isUpdating && selectedPicture) {
                                e.target.style.backgroundColor = "rgba(254, 255, 238, 0.9)"
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!isUpdating) {
                                e.target.style.backgroundColor = "#FEFFEE"
                            }
                        }}
                    >
                        {isUpdating ? "Updating..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProfilePictureModal