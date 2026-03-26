const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
  title: { type: String, required: true },
  videoUrl: String,
  content: String, // text lesson
  attachments: [String],
  attachmentUrl: { type: String }, // FIX 4: explicit field for single PDF/attachment
  duration: Number,
  order: Number,
  isPreview: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Lesson", lessonSchema);
