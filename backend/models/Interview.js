const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["technical", "behavioral"],
    required: true,
  },
  answer: {
    type: String,
    default: "",
  },
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [questionSchema],
    status: {
      type: String,
      default: "in-progress", // or completed
    },
    evaluation: {
      type: Object,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);