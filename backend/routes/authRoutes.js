const express = require("express");
const router = express.Router();
const { registerStudent, registerEducator } = require("../controller/authController");

router.post("/register-student", registerStudent);
router.post("/register-educator", registerEducator);

module.exports = router;
