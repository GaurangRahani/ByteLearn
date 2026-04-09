const express = require('express');
const router = express.Router({ mergeParams: true });
const { createQuizWithQuestions, getQuizzesByModule, getQuizById } = require('../controller/quizController');
const { protect, approvedEducator } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, approvedEducator, createQuizWithQuestions)
    .get(getQuizzesByModule);

router.get('/:id', protect, getQuizById);

module.exports = router;

