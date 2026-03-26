const Lesson = require('../model/Lesson');
const Module = require('../model/Module');
const Course = require('../model/Course');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

//safely delete temp files
const cleanupTempFiles = (files) => {
    if (!files) return;
    if (files.path && fs.existsSync(files.path)) {
        fs.unlinkSync(files.path);
        return;
    }
    Object.keys(files).forEach((fieldName) => {
        files[fieldName].forEach((file) => {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
    });
};

const verifyModuleOwnership = async (moduleId, userId) => {
    const module = await Module.findById(moduleId).populate('courseId');
    if (!module) return { error: 'Module not found', status: 404 };
    if (module.courseId.educatorId.toString() !== userId.toString()) {
        return { error: 'Not authorized to manage lessons in this module', status: 403 };
    }
    return { module };
};

const addLesson = async (req, res) => {
    try {
        const { title, content, order, isPreview } = req.body;
        let { duration } = req.body; 

        if (!title) {
            cleanupTempFiles(req.files);
            return res.status(400).json({ message: 'Lesson title is required' });
        }

        const { error, status } = await verifyModuleOwnership(req.params.moduleId, req.user._id);
        if (error) {
            cleanupTempFiles(req.files);
            return res.status(status).json({ message: error });
        }

        let videoUrl = "";
        if (req.files?.video?.[0]) {
            const uploadedVideo = await uploadOnCloudinary(req.files.video[0].path);
            if (!uploadedVideo) {
                return res.status(500).json({ message: 'Error uploading video to Cloudinary' });
            }
            videoUrl = uploadedVideo.secure_url;

            if (uploadedVideo.duration) {
                duration = Math.round(uploadedVideo.duration);
            }
        }

        let attachmentUrl = "";
        if (req.files?.attachment?.[0]) {
            const uploadedAttachment = await uploadOnCloudinary(req.files.attachment[0].path);
            if (!uploadedAttachment) {
                return res.status(500).json({ message: 'Error uploading attachment to Cloudinary' });
            }
            attachmentUrl = uploadedAttachment.secure_url;
        }

        const lesson = await Lesson.create({
            moduleId: req.params.moduleId,
            title,
            videoUrl,
            attachmentUrl,
            content,
            order,
            isPreview: isPreview === 'true' || isPreview === true,
            duration,
        });

        res.status(201).json(lesson);
    } catch (error) {
        cleanupTempFiles(req.files);
        res.status(500).json({ message: error.message });
    }
};

const getLessonsByModule = async (req, res) => {
    try {
        const module = await Module.findById(req.params.moduleId);
        if (!module) return res.status(404).json({ message: 'Module not found' });
        const lessons = await Lesson.find({ moduleId: req.params.moduleId }).sort({ order: 1 });
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.lessonId);
        if (!lesson) {
            cleanupTempFiles(req.files);
            return res.status(404).json({ message: 'Lesson not found' });
        }

        const { error, status } = await verifyModuleOwnership(lesson.moduleId, req.user._id);
        if (error) {
            cleanupTempFiles(req.files);
            return res.status(status).json({ message: error });
        }

        const allowedUpdates = {};
        if (req.body.title !== undefined) allowedUpdates.title = req.body.title;
        if (req.body.content !== undefined) allowedUpdates.content = req.body.content;
        if (req.body.order !== undefined) allowedUpdates.order = req.body.order;
        if (req.body.duration !== undefined) allowedUpdates.duration = req.body.duration;
        if (req.body.isPreview !== undefined) {
            allowedUpdates.isPreview = req.body.isPreview === 'true' || req.body.isPreview === true;
        }

        if (req.files?.video?.[0]) {
            const uploadedVideo = await uploadOnCloudinary(req.files.video[0].path);
            if (!uploadedVideo) {
                return res.status(500).json({ message: 'Error uploading new video' });
            }
            allowedUpdates.videoUrl = uploadedVideo.secure_url;

            //Update duration automatically on video replacement
            if (uploadedVideo.duration) {
                allowedUpdates.duration = Math.round(uploadedVideo.duration);
            }
        }

        if (req.files?.attachment?.[0]) {
            const uploadedAttachment = await uploadOnCloudinary(req.files.attachment[0].path);
            if (!uploadedAttachment) return res.status(500).json({ message: 'Error uploading new attachment' });
            allowedUpdates.attachmentUrl = uploadedAttachment.secure_url;
        }

        const updatedLesson = await Lesson.findByIdAndUpdate(
            req.params.lessonId,
            allowedUpdates,
            { new: true, runValidators: true }
        );

        res.json(updatedLesson);
    } catch (error) {
        cleanupTempFiles(req.files);
        res.status(500).json({ message: error.message });
    }
};

const deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.lessonId);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
        const { error, status } = await verifyModuleOwnership(lesson.moduleId, req.user._id);
        if (error) return res.status(status).json({ message: error });
        await Lesson.findByIdAndDelete(req.params.lessonId);
        res.json({ message: 'Lesson deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addLesson, getLessonsByModule, updateLesson, deleteLesson };
