const QuizAttempt = require('../model/QuizAttempt');
const Quiz = require('../model/Quiz');
const Question = require('../model/Question');
const Module = require('../model/Module');


/**
 * @desc    Start a new quiz attempt
 * @route   POST /api/quiz-attempts/start
 * @access  Private (Student)
 */
const startAttempt = async (req, res) => {
    try {
        let { quizId, courseId } = req.body;
        const studentId = req.user._id;

        if (!quizId) {
            return res.status(400).json({ message: 'quizId is required' });
        }

        const quiz = await Quiz.findById(quizId).populate('moduleId');
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        if (!courseId && quiz.moduleId) {
            courseId = quiz.moduleId.courseId;
        }

        if (!courseId) {
            return res.status(400).json({ message: 'courseId could not be resolved. Please provide it in the request body.' });
        }


        const questions = await Question.find({ quizId });
        
        // Count existing attempts to calculate the next attemptNumber
        const attemptCount = await QuizAttempt.countDocuments({ studentId, quizId });
        const attemptNumber = attemptCount + 1;

        res.status(200).json({
            quiz,
            questions,
            attemptNumber,
            courseId
        });
    } catch (error) {
        console.error('Start Attempt Error:', error);
        res.status(500).json({ message: error.message || 'Error preparing quiz attempt' });
    }
};

/**
 * @desc    Submit and grade a quiz attempt
 * @route   POST /api/quiz-attempts/submit
 * @access  Private (Student)
 */
const submitAttempt = async (req, res) => {
    try {
        const { quizId, courseId, attemptNumber, timeTaken, answers } = req.body; 
        const studentId = req.user._id;

        if (!quizId || !courseId || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'quizId, courseId, and answers array are required' });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const questions = await Question.find({ quizId });
        const questionMap = new Map(questions.map(q => [q._id.toString(), q]));
        
        const totalQuestions = questions.length;
        const totalMarksPossible = questions.reduce((acc, q) => acc + (q.marks || 0), 0);

        let finalScore = 0;
        const gradedAnswers = answers.map(submittedAns => {
            const question = questionMap.get(submittedAns.questionId.toString());
            
            if (!question) {
                return {
                    questionId: submittedAns.questionId,
                    selectedOption: submittedAns.selectedOption,
                    isCorrect: false,
                    marksEarned: 0
                };
            }

            const isCorrect = submittedAns.selectedOption === question.correctAnswer;
            const marksEarned = isCorrect ? (question.marks || 0) : 0;
            
            if (isCorrect) {
                finalScore += marksEarned;
            }

            return {
                questionId: submittedAns.questionId,
                selectedOption: submittedAns.selectedOption,
                isCorrect,
                marksEarned
            };
        });

        const passed = finalScore >= (quiz.passingScore || 0);

        const newAttempt = await QuizAttempt.create({
            studentId,
            quizId,
            courseId,
            attemptNumber: attemptNumber || 1,
            answers: gradedAnswers,
            score: finalScore,
            totalMarksPossible,
            totalQuestions,
            passingScoreSnap: quiz.passingScore || 0,
            passed,
            submittedAt: new Date(),
            timeTaken
        });

        res.status(201).json(newAttempt);
    } catch (error) {
        console.error('Submit Attempt Error:', error);
        res.status(500).json({ message: error.message || 'Error submitting quiz attempt' });
    }
};

/**
 * @desc    Get student's attempt history for a quiz
 * @route   GET /api/quiz-attempts/history/:quizId
 * @access  Private (Student)
 */
const getStudentQuizHistory = async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user._id;

        if (!quizId) {
            return res.status(400).json({ message: 'quizId is required' });
        }

        const history = await QuizAttempt.find({ studentId, quizId })
            .sort({ attemptNumber: -1 });

        res.status(200).json(history);
    } catch (error) {
        console.error('Get History Error:', error);
        res.status(500).json({ message: error.message || 'Error fetching quiz history' });
    }
};

module.exports = { startAttempt, submitAttempt, getStudentQuizHistory };
