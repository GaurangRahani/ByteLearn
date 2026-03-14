const express = require("express");
const router = express.Router();
const {
    registerStudent,
    registerEducator,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    getAllEducators,
    updateEducatorStatus
} = require("../controller/authController");
const { protect, admin } = require('../middleware/authMiddleware');

router.post("/register-student", registerStudent);
router.post("/register-educator", registerEducator);
router.post("/login", loginUser);

router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile);
router.put("/change-password", protect, changePassword);

router.get("/educators", protect, admin, getAllEducators);
router.put("/educators/:id/status", protect, admin, updateEducatorStatus);

module.exports = router;

