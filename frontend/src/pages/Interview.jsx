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

  const handleStart = async () => {
    setLoading(true);
    try {
      const data = await startInterview();
      setQuestions(data.questions);
      setInterviewId(data.interviewId);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    setLoading(true);
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

    setLoading(false);
  };

  if (!questions.length && !completed) {
    return (
      <Card>
        <h1 className="text-3xl font-semibold mb-6">
          Ready to begin your interview?
        </h1>

        <Button loading={loading} onClick={handleStart}>
          Start Interview
        </Button>
      </Card>
    );
  }

  if (completed) {
    return <EvaluationScreen interviewId={interviewId} />;
  }

  return (
    <Card className="space-y-6">
      <h2 className="text-sm text-gray-500">
        Question {currentIndex + 1} of {questions.length}
      </h2>

      <p className="text-lg font-medium">
        {questions[currentIndex].question}
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