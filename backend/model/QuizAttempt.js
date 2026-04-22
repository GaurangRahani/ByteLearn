const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    selectedOption: { type: Number }
  }],
  score: { type: Number },
  totalQuestions: { type: Number },
  percentage: { type: Number },
  passed: { type: Boolean },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
