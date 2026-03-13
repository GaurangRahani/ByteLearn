const express = require("express");
const router = express.Router();
const { registerStudent, registerEducator, loginUser } = require("../controller/authController");

router.post("/register-student", registerStudent);
router.post("/register-educator", registerEducator);
router.post("/login", loginUser);

module.exports = router;
