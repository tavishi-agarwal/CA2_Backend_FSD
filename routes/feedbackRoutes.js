const express = require("express");
const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");

const router = express.Router();

router.post("/", async (req, res) => {
  const { studentName, courseName, message, rating } = req.body;
  const missingFields = ["studentName", "courseName", "message"].filter(
    (field) => typeof req.body[field] !== "string" || !req.body[field].trim()
  );

  if (rating === undefined || rating === null || rating === "") {
    missingFields.push("rating");
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: "Required fields are missing",
      fields: missingFields
    });
  }

  const numericRating = Number(rating);
  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({
      message: "Rating must be a number between 1 and 5"
    });
  }

  try {
    const feedback = await Feedback.create({
      studentName,
      courseName,
      message,
      rating: numericRating
    });

    return res.status(201).json({
      message: "Feedback submitted successfully",
      feedback
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message
      });
    }

    console.error("Failed to save feedback:", error);
    return res.status(500).json({
      message: "Failed to save feedback"
    });
  }
});

router.get("/", async (req, res) => {
  const parsedPage = Number.parseInt(req.query.page, 10);
  const parsedLimit = Number.parseInt(req.query.limit, 10);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 100)
      : 10;

  try {
    const [feedbacks, totalRecords] = await Promise.all([
      Feedback.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Feedback.countDocuments()
    ]);

    return res.status(200).json({
      currentPage: page,
      totalRecords,
      feedbacks
    });
  } catch (error) {
    console.error("Failed to retrieve feedback:", error);
    return res.status(500).json({
      message: "Failed to retrieve feedback"
    });
  }
});

router.patch("/:id", async (req, res) => {
  const { status } = req.body;

  if (!["Pending", "Reviewed"].includes(status)) {
    return res.status(400).json({
      message: "Status must be Pending or Reviewed"
    });
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid feedback ID"
    });
  }

  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({
        message: "Feedback record not found"
      });
    }

    return res.status(200).json({
      message: "Feedback status updated successfully",
      feedback
    });
  } catch (error) {
    console.error("Failed to update feedback status:", error);
    return res.status(500).json({
      message: "Failed to update feedback status"
    });
  }
});

module.exports = router;
