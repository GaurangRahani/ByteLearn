const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
  title: { type: String, required: true },
  videoUrl: String,
  content: String, // text lesson
  attachmentUrl: { type: String }, 
  duration: Number,
  order: Number,
}, { timestamps: true });

module.exports = mongoose.model("Lesson", lessonSchema);
