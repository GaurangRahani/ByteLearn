const Quiz = require('../model/Quiz');
const Question = require('../model/Question');
const Module = require('../model/Module');
const Lesson = require('../model/Lesson');
const Assignment = require('../model/Assignment');
const QuizAttempt = require('../model/QuizAttempt');
const Enrollment = require('../model/Enrollment');
const Course = require('../model/Course');
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

const startOrResumeQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user._id;

        let attempt = await QuizAttempt.findOne({ studentId, quizId }).populate('answers.questionId');

        if (attempt) {
            return res.status(200).json({ success: true, data: attempt });
        }

        const quiz = await Quiz.findById(quizId).populate('moduleId');
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        const questions = await Question.find({ quizId });
        if (!questions.length) return res.status(400).json({ message: "No questions found for this quiz" });

        const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);

        const initialAnswers = shuffledQuestions.map(q => ({
            questionId: q._id,
            selectedOption: null,
            marksEarned: 0
        }));

        const totalMarksPossible = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

        attempt = await QuizAttempt.create({
            studentId,
            quizId,
            courseId: quiz.moduleId.courseId,
            status: 'in-progress',
            answers: initialAnswers,
            totalMarksPossible,
            totalQuestions: questions.length,
            startedAt: Date.now()
        });

        const populatedAttempt = await QuizAttempt.findById(attempt._id).populate('answers.questionId');

        res.status(201).json({ success: true, data: populatedAttempt });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const saveAnswerProgress = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { questionId, selectedOption } = req.body;
        const studentId = req.user._id;

        const attempt = await QuizAttempt.findOne({ studentId, quizId, status: 'in-progress' });
        if (!attempt) return res.status(404).json({ message: "In-progress attempt not found" });

        const answerIndex = attempt.answers.findIndex(a => a.questionId.toString() === questionId);
        if (answerIndex === -1) return res.status(400).json({ message: "Question not found in this attempt" });

        attempt.answers[answerIndex].selectedOption = selectedOption;
        await attempt.save();

        res.status(200).json({ success: true, message: "Progress saved" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const submitFinalQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user._id;

        const attempt = await QuizAttempt.findOne({ studentId, quizId, status: 'in-progress' });
        if (!attempt) return res.status(404).json({ message: "In-progress attempt not found" });

        const questions = await Question.find({ quizId });
        let totalScore = 0;

        attempt.answers.forEach(answer => {
            const question = questions.find(q => q._id.toString() === answer.questionId.toString());
            if (question) {
                const isCorrect = question.correctAnswer === answer.selectedOption;
                answer.isCorrect = isCorrect;
                answer.marksEarned = isCorrect ? (question.marks || 0) : 0;
                totalScore += answer.marksEarned;
            }
        });

        attempt.score = totalScore;
        attempt.status = 'completed';
        attempt.submittedAt = Date.now();
        await attempt.save();

        const enrollment = await Enrollment.findOne({ studentId, courseId: attempt.courseId });
        if (enrollment) {
            await Enrollment.updateOne(
                { _id: enrollment._id },
                { $addToSet: { completedQuizzes: quizId } }
            );

            const updatedEnrollment = await Enrollment.findById(enrollment._id);
            const course = await Course.findById(attempt.courseId).populate({
                path: 'modules',
                populate: ['lessons', 'quizzes', 'assignments']
            });

            if (course) {
                let totalItems = 0;
                course.modules.forEach(m => {
                    totalItems += (m.lessons?.length || 0) + (m.quizzes?.length || 0) + (m.assignments?.length || 0);
                });

                const completedCount = updatedEnrollment.completedLessons.length + 
                                       updatedEnrollment.completedQuizzes.length + 
                                       updatedEnrollment.completedAssignments.length;
                
                updatedEnrollment.progressPercentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
                await updatedEnrollment.save();
            }
        }

        const finalizedAttempt = await QuizAttempt.findById(attempt._id).populate('answers.questionId');
        res.status(200).json({ success: true, data: finalizedAttempt });
    } catch (err) {
        console.error("Submit Quiz Error:", err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createQuizWithQuestions,
    getQuizzesByModule,
    getQuizById,
    submitQuiz,
    startOrResumeQuiz,
    saveAnswerProgress,
    submitFinalQuiz
};

