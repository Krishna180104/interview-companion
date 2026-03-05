import { useState, useEffect } from "react";
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

  // 🎤 Voice states
  const [recording, setRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.log("Speech recognition not supported in this browser");
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";

    recog.onresult = (event) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setAnswer(transcript);
    };

    setRecognition(recog);
  }, []);

  const startRecording = () => {
    if (!recognition) return;

    recognition.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (!recognition) return;

    recognition.stop();
    setRecording(false);
  };

  const handleStart = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await startInterview();

      setQuestions(data.questions);
      setInterviewId(data.interviewId);
      setCurrentIndex(0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start interview.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!answer.trim() || loading) return;

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

        {error && <p className="text-red-500 text-sm">{error}</p>}

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

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <Card>
        <p className="text-gray-500">Loading question...</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-6">

      <h2 className="text-sm text-gray-500">
        Question {currentIndex + 1} of {questions.length}
      </h2>

      <p className="text-lg font-medium">
        {currentQuestion.question}
      </p>

      {/* Answer input */}
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={6}
        className="w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-black"
        placeholder="Type your answer or use voice..."
      />

      {/* 🎤 Voice Controls */}
      <div className="flex items-center gap-3">

        <button
          onClick={startRecording}
          disabled={recording}
          className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Start Recording
        </button>

        <button
          onClick={stopRecording}
          disabled={!recording}
          className="bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Stop Recording
        </button>

        {recording && (
          <span className="text-red-500 text-sm font-medium">
            🔴 Recording...
          </span>
        )}
      </div>

      <Button loading={loading} onClick={handleNext}>
        Next
      </Button>

    </Card>
  );
}

export default Interview;