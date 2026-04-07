const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
  title: { type: String, required: true },
  lessonType: { type: String, enum: ['video', 'article'], default: 'video' },
  videoUrl: { type: String, default: null },
  content: { type: String, default: "" }, 
  attachmentUrl: { type: String, default: null }, // Used as visual aid image for articles
  duration: { type: Number, default: 0 },
  order: { type: Number, required: true },
}, { timestamps: true });

// Index for rapid sequential sorting across the unified timeline
lessonSchema.index({ moduleId: 1, order: 1 });

module.exports = mongoose.model("Lesson", lessonSchema);
