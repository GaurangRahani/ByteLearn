const QuizAttempt = require('../model/QuizAttempt');
const Quiz = require('../model/Quiz');
const Question = require('../model/Question');

/**
 * @desc    Start a new quiz attempt
 * @route   POST /api/quiz-attempts/start
 * @access  Private (Student)
 */
const startAttempt = async (req, res) => {
    try {
        const { quizId, courseId } = req.body;
        const studentId = req.user._id;

        if (!quizId || !courseId) {
            return res.status(400).json({ message: 'quizId and courseId are required' });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const questions = await Question.find({ quizId });
        const totalQuestions = questions.length;
        const totalMarksPossible = questions.reduce((acc, q) => acc + (q.marks || 0), 0);

        const lastAttempt = await QuizAttempt.findOne({ studentId, quizId }).sort({ attemptNumber: -1 });
        const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

        const newAttempt = await QuizAttempt.create({
            studentId,
            quizId,
            courseId,
            attemptNumber,
            totalQuestions,
            totalMarksPossible,
            passingScoreSnap: quiz.passingScore || 0,
            status: 'in-progress',
            startedAt: Date.now()
        });

        res.status(201).json(newAttempt);
    } catch (error) {
        console.error('Start Attempt Error:', error);
        res.status(500).json({ message: error.message || 'Error starting quiz attempt' });
    }
};

/**
 * @desc    Submit and grade a quiz attempt
 * @route   POST /api/quiz-attempts/submit
 * @access  Private (Student)
 */
const submitAttempt = async (req, res) => {
    try {
        const { attemptId, answers } = req.body; 

        if (!attemptId || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'attemptId and answers array are required' });
        }

        const attempt = await QuizAttempt.findById(attemptId);
        if (!attempt) {
            return res.status(404).json({ message: 'Quiz attempt not found' });
        }

        if (attempt.status !== 'in-progress') {
            return res.status(400).json({ message: 'This attempt has already been submitted or is not in progress' });
        }

        const questions = await Question.find({ quizId: attempt.quizId });
        const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

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

        const passed = finalScore >= attempt.passingScoreSnap;
        const submittedAt = new Date();
        const timeTaken = Math.floor((submittedAt - attempt.startedAt) / 1000); // Time in seconds

        attempt.answers = gradedAnswers;
        attempt.score = finalScore;
        attempt.passed = passed;
        attempt.status = 'completed';
        attempt.submittedAt = submittedAt;
        attempt.timeTaken = timeTaken;

        await attempt.save();

        res.status(200).json(attempt);
    } catch (error) {
        console.error('Submit Attempt Error:', error);
        res.status(500).json({ message: error.message || 'Error submitting quiz attempt' });
    }
};

module.exports = { startAttempt, submitAttempt };
