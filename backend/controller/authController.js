const User = require('../model/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();


const registerStudent = async (req, res) => {
    try {
        const { 
            name, 
            email, 
            password,
            gender,
            dateOfBirth,
            educationLevel,
            phone,
            bio,
            profilePicture
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all required fields (name, email, password)' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        const user = await User.create({ 
            name, 
            email, 
            password, 
            role: 'student', 
            otp, 
            otpExpires,
            gender,
            dateOfBirth,
            educationLevel,
            phone,
            bio,
            profilePicture
        });

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify your ByteLearn Account',
                message: `Your OTP is ${otp}. It will expire in 10 minutes.`
            });
        } catch (err) {
            //delete user if email fails so they can try again
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
        }

        res.status(201).json({ message: 'Registration successful. Please verify OTP sent to email.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const registerEducator = async (req, res) => {
    try {
        const { name, email, password, qualifications, experience } = req.body;
        if (!name || !email || !password || !qualifications || !experience) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        const user = await User.create({
            name, email, password, role: 'educator', otp, otpExpires,
            educatorApplication: {
                qualifications,
                experience,
                status: 'pending',
                appliedAt: new Date()
            }
        });

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify your ByteLearn Educator Account',
                message: `Your OTP is ${otp}. It will expire in 10 minutes.`
            });
        } catch (err) {
            //delete user if email fails so they can try again
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
        }

        res.status(201).json({ message: 'Registration successful. Please verify OTP sent to email.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            if (!user.isVerified) {
                return res.status(403).json({ message: 'Account not verified. Please verify OTP.' });
            }
            //Block check
            if (user.isBlocked) {
                return res.status(403).json({ message: 'Your account has been suspended. Contact support.' });
            }

            //Update lastLogin
            user.lastLogin = Date.now();
            await user.save();

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                educatorApplication: user.educatorApplication,
                profilePicture: user.profilePicture,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth,
                educationLevel: user.educationLevel,
                phone: user.phone,
                bio: user.bio,
                lastLogin: user.lastLogin,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        //
        if (req.body.email && req.body.email !== user.email) {
            const emailTaken = await User.findOne({ email: req.body.email });
            if (emailTaken) {
                return res.status(400).json({ message: 'Email already in use by another account' });
            }
            user.email = req.body.email;
            user.isVerified = false;

            const otp = generateOTP();
            user.otp = otp;
            user.otpExpires = Date.now() + 10 * 60 * 1000;

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Verify your new ByteLearn email',
                    message: `Your OTP to verify your new email is ${otp}. It expires in 10 minutes.`
                });
            } catch (err) {
                return res.status(500).json({ message: 'Failed to send verification email. Email not updated.' });
            }
        }

        user.name = req.body.name || user.name;
        user.profilePicture = req.body.profilePicture || user.profilePicture;
        user.gender = req.body.gender || user.gender;
        user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
        user.educationLevel = req.body.educationLevel || user.educationLevel;
        user.phone = req.body.phone || user.phone;
        user.bio = req.body.bio || user.bio;
        if (req.body.password) {
            return res.status(400).json({ message: 'Use change-password to update your password.' });
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            isVerified: updatedUser.isVerified,
            ...(updatedUser.isVerified === false && { message: 'Email updated. Please verify your new email with the OTP sent.' })
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both old and new password' });
        }

        const user = await User.findById(req.user._id).select('+password');
        if (user && (await user.matchPassword(oldPassword))) {
            user.password = newPassword;
            user.passwordChangedAt = Date.now();
            await user.save();
            res.json({ message: 'Password changed successfully' });
        } else {
            res.status(401).json({ message: 'Invalid old password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllEducators = async (req, res) => {
    try {
        const status = req.query.status;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { role: 'educator' };
        if (status) filter['educatorApplication.status'] = status;

        const total = await User.countDocuments(filter);
        const educators = await User.find(filter)
            .select('-password -otp -otpExpires')
            .skip(skip)
            .limit(limit);

        res.json({
            page,
            totalPages: Math.ceil(total / limit),
            totalEducators: total,
            educators
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateEducatorStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected".' });
        }

        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'educator') {
            return res.status(404).json({ message: 'Educator not found' });
        }

        user.educatorApplication.status = status;
        await user.save();

        const subject = status === 'approved'
            ? '🎉 Your ByteLearn Educator Application is Approved!'
            : 'Update on your ByteLearn Educator Application';

        const message = status === 'approved'
            ? `Hi ${user.name}, congratulations! Your educator application has been approved. You can now log in and start creating courses.`
            : `Hi ${user.name}, after review, your educator application was not approved at this time. You may re-apply with updated credentials.`;

        try {
            await sendEmail({ email: user.email, subject, message });
        } catch (err) {
            console.error('Notification email failed:', err.message);
        }


        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            educatorApplication: {
                status: user.educatorApplication.status,
                appliedAt: user.educatorApplication.appliedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Please provide email and OTP' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        user.lastLogin = Date.now();
        await user.save();

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Please provide email' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

        //only allow resend after 60 seconds
        const cooldown = 60 * 1000; // 60 seconds
        if (user.otpExpires && (user.otpExpires - Date.now()) > (10 * 60 * 1000 - cooldown)) {
            return res.status(429).json({ message: 'Please wait 60 seconds before requesting a new OTP.' });
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        try {
            await sendEmail({
                email: user.email,
                subject: 'Your New OTP for ByteLearn',
                message: `Your new OTP is ${otp}. It will expire in 10 minutes.`
            });
        } catch (err) {
            console.error('Email send failed:', err.message);
        }

        res.json({ message: 'New OTP sent to email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
};
