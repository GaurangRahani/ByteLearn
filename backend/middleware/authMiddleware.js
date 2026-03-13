const jwt = require('jsonwebtoken');
const User = require('../model/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized, admin only' });
    }
};

const approvedEducator = (req, res, next) => {
    if (req.user && req.user.role === 'educator' && req.user.educatorApplication.status === 'approved') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized: You must be an approved educator' });
    }
};

module.exports = { protect, admin, approvedEducator };
