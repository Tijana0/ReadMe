const express = require('express');
const { authenticateToken } = require('../services/authentication');
const {
    getReviewsByBook,
    getUserReviews,
    createReview,
    updateReview,
    deleteReview,
    getBookRating
} = require('../controllers/reviewController');

const router = express.Router();

 router.use(authenticateToken);

router.get('/book/:bookId', getReviewsByBook);
router.get('/user', getUserReviews);
router.get('/book/:bookId/rating', getBookRating);
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;