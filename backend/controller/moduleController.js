const Module = require('../model/Module');
const Course = require('../model/Course');

const addModule = async (req, res) => {
    try {
        const { title, order } = req.body;

        if (!title || order === undefined) {
            return res.status(400).json({ message: 'Title and order are required' });
        }

        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        //Only the educator who owns the course can add modules
        if (course.educatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to add modules to this course' });
        }

        const module = await Module.create({
            courseId: req.params.courseId,
            title,
            order,
        });

        res.status(201).json(module);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getModulesByCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const modules = await Module.find({ courseId: req.params.courseId }).sort({ order: 1 });

        res.json(modules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateModule = async (req, res) => {
    try {
        const module = await Module.findById(req.params.moduleId).populate('courseId');

        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Check that the requesting educator owns the course this module belongs to
        if (module.courseId.educatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this module' });
        }

        // Whitelist allowed updates — courseId and _id cannot be changed
        const allowedUpdates = {};
        if (req.body.title !== undefined) allowedUpdates.title = req.body.title;
        if (req.body.order !== undefined) allowedUpdates.order = req.body.order;

        const updatedModule = await Module.findByIdAndUpdate(
            req.params.moduleId,
            allowedUpdates,
            { new: true, runValidators: true }
        );

        res.json(updatedModule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteModule = async (req, res) => {
    try {
        const module = await Module.findById(req.params.moduleId).populate('courseId');

        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        if (module.courseId.educatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this module' });
        }

        await Module.findByIdAndDelete(req.params.moduleId);
        //TODO : Add cascading deletes for lessons and quizzes
        res.json({ message: 'Module deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addModule,
    getModulesByCourse,
    updateModule,
    deleteModule,
};
