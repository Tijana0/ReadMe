const express = require("express")
const router = express.Router()
const bookController = require("../controllers/bookController")
const { authenticateToken } = require("../services/authentication")

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Book routes
router.get("/", bookController.getAllBooks)
router.get("/status/:status", bookController.getBooksByStatus)
router.get("/search", bookController.searchBooks)
router.get("/google/:googleId", bookController.getGoogleBookById)
router.get("/dashboard", bookController.getDashboardData)
router.get("/:id", bookController.getBookById)
router.post("/", bookController.addBook) // This should be the add book endpoint
router.put("/:id", bookController.updateBook)
router.patch("/:id/favorite", bookController.toggleFavorite)
router.delete("/:id", bookController.deleteBook)

module.exports = router