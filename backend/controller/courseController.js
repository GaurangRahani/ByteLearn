const Course = require('../model/Course');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

//delete a temp file if it exists
const cleanupTempFile = (file) => {
    if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
    }
};

const createCourse = async (req, res) => {
    try {
        const { title, description, category, level, price, isPaid, language } = req.body;

        if (!title || !description) {
            cleanupTempFile(req.file);
            return res.status(400).json({ message: 'Title and description are required' });
        }

        let thumbnailUrl = "";
        if (req.file) {
            const uploadedImage = await uploadOnCloudinary(req.file.path);
            if (!uploadedImage) {
                return res.status(500).json({ message: 'Error uploading thumbnail to Cloudinary' });
            }
            thumbnailUrl = uploadedImage.secure_url;
        }

        const course = await Course.create({
            educatorId: req.user._id,
            title,
            description,
            thumbnail: thumbnailUrl,
            category,
            level,
            price,
            isPaid,
            language,
            status: 'draft'
        });

        res.status(201).json(course);
    } catch (error) {
        cleanupTempFile(req.file);
        res.status(500).json({ message: error.message });
    }
};

const getEducatorCourses = async (req, res) => {
    try {
        const courses = await Course.find({ educatorId: req.user._id }).sort({ createdAt: -1 });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('educatorId', 'name profilePicture bio');

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            cleanupTempFile(req.file);
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.educatorId.toString() !== req.user._id.toString()) {
            cleanupTempFile(req.file);
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }

        //Explicitly whitelist updatable fields
        const allowedUpdates = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            tags: req.body.tags,
            level: req.body.level,
            price: req.body.price,
            isPaid: req.body.isPaid,
            language: req.body.language,
        };

        //Remove undefined keys 
        Object.keys(allowedUpdates).forEach(
            (key) => allowedUpdates[key] === undefined && delete allowedUpdates[key]
        );

        //thumbnail upload
        if (req.file) {
            const uploadedImage = await uploadOnCloudinary(req.file.path);
            if (!uploadedImage) {
                return res.status(500).json({ message: 'Error uploading new thumbnail to Cloudinary' });
            }
            allowedUpdates.thumbnail = uploadedImage.secure_url;
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            allowedUpdates,
            { new: true, runValidators: true }
        );

        res.json(updatedCourse);
    } catch (error) {
        cleanupTempFile(req.file);
        res.status(500).json({ message: error.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.educatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this course' });
        }

        await Course.findByIdAndDelete(req.params.id);

        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCourse,
    getEducatorCourses,
    getCourseById,
    updateCourse,
    deleteCourse
};
