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
    updateEducatorStatus,
    verifyOtp,
    resendOtp
} = require("../controller/authController");
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post("/register-student", registerStudent);
router.post("/register-educator", upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'supportingCredentials', maxCount: 5 }
]), registerEducator);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile);
router.put("/change-password", protect, changePassword);

router.get("/educators", protect, admin, getAllEducators);
router.put("/educators/:id/status", protect, admin, updateEducatorStatus);

module.exports = router;

