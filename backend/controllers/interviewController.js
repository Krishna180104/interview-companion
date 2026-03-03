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
      `${process.env.AI_ENGINE_URL}/generate-questions`,
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
      `${process.env.AI_ENGINE_URL}/evaluate-interview`,
      {
        questions: interview.questions,
      }
    );

    interview.status = "completed";
    interview.evaluation = aiResponse.data.result;

    const evaluation = aiResponse.data;

    let recommendations = [];

    // Structured logic
    if (evaluation.overall_score < 6) {
      recommendations.push("Your overall performance needs improvement. Focus on revising core fundamentals.");
    }

    if (evaluation.confidence_score < 6) {
      recommendations.push("Work on communication clarity and structured answering techniques like the STAR method.");
    }

    if (evaluation.overall_score >= 8) {
      recommendations.push("You are performing well. Try attempting higher-difficulty system design questions.");
    }

    // Technical vs Behavioral logic
    const technicalScores = [];
    const behavioralScores = [];

    evaluation.evaluations.forEach((item, index) => {
      const type = interview.questions[index]?.type;

      if (type === "technical") technicalScores.push(item.score);
      if (type === "behavioral") behavioralScores.push(item.score);
    });

    const avgTechnical = technicalScores.length
      ? technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length
      : null;

    const avgBehavioral = behavioralScores.length
      ? behavioralScores.reduce((a, b) => a + b, 0) / behavioralScores.length
      : null;

    if (avgTechnical && avgTechnical < 6) {
      recommendations.push("Strengthen your technical depth, especially problem-solving and core concepts.");
    }

    if (avgBehavioral && avgBehavioral < 6) {
      recommendations.push("Improve behavioral responses by preparing structured real-world examples.");
    }

    // Attach recommendations
    interview.evaluation.recommendations = recommendations;

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

exports.getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({
      user: req.user.id,
      status: "completed",
    }).sort({ createdAt: -1 })

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history" })
  }
};


exports.getSingleInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch interview" });
  }
};