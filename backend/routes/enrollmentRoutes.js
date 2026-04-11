const express = require('express');
const router = express.Router();
const { enrollInCourse, getMyCourses, getEducatorRoster } = require('../controller/enrollmentController');
const { protect, approvedEducator } = require('../middleware/authMiddleware');

router.post('/enroll', protect, enrollInCourse);
router.get('/my-courses', protect, getMyCourses);
router.get('/educator/roster', protect, approvedEducator, getEducatorRoster);

module.exports = router;
