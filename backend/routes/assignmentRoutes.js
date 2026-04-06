const express = require('express');
const router = express.Router({ mergeParams: true }); // Inherits :courseId and :moduleId from parent routers
const {
    addAssignment,
    getAssignmentsByModule,
    updateAssignment,
    deleteAssignment,
} = require('../controller/assignmentController');
const { protect, approvedEducator } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Accept a single pdf/doc file for assignment questions
const assignmentUpload = upload.single('questionPdf');

router.route('/')
    .post(protect, approvedEducator, assignmentUpload, addAssignment)
    .get(getAssignmentsByModule);

router.route('/:assignmentId')
    .put(protect, approvedEducator, assignmentUpload, updateAssignment)
    .delete(protect, approvedEducator, deleteAssignment);

module.exports = router;
