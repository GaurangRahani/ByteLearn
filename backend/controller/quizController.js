const Quiz = require('../model/Quiz');
const Question = require('../model/Question');
const Module = require('../model/Module');
const Lesson = require('../model/Lesson');
const Assignment = require('../model/Assignment');
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

        // 1. Data Sanitization & Basic Validation
        if (title) title = title.trim();
        if (!title) {
            return res.status(400).json({ message: 'Quiz title is required' });
        }
        
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'A quiz must contain at least one question' });
        }

        // 2. Ownership Verification
        const { error, status } = await verifyModuleOwnership(moduleId, req.user._id);
        if (error) {
            return res.status(status).json({ message: error });
        }

        // 3. Question (MCQ) Validation Rules
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

        // 4. Quiz Metadata Validation
        if (passingScore !== undefined && passingScore > totalQuizMarks) {
            throw new Error(`Passing score (${passingScore}) cannot be higher than the total marks available (${totalQuizMarks}).`);
        }

        // 5. Global "Sibling" Order Calculation
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

        // 6. Database Insertion
        const quiz = (await Quiz.create([{
            moduleId,
            title,
            passingScore: passingScore || totalQuizMarks,
            duration,
            attemptsAllowed: attemptsAllowed || 1,
            order: newOrder
        }], { session }))[0];

        // Assign the generated quizId and internal ordering to each question
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

        // 7. Success Response
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
        // Send a 400 status if it's a validation error we threw manually
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

module.exports = {
    createQuizWithQuestions,
    getQuizzesByModule
};
