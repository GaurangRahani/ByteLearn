const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  title: { type: String, required: true },
  instructions: { type: String },
  questionPdfUrl: { type: String },
  totalMarks: { type: Number },
  dueDate: { type: Date },
  order: { type: Number, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model("Assignment", assignmentSchema);
