const User = require("../models/userModel")
const Progress = require("../models/progressModel")

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        // remove password from response
        delete user.password

        res.json(user)
    } catch (error) {
        console.error("Profile fetch error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

const updateProfile = async (req, res) => {
    try {
        console.log(req.body)
        const { firstName, lastName, bio, dailyReadingGoal, description, profilePicture } = req.body

        // validation
        if (dailyReadingGoal && (dailyReadingGoal < 1 || dailyReadingGoal > 1440)) {
            return res.status(400).json({ error: "Daily reading goal must be between 1 and 1440 minutes" })
        }

        const updateData = {}
        if (firstName !== undefined) updateData.firstName = firstName
        if (lastName !== undefined) updateData.lastName = lastName
        if (bio !== undefined) updateData.bio = bio
        if (dailyReadingGoal !== undefined) updateData.dailyReadingGoal = dailyReadingGoal || 30
        if (description !== undefined) updateData.description = description
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture

        await User.update(req.user.userId, updateData)

        res.json({ message: "Profile updated successfully" })
    } catch (error) {
        console.error("Profile update error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

const getYearlyStats = async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query

        const stats = await User.getYearlyStats(req.user.userId, year)

        // fill in missing months with 0
        const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            books_read: 0,
        }))

        stats.forEach((stat) => {
            monthlyStats[stat.month - 1].books_read = stat.books_read
        })

        res.json(monthlyStats)
    } catch (error) {
        console.error("Stats fetch error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

const getCurrentlyReading = async (req, res) => {
    try {
        const currentlyReading = await Progress.getCurrentlyReading(req.user.userId)
        res.json(currentlyReading)
    } catch (error) {
        console.error("Currently reading fetch error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

const getReadingStreak = async (req, res) => {
    try {
        const streak = await Progress.getReadingStreak(req.user.userId)
        res.json({ streak })
    } catch (error) {
        console.error("Reading streak fetch error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

const getReadingStats = async (req, res) => {
    try {
        const { days = 30 } = req.query
        const stats = await Progress.getUserReadingStats(req.user.userId, days)
        res.json(stats)
    } catch (error) {
        console.error("Reading stats fetch error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

const getMonthlyGoal = async (req, res) => {
    try {
        const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query
        const goal = await Progress.getMonthlyReadingGoal(req.user.userId, year, month)
        res.json(goal)
    } catch (error) {
        console.error("Monthly goal fetch error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

module.exports = {
    getProfile,
    updateProfile,
    getYearlyStats,
    getCurrentlyReading,
    getReadingStreak,
    getReadingStats,
    getMonthlyGoal,
}