const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  attemptNumber: { type: Number, default: 1 },
  status: { type: String, enum: ['in-progress', 'completed', 'timed-out', 'abandoned'], default: 'in-progress' },
  answers: [{
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
      selectedOption: { type: Number, default: null },
      isCorrect: { type: Boolean, default: false },
      marksEarned: { type: Number, default: 0 }
  }],
  score: { type: Number, default: 0 },
  totalMarksPossible: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  passingScoreSnap: { type: Number, required: true },
  passed: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  timeTaken: { type: Number }
}, { timestamps: true });

quizAttemptSchema.index({ studentId: 1, quizId: 1, attemptNumber: -1 });
quizAttemptSchema.index({ courseId: 1, status: 1 });
quizAttemptSchema.index({ status: 1, startedAt: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
