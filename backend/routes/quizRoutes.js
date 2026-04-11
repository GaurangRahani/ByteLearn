const express = require('express');
const router = express.Router({ mergeParams: true });
const { 
    createQuizWithQuestions, 
    getQuizzesByModule, 
    getQuizById, 
    initializeOrResumeQuiz,
    autoSaveAnswer,
    submitFinalQuiz
} = require('../controller/quizController');
const { protect, approvedEducator } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, approvedEducator, createQuizWithQuestions)
    .get(getQuizzesByModule);

router.get('/:quizId/start', protect, initializeOrResumeQuiz);
router.patch('/:quizId/save', protect, autoSaveAnswer);
router.post('/:quizId/submit', protect, submitFinalQuiz);
router.get('/:id', protect, getQuizById);

module.exports = router;
