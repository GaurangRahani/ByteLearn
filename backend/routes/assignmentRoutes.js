const express = require('express');
const router = express.Router({ mergeParams: true }); 
const {
    addAssignment,
    getAssignmentsByModule,
    updateAssignment,
    deleteAssignment,
    getAssignmentPdfUrl
} = require('../controller/assignmentController');
const { protect, approvedEducator } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const assignmentUpload = upload.single('questionPdf');

router.route('/')
    .post(protect, approvedEducator, assignmentUpload, addAssignment)
    .get(getAssignmentsByModule);

router.route('/:assignmentId')
    .put(protect, approvedEducator, assignmentUpload, updateAssignment)
    .delete(protect, approvedEducator, deleteAssignment);

router.get('/:assignmentId/download', protect, getAssignmentPdfUrl);

module.exports = router;
