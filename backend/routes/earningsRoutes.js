const express = require('express');
const router = express.Router();

const { getEarningsDashboard, requestWithdrawal } = require('../controller/earningsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('educator'), getEarningsDashboard);

//for withdraw
router.post('/withdraw', protect, authorize('educator'), requestWithdrawal);

module.exports = router;
