const Submission = require('../model/Submission');
const Enrollment = require('../model/Enrollment');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, courseId } = req.body;
        const studentId = req.user._id;

        if (!req.file) {
            return res.status(400).json({ message: "Please upload a file" });
        }

        if (!assignmentId || !courseId) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "Assignment ID and Course ID are required" });
        }

        const existingSubmission = await Submission.findOne({ studentId, assignmentId });
        if (existingSubmission) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "Assignment already submitted" });
        }

        const uploadedFile = await uploadOnCloudinary(req.file.path);
        
        if (!uploadedFile) {
            return res.status(500).json({ message: "Error uploading file to Cloudinary" });
        }
        const submission = await Submission.create({
            studentId,
            assignmentId,
            courseId,
            fileUrl: uploadedFile.secure_url
        });

        const updatedEnrollment = await Enrollment.findOneAndUpdate(
            { studentId: req.user._id, courseId: req.body.courseId },
            { $addToSet: { completedAssignments: req.body.assignmentId } },
            { new: true }
        );

        res.status(201).json({ success: true, data: submission, progress: updatedEnrollment });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        if (error.code === 11000) {
            return res.status(400).json({ message: "Assignment already submitted" });
        }

        res.status(500).json({ message: error.message });
    }
};

module.exports = { submitAssignment };
