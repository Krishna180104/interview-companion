import { useState } from "react";
import { startInterview, saveAnswer } from "../services/interviewService";
import Spinner from "../components/Spinner";
import EvaluationScreen from "../components/EvaluationScreen";

function Interview() {
  const [questions, setQuestions] = useState([]);
  const [interviewId, setInterviewId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const data = await startInterview();
      setQuestions(data.questions);
      setInterviewId(data.interviewId);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!answer.trim()) return alert("Please enter an answer");

    setLoading(true);

    try {
      await saveAnswer({
        interviewId,
        questionIndex: currentIndex,
        answer,
      });

      setAnswer("");

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCompleted(true);
      }

    } catch (error) {
      alert("Failed to save answer");
    } finally {
      setLoading(false);
    }
  };

  if (!questions.length && !completed) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border max-w-xl">
        <h2 className="text-2xl font-semibold mb-6">
          Ready to start your AI Interview?
        </h2>

        <button
          onClick={handleStart}
          disabled={loading}
          className="bg-black text-white px-6 py-3 rounded-md flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Spinner /> : "Start Interview"}
        </button>
      </div>
    );
  }

  if (completed) {
    return <EvaluationScreen interviewId={interviewId} />;
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border max-w-xl">
      <h2 className="text-lg font-medium mb-4">
        Question {currentIndex + 1} of {questions.length}
      </h2>

      <p className="mb-6 font-semibold">
        {questions[currentIndex].question}
      </p>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={5}
        className="w-full border rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-black"
        placeholder="Type your answer here..."
      />

      <button
        onClick={handleNext}
        disabled={loading}
        className="bg-black text-white px-6 py-3 rounded-md flex items-center gap-2 disabled:opacity-50"
      >
        {loading ? <Spinner /> : "Next"}
      </button>
    </div>
  );
}

export default Interview;