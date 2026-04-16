const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getAllPendingCourses,
    reviewCourse,
    getAllEducators,
    reviewEducator,
    getAdminStats,
    getAllPayoutRequests,
    reviewPayoutRequest
} = require('../controller/adminController');

// Admin Stats
router.get('/stats', protect, admin, getAdminStats);

// Course Review
router.get('/courses/pending', protect, admin, getAllPendingCourses);
router.put('/courses/:courseId/review', protect, admin, reviewCourse);

// Educator Management
router.get('/educators', protect, admin, getAllEducators);
router.put('/educators/:educatorId/review', protect, admin, reviewEducator);

// Payout Managementt
router.get('/payouts', protect, admin, getAllPayoutRequests);
router.put('/payouts/:transactionId/review', protect, admin, reviewPayoutRequest);

module.exports = router;
