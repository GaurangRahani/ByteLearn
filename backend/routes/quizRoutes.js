const express = require('express');
const router = express.Router({ mergeParams: true });
const { 
    createQuizWithQuestions, 
    getQuizzesByModule, 
    getQuizById, 
    submitQuiz,
    startOrResumeQuiz,
    saveAnswerProgress,
    submitFinalQuiz
} = require('../controller/quizController');
const { protect, approvedEducator } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, approvedEducator, createQuizWithQuestions)
    .get(getQuizzesByModule);

router.post('/:quizId/start', protect, startOrResumeQuiz);
router.patch('/:quizId/save', protect, saveAnswerProgress);
router.post('/:quizId/submit', protect, submitFinalQuiz);

router.post('/submit', protect, submitQuiz); // Keeping legacy for compatibility
router.get('/:id', protect, getQuizById);

module.exports = router;
