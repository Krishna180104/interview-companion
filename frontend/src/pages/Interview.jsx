import { useState } from "react";
import { startInterview, saveAnswer } from "../services/interviewService";
import Card from "../components/Card";
import Button from "../components/Button";
import EvaluationScreen from "../components/EvaluationScreen";

function Interview() {
  const [questions, setQuestions] = useState([]);
  const [interviewId, setInterviewId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);

 const handleStart = async () => {
  setLoading(true);
  setError(null);

  try {
    const data = await startInterview();
    console.log("START RESPONSE:", data);

    setQuestions(data.questions);
    setInterviewId(data.interviewId);
    setCurrentIndex(0);
  } catch (err) {
    console.log("ERROR:", err.response?.data);
    setError(err.response?.data?.message || "Failed to start interview.");
  } finally {
    setLoading(false);
  }
};

  const handleNext = async () => {
    if (!answer.trim()) return;

    setLoading(true);

    try {
      await saveAnswer({
        interviewId,
        questionIndex: currentIndex,
        answer,
      });

      setAnswer("");

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setCompleted(true);
      }
    } catch (err) {
      setError("Failed to save answer.");
    } finally {
      setLoading(false);
    }
  };

  // START SCREEN
  if ((!questions || questions.length === 0) && !completed) {
    return (
      <Card className="space-y-6">
        <h1 className="text-3xl font-semibold">
          Ready to begin your interview?
        </h1>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <Button loading={loading} onClick={handleStart}>
          Start Interview
        </Button>
      </Card>
    );
  }

  // EVALUATION SCREEN
  if (completed) {
    return <EvaluationScreen interviewId={interviewId} />;
  }

  // SAFETY CHECK
  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <Card>
        <p className="text-gray-500">
          Loading question...
        </p>
      </Card>
    );
  }

  // INTERVIEW SCREEN
  return (
    <Card className="space-y-6">
      <h2 className="text-sm text-gray-500">
        Question {currentIndex + 1} of {questions.length}
      </h2>

      <p className="text-lg font-medium">
        {currentQuestion.question}
      </p>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={6}
        className="w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-black"
        placeholder="Type your answer..."
      />

      <Button loading={loading} onClick={handleNext}>
        Next
      </Button>
    </Card>
  );
}

export default Interview;