const express = require('express');
const router = express.Router();
const { startAttempt, submitAttempt, getStudentQuizHistory } = require('../controller/quizAttemptController');
const { protect } = require('../middleware/authMiddleware');


router.post('/start', protect, startAttempt);
router.post('/submit', protect, submitAttempt);
router.get('/history/:quizId', protect, getStudentQuizHistory);

module.exports = router;
