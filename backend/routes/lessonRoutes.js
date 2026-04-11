const express = require('express');
const router = express.Router({ mergeParams: true }); // Inherits :courseId and :moduleId from parent routers
const {
    addLesson,
    getLessonsByModule,
    updateLesson,
    deleteLesson,
} = require('../controller/lessonController');
const { protect, approvedEducator } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');


const lessonUpload = upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'notes', maxCount: 1 },
]);


router.route('/')
    .post(protect, approvedEducator, lessonUpload, addLesson)
    .get(getLessonsByModule);


router.route('/:lessonId')
    .put(protect, approvedEducator, lessonUpload, updateLesson)
    .delete(protect, approvedEducator, deleteLesson);

module.exports = router;
