const express = require("express")
require("dotenv").config()
const cors = require("cors")

const port = process.env.PORT || 3000

// import routes
const authRoutes = require("./routes/auth")
const bookRoutes = require("./routes/books")
const userRoutes = require("./routes/users")
const reviewRoutes = require("./routes/reviews")
const path = require("node:path")

const app = express()

app.use(cors())

// body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/books", bookRoutes)
app.use("/api/users", userRoutes)
app.use("/api/reviews", reviewRoutes)

// 404 handler
/*
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
*/

// global error handler
app.use((error, req, res, next) => {
    console.error("Unhandled error:", error)
    res.status(500).json({ error: "Internal server error" })
})

//const { connectDatabase } = require('./services/database');

/*
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})
*/

// error handling
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error)
})

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason)
})

const fs = require("fs")
const distPath = fs.existsSync(path.join(__dirname, "dist"))
    ? path.join(__dirname, "dist")
    : path.join(__dirname, "../frontend/dist")

app.use(express.static(distPath))
app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"))
})

module.exports = app;