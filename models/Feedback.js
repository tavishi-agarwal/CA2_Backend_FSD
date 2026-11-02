const mongoose = require("mongoose");
const feedbackSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, "student name is required"],
      trim: true
    },
    courseName: {
      type: String,
      required: [true, "course name is required"],
      trim: true
    },
    message: {
      type: String,
      required: [true, "feedback message is required"],
      trim: true
    },
    rating: {
      type: Number,
      required: [true, "rating is required"],
      min: [1, "rating must be at least 1"],
      max: [5, "rating cannot exceed 5"]
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed"],
      default: "Pending"
    }
  },
  { timestamps: true }
);
module.exports = mongoose.model("Feedback", feedbackSchema);
