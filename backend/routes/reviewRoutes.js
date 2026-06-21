const express = require('express');
const { submitReview, getDashboardStats } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.post('/:cardId', submitReview);

module.exports = router;
