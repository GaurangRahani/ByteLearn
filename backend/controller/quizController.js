const Quiz = require('../model/Quiz');
const Question = require('../model/Question');
const Module = require('../model/Module');
const Lesson = require('../model/Lesson');
const Assignment = require('../model/Assignment');
const QuizAttempt = require('../model/QuizAttempt');
const Enrollment = require('../model/Enrollment');
const mongoose = require('mongoose');

const verifyModuleOwnership = async (moduleId, userId) => {
    const module = await Module.findById(moduleId).populate('courseId');
    if (!module) return { error: 'Module not found', status: 404 };
    if (module.courseId.educatorId.toString() !== userId.toString()) {
        return { error: 'Not authorized to manage content in this module', status: 403 };
    }
    return { module };
};

const createQuizWithQuestions = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let { title, passingScore, duration, attemptsAllowed, questions } = req.body;
        const moduleId = req.params.moduleId;

        if (title) title = title.trim();
        if (!title) {
            return res.status(400).json({ message: 'Quiz title is required' });
        }
        
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'A quiz must contain at least one question' });
        }

        const { error, status } = await verifyModuleOwnership(moduleId, req.user._id);
        if (error) {
            return res.status(status).json({ message: error });
        }

        let totalQuizMarks = 0;
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            
            if (!q.question || q.question.trim() === '') {
                throw new Error(`Question ${i + 1} is missing text.`);
            }

            if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 6) {
                throw new Error(`Question ${i + 1} must have between 2 and 6 options.`);
            }

            if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
                throw new Error(`Question ${i + 1} has an invalid correctAnswer index.`);
            }

            if (typeof q.marks !== 'number' || q.marks <= 0) {
                throw new Error(`Question ${i + 1} must have positive marks.`);
            }

            totalQuizMarks += q.marks;
        }

        if (passingScore !== undefined && passingScore > totalQuizMarks) {
            throw new Error(`Passing score (${passingScore}) cannot be higher than the total marks available (${totalQuizMarks}).`);
        }

        const [lastLesson, lastAssignment, lastQuiz] = await Promise.all([
            Lesson.findOne({ moduleId }).sort('-order'),
            Assignment.findOne({ moduleId }).sort('-order'),
            Quiz.findOne({ moduleId }).sort('-order')
        ]);

        const maxOrder = Math.max(
            lastLesson?.order || 0,
            lastAssignment?.order || 0,
            lastQuiz?.order || 0
        );

        const newOrder = maxOrder + 1;

        const quiz = (await Quiz.create([{
            moduleId,
            title,
            passingScore: passingScore || totalQuizMarks,
            duration,
            attemptsAllowed: attemptsAllowed || 1,
            order: newOrder
        }], { session }))[0];

        const processedQuestions = questions.map(q => ({
            quizId: quiz._id,
            question: q.question.trim(),
            options: q.options.map(opt => String(opt).trim()),
            correctAnswer: q.correctAnswer,
            marks: q.marks
        }));

        const insertedQuestions = await Question.insertMany(processedQuestions, { session });

        await session.commitTransaction();
        session.endSession();

        const populatedQuiz = await Quiz.findById(quiz._id).populate('questions').lean();

        res.status(201).json({
            success: true,
            data: {
                quiz: populatedQuiz,
                questions: insertedQuestions
            }
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        const status = err.message.includes('Question') || err.message.includes('Passing score') ? 400 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

const getQuizzesByModule = async (req, res) => {
    try {
        const module = await Module.findById(req.params.moduleId);
        if (!module) return res.status(404).json({ message: 'Module not found' });
        const quizzes = await Quiz.findOne({ moduleId: req.params.moduleId })
            ? await Quiz.find({ moduleId: req.params.moduleId }).populate('questions').sort({ order: 1 })
            : [];
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('questions');
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }
        res.status(200).json({ success: true, data: quiz });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const submitQuiz = async (req, res) => {
    try {
        const { quizId, courseId, answers } = req.body;
        const studentId = req.user._id;

        // 1. Validation & Attempt Check
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found." });
        }

        const previousAttempts = await QuizAttempt.countDocuments({ studentId, quizId });

        if (previousAttempts >= quiz.attemptsAllowed) {
            return res.status(403).json({ message: "Maximum attempts reached for this quiz." });
        }

        // 2. Grading Logic
        const questions = await Question.find({ quizId });
        let score = 0;
        let totalMaxMarks = 0;
        const totalQuestions = questions.length;

        const gradedAnswers = answers.map(answer => {
            const question = questions.find(q => q._id.toString() === answer.questionId.toString());
            const isCorrect = question ? question.correctAnswer === answer.selectedOption : false;
            const marksEarned = isCorrect ? (question.marks || 0) : 0;
            
            if (isCorrect) score += marksEarned;
            
            return {
                questionId: answer.questionId,
                selectedOption: answer.selectedOption,
                isCorrect,
                marksEarned
            };
        });

        questions.forEach(q => {
            totalMaxMarks += (q.marks || 0);
        });

        const percentage = totalMaxMarks > 0 ? (score / totalMaxMarks) * 100 : 0;
        const passed = percentage >= quiz.passingScore;

        // 3. Save the Attempt
        const quizAttempt = await QuizAttempt.create({
            studentId,
            quizId,
            courseId,
            attemptNumber: previousAttempts + 1,
            answers: gradedAnswers,
            score,
            totalMarksPossible: totalMaxMarks,
            totalQuestions,
            percentage,
            passingScoreSnap: quiz.passingScore,
            passed,
            submittedAt: new Date()
        });

        // 4. Progress Tracking Integration (Enrollment Model)
        const enrollment = await Enrollment.findOne({ studentId, courseId });
        if (enrollment) {
            const alreadyCompleted = enrollment.completedQuizzes.some(id => id.toString() === quizId.toString());
            if (passed && !alreadyCompleted) {
                enrollment.completedQuizzes.push(quizId);
                await enrollment.save();
            }
        }

        // 5. Response
        res.status(200).json({ 
            success: true, 
            message: "Quiz submitted successfully.", 
            data: quizAttempt 
        });

    } catch (err) {
        console.error("Submit Quiz Error:", err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createQuizWithQuestions,
    getQuizzesByModule,
    getQuizById,
    submitQuiz
};

