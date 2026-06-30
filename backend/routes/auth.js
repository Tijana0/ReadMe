const express = require('express');
const { authenticateToken } = require('../services/authentication');
const { register, login, validateToken } = require('../controllers/authController');

const router = express.Router();

// public routes
router.post('/register', register);
router.post('/login', login);

// protected routes
router.get('/validate', authenticateToken, validateToken);

module.exports = router;