const Course = require('../model/Course');
const Module = require('../model/Module');
const User = require('../model/User');
const sendEmail = require('../utils/sendEmail');

// Course Management 
const getAllPendingCourses = async (req, res) => {
    try {
        const courses = await Course.find({ status: 'pending' })
            .populate('educatorId', 'name email profilePicture')
            .select('-adminFeedback')
            .sort({ updatedAt: -1 });

        res.json({ total: courses.length, courses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const reviewCourse = async (req, res) => {
    try {
        const { status, adminFeedback } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be "approved" or "rejected".' });
        }

        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.status !== 'pending') {
            return res.status(400).json({
                message: `Only pending courses can be reviewed. Current status: "${course.status}".`
            });
        }

        if (status === 'approved') {
            course.status = 'approved';
            course.adminFeedback = undefined;
        } else {
            if (!adminFeedback || adminFeedback.trim() === '') {
                return res.status(400).json({ message: 'Feedback is required when rejecting a course.' });
            }
            course.status = 'rejected';
            course.adminFeedback = adminFeedback.trim();
        }

        await course.save();
        res.json({ message: `Course ${status} successfully.`, status: course.status, adminFeedback: course.adminFeedback });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Educator Management 
const getAllEducators = async (req, res) => {
    try {
        const status = req.query.status;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { role: 'educator' };
        if (status) filter['educatorApplication.status'] = status;

        const total = await User.countDocuments(filter);
        const educators = await User.find(filter)
            .select('-password -otp -otpExpires')
            .skip(skip)
            .limit(limit);

        res.json({ page, totalPages: Math.ceil(total / limit), totalEducators: total, educators });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const reviewEducator = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be "approved" or "rejected".' });
        }

        const user = await User.findById(req.params.educatorId);
        if (!user || user.role !== 'educator') {
            return res.status(404).json({ message: 'Educator not found' });
        }

        user.educatorApplication.status = status;
        await user.save();

        const subject = status === 'approved' 
            ? '🎉 Your ByteLearn Educator Application is Approved!' 
            : 'Update on your ByteLearn Educator Application';
            
        const message = status === 'approved'
            ? `Hi ${user.name}, congratulations! Your educator application has been approved. You can now log in and start creating courses.`
            : `Hi ${user.name}, after review, your educator application was not approved at this time. You may re-apply with updated credentials.`;

        try {
            await sendEmail({ email: user.email, subject, message });
        } catch (err) {
            console.error('Notification email failed:', err.message);
        }

        res.json({ message: `Educator ${status} successfully.`, educatorId: user._id, status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllPendingCourses,
    reviewCourse,
    getAllEducators,
    reviewEducator,
};
