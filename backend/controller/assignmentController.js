const Assignment = require('../model/Assignment');
const Module = require('../model/Module');
const Course = require('../model/Course');
const Lesson = require('../model/Lesson');
const Quiz = require('../model/Quiz');
const mongoose = require('mongoose');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

//safely delete temp files if single upload
const cleanupTempFiles = (req) => {
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }
};

const verifyModuleOwnership = async (moduleId, userId) => {
    const module = await Module.findById(moduleId).populate('courseId');
    if (!module) return { error: 'Module not found', status: 404 };
    if (module.courseId.educatorId.toString() !== userId.toString()) {
        return { error: 'Not authorized to manage assignments in this module', status: 403 };
    }
    return { module };
};

const addAssignment = async (req, res) => {
    try {
        let { title, instructions, totalMarks, order } = req.body;

        // --- Data Sanitization & Constraints ---
        if (title) title = title.trim();
        if (!title) {
            cleanupTempFiles(req);
            return res.status(400).json({ message: 'Assignment title is required and cannot be empty' });
        }

        if (totalMarks !== undefined) {
            totalMarks = Number(totalMarks);
            if (isNaN(totalMarks) || totalMarks <= 0) {
                cleanupTempFiles(req);
                return res.status(400).json({ message: 'Total marks must be a valid positive number' });
            }
        }

        const { error, status } = await verifyModuleOwnership(req.params.moduleId, req.user._id);
        if (error) {
            cleanupTempFiles(req);
            return res.status(status).json({ message: error });
        }

        // --- Cross-Collection Unified Order Logic ---
        if (!order) {
            const [lastLesson, lastAssignment, lastQuiz] = await Promise.all([
                Lesson.findOne({ moduleId: req.params.moduleId }).sort('-order'),
                Assignment.findOne({ moduleId: req.params.moduleId }).sort('-order'),
                Quiz.findOne({ moduleId: req.params.moduleId }).sort('-order')
            ]);
            const maxOrder = Math.max(
                lastLesson?.order || 0,
                lastAssignment?.order || 0,
                lastQuiz?.order || 0
            );
            order = maxOrder + 1;
        }

        let questionPdfUrl = "";
        if (req.file) {
            const uploadedPdf = await uploadOnCloudinary(req.file.path);
            if (!uploadedPdf) {
                return res.status(500).json({ message: 'Error uploading attachment to Cloudinary' });
            }
            questionPdfUrl = uploadedPdf.secure_url;
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const assignment = await Assignment.create([{
                moduleId: req.params.moduleId,
                title,
                instructions,
                questionPdfUrl,
                totalMarks,
                order
            }], { session });

            await session.commitTransaction();
            session.endSession();
            
            // Return the first element since create() returns an array when inside a session
            res.status(201).json(assignment[0]);
        } catch (dbError) {
            await session.abortTransaction();
            session.endSession();
            throw dbError; // Caught by the outer catch block
        }

    } catch (error) {
        cleanupTempFiles(req);
        res.status(500).json({ message: error.message });
    }
};

const getAssignmentsByModule = async (req, res) => {
    try {
        const module = await Module.findById(req.params.moduleId);
        if (!module) return res.status(404).json({ message: 'Module not found' });
        const assignments = await Assignment.find({ moduleId: req.params.moduleId }).sort({ order: 1 });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.assignmentId);
        if (!assignment) {
            cleanupTempFiles(req);
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const { error, status } = await verifyModuleOwnership(assignment.moduleId, req.user._id);
        if (error) {
            cleanupTempFiles(req);
            return res.status(status).json({ message: error });
        }

        const allowedUpdates = {};
        if (req.body.title !== undefined) allowedUpdates.title = req.body.title;
        if (req.body.instructions !== undefined) allowedUpdates.instructions = req.body.instructions;
        if (req.body.totalMarks !== undefined) allowedUpdates.totalMarks = req.body.totalMarks;
        if (req.body.order !== undefined) allowedUpdates.order = req.body.order;

        if (req.file) {
            const uploadedPdf = await uploadOnCloudinary(req.file.path);
            if (!uploadedPdf) return res.status(500).json({ message: 'Error uploading new attachment' });
            allowedUpdates.questionPdfUrl = uploadedPdf.secure_url;
        }

        const updatedAssignment = await Assignment.findByIdAndUpdate(
            req.params.assignmentId,
            allowedUpdates,
            { new: true, runValidators: true }
        );

        res.json(updatedAssignment);
    } catch (error) {
        cleanupTempFiles(req);
        res.status(500).json({ message: error.message });
    }
};

const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.assignmentId);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
        
        const { error, status } = await verifyModuleOwnership(assignment.moduleId, req.user._id);
        if (error) return res.status(status).json({ message: error });
        
        await Assignment.findByIdAndDelete(req.params.assignmentId);
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addAssignment, getAssignmentsByModule, updateAssignment, deleteAssignment };
