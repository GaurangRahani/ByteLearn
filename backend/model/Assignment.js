const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  title: { type: String, required: true },
  instructions: { type: String },
  questionPdfUrl: { type: String },
  totalMarks: { type: Number },
  order: { type: Number, required: true } // Order is a shared sequence across Lessons, Quizzes, and Assignments within the same Module
}, {
  timestamps: true
});

// Index for rapid sequential sorting across the unified timeline
assignmentSchema.index({ moduleId: 1, order: 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
