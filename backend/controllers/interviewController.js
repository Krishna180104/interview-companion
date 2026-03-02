const Interview = require("../models/Interview");
const User = require("../models/User");
const axios = require('axios');

exports.startInterview = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.parsedResume) {
      return res.status(400).json({
        message: "Please upload resume first",
      });
    }

    // Send parsed resume to FastAPI
    const aiResponse = await axios.post(
      "http://localhost:8000/generate-questions",
      user.parsedResume
    );

    const questions = aiResponse.data.questions;

    const interview = await Interview.create({
      user: req.user.id,
      questions,
    });

    res.json({
      message: "Interview started (AI Generated)",
      interviewId: interview._id,
      questions,
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "AI Interview generation failed" });
  }
};

exports.saveAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    interview.questions[questionIndex].answer = answer;

    await interview.save();

    res.json({ message: "Answer saved" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.evaluateInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Send Q&A to FastAPI
    const aiResponse = await axios.post(
      "http://localhost:8000/evaluate-interview",
      {
        questions: interview.questions,
      }
    );

    interview.status = "completed";
    interview.evaluation = aiResponse.data.result;

    await interview.save();

    res.json({
      message: "Interview evaluated successfully",
      evaluation: interview.evaluation,
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Evaluation failed" });
  }
};