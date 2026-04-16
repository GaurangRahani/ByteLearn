const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    educatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Optimized for frequent read queries by the educator
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      // Optional, as it might not be relevant for withdrawals (debits)
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for getting an educator's transactions in chronological order quickly
transactionSchema.index({ educatorId: 1, createdAt: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
