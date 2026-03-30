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

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (req.user.isBlocked) {
                return res.status(403).json({ message: 'Your account has been blocked' });
            }

            return next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const optionalProtect = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (user && !user.isBlocked) {
                req.user = user;
            }
        } catch (error) {
            //fail if token is invalid
        }
    }
    next();
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized, admin only' });
    }
};

const educator = (req, res, next) => {
    if (req.user && req.user.role === 'educator') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized, educator only' });
    }
};

const approvedEducator = (req, res, next) => {
    if (req.user && req.user.role === 'educator' && req.user.educatorApplication.status === 'approved') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized: You must be an approved educator' });
    }
};

module.exports = { protect, optionalProtect, admin, educator, approvedEducator };
