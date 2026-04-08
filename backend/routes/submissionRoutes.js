const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { submitAssignment } = require('../controller/submissionController');

router.post('/', protect, upload.single('file'), submitAssignment);

module.exports = router;
