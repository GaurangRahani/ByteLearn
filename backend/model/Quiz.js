const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  title: { type: String, required: true },
  passingScore: { type: Number },
  duration: { type: Number },
  attemptsAllowed: { type: Number, default: 1 },
  order: { type: Number, required: true } // Order is a shared sequence across Lessons, Quizzes, and Assignments within the same Module
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for rapid sequential sorting across the unified timeline
quizSchema.index({ moduleId: 1, order: 1 });

quizSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'quizId'
});

module.exports = mongoose.model("Quiz", quizSchema);
