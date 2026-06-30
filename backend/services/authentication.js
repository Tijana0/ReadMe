const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const ACCESS_TOKEN_SECRET =
    "YOUR_SECRET_HERE"
const JWT_EXPIRES_IN = "24h"

const generateToken = (payload) => {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

const verifyToken = (token) => {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET)
    } catch (error) {
        throw new Error("Invalid token")
    }
}

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10)
}

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword)
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    console.log("Auth header:", authHeader)
    console.log("Extracted token:", token ? "Present" : "Missing")

    if (!token) {
        console.log("No token provided")
        return res.status(401).json({ error: "Access token required" })
    }

    try {
        const decoded = verifyToken(token)
        console.log("Token decoded successfully:", { userId: decoded.userId, name: decoded.name })
        req.user = decoded
        next()
    } catch (error) {
        console.log("Token verification failed:", error.message)
        return res.status(403).json({ error: "Invalid or expired token" })
    }
}

// Optional authentication - doesn't fail if no token
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (token) {
        try {
            const decoded = verifyToken(token)
            req.user = decoded
            console.log("Optional auth: Token verified for user:", decoded.userId)
        } catch (error) {
            // Token is invalid, but we continue without user
            console.log("Optional auth: Invalid token, continuing without user")
            req.user = null
        }
    } else {
        console.log("Optional auth: No token provided, continuing without user")
        req.user = null
    }
    next()
}

module.exports = {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    authenticateToken,
    optionalAuth,
}