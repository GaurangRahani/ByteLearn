const express = require('express');
const router = express.Router({ mergeParams: true });
const { createQuizWithQuestions, getQuizzesByModule, getQuizById, submitQuiz } = require('../controller/quizController');
const { protect, approvedEducator } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, approvedEducator, createQuizWithQuestions)
    .get(getQuizzesByModule);

router.post('/submit', protect, submitQuiz);

router.get('/:id', protect, getQuizById);

module.exports = router;

