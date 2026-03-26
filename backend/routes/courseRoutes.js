const express = require('express');
const router = express.Router();
const {
    createCourse,
    getEducatorCourses,
    getCourseById,
    updateCourse,
    deleteCourse
} = require('../controller/courseController');
const { protect, approvedEducator, educator } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .post(protect, approvedEducator, upload.single('thumbnail'), createCourse);

router.route('/my-courses')
    .get(protect, educator, getEducatorCourses);

router.route('/:id')
    .get(getCourseById)
    .put(protect, approvedEducator, upload.single('thumbnail'), updateCourse)
    .delete(protect, approvedEducator, deleteCourse);

//  Nested: /api/courses/:courseId/modules
const moduleRoutes = require('./moduleRoutes');
router.use('/:courseId/modules', moduleRoutes);

module.exports = router;
