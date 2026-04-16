const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../model/User');
const Transaction = require('../model/Transaction');


const getEarningsDashboard = asyncHandler(async (req, res) => {
    const educatorId = req.user._id;

    // 1. Get stats from user profile
    const user = await User.findById(educatorId).select('walletBalance totalEarnings');
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 2. Get total sales count
    const totalSales = await Transaction.countDocuments({ educatorId, type: 'credit', status: 'completed' });

    // 3. Get transactions history
    const transactions = await Transaction.find({ educatorId })
        .sort({ createdAt: -1 })
        .limit(50); // recent 50

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await Transaction.aggregate([
        {
            $match: {
                educatorId: new mongoose.Types.ObjectId(educatorId),
                type: 'credit',
                status: 'completed',
                createdAt: { $gte: thirtyDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                amount: { $sum: "$amount" }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    // Format chart date to match Recharts expected input
    const chartData = dailyStats.map(stat => ({
        date: new Date(stat._id).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        amount: stat.amount
    }));

    res.status(200).json({
        success: true,
        stats: {
            walletBalance: user.walletBalance || 0,
            totalEarnings: user.totalEarnings || 0,
            totalSales
        },
        transactions,
        chartData
    });
});

// @desc    Request a withdrawal / payout
// @route   POST /api/educator/earnings/withdraw
// @access  Private (Educator)
const requestWithdrawal = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const educatorId = req.user._id;

    if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid payout amount' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find educator WITH lock/session
        const user = await User.findById(educatorId).session(session);

        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Validate wallet balance
        if (amount > user.walletBalance) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
        }

        // Deduct from wallet immediately
        await User.findByIdAndUpdate(
            educatorId,
            { $inc: { walletBalance: -amount } },
            { session }
        );

        // Create a 'debit' transaction marked as 'pending'
        const withdrawTx = await Transaction.create([{
            educatorId,
            amount: amount,
            type: 'debit',
            status: 'pending',
            description: 'Payout request to bank account'
        }], { session });

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: 'Payout requested successfully',
            transaction: withdrawTx[0]
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Payout error:", error);
        res.status(500).json({ success: false, message: 'Payout request failed' });
    } finally {
        session.endSession();
    }
});

module.exports = {
    getEarningsDashboard,
    requestWithdrawal
};
