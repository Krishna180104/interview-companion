const Interview = require("../models/Interview");
const User = require("../models/User");
const axios = require("axios");


// ============================
// START INTERVIEW
// ============================

exports.startInterview = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.parsedResume) {
      return res.status(400).json({
        message: "Please upload resume first",
      });
    }

    const aiResponse = await axios.post(
      `${process.env.AI_ENGINE_URL}/generate-questions`,
      user.parsedResume
    );

    console.log("AI QUESTION RESPONSE:", aiResponse.data);

    const questions = aiResponse.data.questions || [];

    if (!questions.length) {
      return res.status(500).json({
        message: "AI failed to generate questions",
      });
    }

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
    console.error("Start Interview Error:", error.response?.data || error.message);
    res.status(500).json({ message: "AI Interview generation failed" });
  }
};



// ============================
// SAVE ANSWER
// ============================

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
    console.error("Save Answer Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};



// ============================
// EVALUATE INTERVIEW
// ============================

exports.evaluateInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const aiResponse = await axios.post(
      `${process.env.AI_ENGINE_URL}/evaluate-interview`,
      {
        questions: interview.questions,
      }
    );

    console.log("AI EVALUATION RESPONSE:", aiResponse.data);

    const evaluation = aiResponse.data.result;

    if (!evaluation) {
      return res.status(500).json({
        message: "AI evaluation failed",
      });
    }

    interview.status = "completed";
    interview.evaluation = evaluation;

    let recommendations = [];

    // ============================
    // STRUCTURED LOGIC
    // ============================

    if (evaluation.overall_score < 6) {
      recommendations.push(
        "Your overall performance needs improvement. Focus on revising core fundamentals."
      );
    }

    if (evaluation.confidence_score < 6) {
      recommendations.push(
        "Work on communication clarity and structured answering techniques like the STAR method."
      );
    }

    if (evaluation.overall_score >= 8) {
      recommendations.push(
        "You are performing well. Try attempting higher-difficulty system design questions."
      );
    }

    // ============================
    // TECHNICAL VS BEHAVIORAL ANALYSIS
    // ============================

    const technicalScores = [];
    const behavioralScores = [];

    const evaluations = evaluation.evaluations || [];

    evaluations.forEach((item, index) => {
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
      recommendations.push(
        "Strengthen your technical depth, especially problem-solving and core concepts."
      );
    }

    if (avgBehavioral && avgBehavioral < 6) {
      recommendations.push(
        "Improve behavioral responses by preparing structured real-world examples."
      );
    }

    interview.evaluation.recommendations = recommendations;

    await interview.save();

    res.json({
      message: "Interview evaluated successfully",
      evaluation: interview.evaluation,
    });

  } catch (error) {
    console.error("Evaluation Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Evaluation failed" });
  }
};



// ============================
// GET INTERVIEW HISTORY
// ============================

exports.getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({
      user: req.user.id,
      status: "completed",
    }).sort({ createdAt: -1 });

    res.json(interviews);

  } catch (error) {
    console.error("History Error:", error.message);
    res.status(500).json({ message: "Failed to fetch history" });
  }
};



// ============================
// GET SINGLE INTERVIEW
// ============================

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
    console.error("Single Interview Error:", error.message);
    res.status(500).json({ message: "Failed to fetch interview" });
  }
};