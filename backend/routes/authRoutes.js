const express = require("express");
const router = express.Router();
const { registerStudent, registerEducator, loginUser, getUserProfile, updateUserProfile } = require("../controller/authController");
const { protect } = require('../middleware/authMiddleware');

router.post("/register-student", registerStudent);
router.post("/register-educator", registerEducator);
router.post("/login", loginUser);

router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile);

module.exports = router;

