const express = require('express');
const router = express.Router();
const { enrollInFreeCourse, getMyCourses } = require('../controller/enrollmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/free', protect, enrollInFreeCourse);
router.get('/my-courses', protect, getMyCourses);

module.exports = router;
