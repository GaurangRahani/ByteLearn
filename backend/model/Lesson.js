const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
  title: { type: String, required: true },
  videoUrl: String,
  content: String, // text lesson
  attachmentUrl: { type: String }, 
  duration: Number,
  order: { type: Number, required: true }, // Order is a shared sequence across Lessons, Quizzes, and Assignments within the same Module
}, { timestamps: true });

// Index for rapid sequential sorting across the unified timeline
lessonSchema.index({ moduleId: 1, order: 1 });

module.exports = mongoose.model("Lesson", lessonSchema);
