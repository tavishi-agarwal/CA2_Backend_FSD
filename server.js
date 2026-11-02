require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const app = express();

app.use(express.json());
app.use("/api/feedback", require("./routes/feedbackRoutes"));

app.get("/", (req, res) => {
  res.send("Student Feedback API is running");
});

if (require.main === module) {
  connectDB();

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
