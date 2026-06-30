const User = require("../models/userModel")
const { generateToken, hashPassword, comparePassword } = require("../services/authentication")

const register = async (req, res) => {
    try {
        const { name, surname, email, password } = req.body

        console.log("Registration request received:", { name, surname, email })

        // validation
        if (!name || !surname || !email || !password) {
            return res.status(400).json({ error: "Name, surname, email, and password are required" })
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" })
        }

        // check if user exists
        const existingUserByEmail = await User.findByEmail(email)
        if (existingUserByEmail) {
            return res.status(400).json({ error: "Email already registered" })
        }

        const existingUserByUsername = await User.findByUsername(name)
        if (existingUserByUsername) {
            return res.status(400).json({ error: "Username already taken" })
        }

        // hash password and create user
        const hashedPassword = await hashPassword(password)
        const userId = await User.create({
            name,
            surname,
            email,
            password_hash: hashedPassword,
            role: "user", // Default role
        })

        console.log("User created with ID:", userId)

        // generate token
        const token = generateToken({
            userId,
            name,
            email,
            role: "user",
        })

        res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: userId,
                name,
                surname,
                email,
                role: "user",
            },
        })
    } catch (error) {
        console.error("Registration error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body

        console.log("Login request received for email:", email)

        // validation
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" })
        }

        // find user
        const user = await User.findByEmail(email)
        if (!user) {
            console.log("User not found for email:", email)
            return res.status(401).json({ error: "Invalid credentials" })
        }

        console.log("User found:", { id: user.id, name: user.name, email: user.email })

        // checks password
        const validPassword = await comparePassword(password, user.password_hash)
        if (!validPassword) {
            console.log("Invalid password for user:", email)
            return res.status(401).json({ error: "Invalid credentials" })
        }

        // generate token
        const token = generateToken({
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role || "user",
        })

        console.log("Login successful for user:", user.id)

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                role: user.role || "user",
            },
        })
    } catch (error) {
        console.error("Login error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

const validateToken = async (req, res) => {
    try {
        console.log("Token validation request for user:", req.user.userId)

        // if here, token valid (checked by middleware)
        const user = await User.findById(req.user.userId)
        if (!user) {
            console.log("User not found during token validation:", req.user.userId)
            return res.status(404).json({ error: "User not found" })
        }

        console.log("Token validation successful for user:", user.id)

        res.json({
            valid: true,
            user: user.toJSON(),
        })
    } catch (error) {
        console.error("Token validation error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

module.exports = {
    register,
    login,
    validateToken,
}