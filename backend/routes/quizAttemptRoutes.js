const express = require('express');
const router = express.Router();
const { startAttempt, submitAttempt } = require('../controller/quizAttemptController');
const { protect } = require('../middleware/authMiddleware');


router.post('/start', protect, startAttempt);

router.post('/submit', protect, submitAttempt);

module.exports = router;
