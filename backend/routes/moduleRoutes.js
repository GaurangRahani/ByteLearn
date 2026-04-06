const express = require('express');
const router = express.Router({ mergeParams: true }); //mergeParams allows access to :courseId from parent router
const {
    addModule,
    getModulesByCourse,
    updateModule,
    deleteModule,
} = require('../controller/moduleController');
const { protect, approvedEducator } = require('../middleware/authMiddleware');


router.route('/')
    .post(protect, approvedEducator, addModule)
    .get(getModulesByCourse);


router.route('/:moduleId')
    .put(protect, approvedEducator, updateModule)
    .delete(protect, approvedEducator, deleteModule);

//nested
const lessonRoutes = require('./lessonRoutes');
const assignmentRoutes = require('./assignmentRoutes');
const quizRoutes = require('./quizRoutes');

router.use('/:moduleId/lessons', lessonRoutes);
router.use('/:moduleId/assignments', assignmentRoutes);
router.use('/:moduleId/quizzes', quizRoutes);

module.exports = router;
