const Enrollment = require('../model/Enrollment');
const Course = require('../model/Course');

const enrollInFreeCourse = async (req, res) => {
    try {
        const studentId = req.user._id;
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ success: false, message: "courseId is required" });
        }

        // Check if the course exists
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        // Ensure course is actually free
        if (course.isPaid) {
            return res.status(402).json({ success: false, message: "Payment Required for this course" });
        }

        const existingEnrollment = await Enrollment.findOne({ studentId, courseId });
        
        if (existingEnrollment) {
            return res.status(409).json({ success: false, message: "You are already enrolled in this course" });
        }

        const enrollment = await Enrollment.create({
            studentId,
            courseId,
            enrolledAt: Date.now(),
            progressPercentage: 0
        });

        res.status(201).json({ success: true, message: "Successfully enrolled", data: enrollment });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "You are already enrolled in this course" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMyCourses = async (req, res) => {
    try {
        const studentId = req.user._id;

        const enrollments = await Enrollment.find({ studentId })
            .select('progressPercentage status courseId')
            .populate({
                path: 'courseId',
                select: 'title thumbnail category totalLessons educatorId',
                populate: {
                    path: 'educatorId',
                    select: 'name'
                }
            })
            .lean();

        res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    enrollInFreeCourse,
    getMyCourses
};
