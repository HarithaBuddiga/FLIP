const express = require('express');
const { getProfileProgress, recordQuizAttempt } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/me', getProfileProgress);
router.post('/quiz-attempts', recordQuizAttempt);

module.exports = router;
