const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  educatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: String,
  category: String,
  tags: [String],
  price: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
  },
  language: { type: String, default: "English" },
  status: {
    type: String,
    enum: ["draft", "pending", "approved", "rejected"],
    default: "draft",
  },
  adminFeedback: String,
  totalDuration: Number,
  totalLessons: Number,
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
