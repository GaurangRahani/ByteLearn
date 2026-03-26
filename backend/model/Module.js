const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  title: { type: String, required: true },
  order: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Module", moduleSchema);
