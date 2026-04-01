const express = require('express');
const router = express.Router();
const { enrollInCourse, getMyCourses } = require('../controller/enrollmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/enroll', protect, enrollInCourse);
router.get('/my-courses', protect, getMyCourses);

module.exports = router;
