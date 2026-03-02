import { useState } from "react";
import axios from "axios";
import Card from "./Card";
import Button from "./Button";

function EvaluationScreen({ interviewId }) {
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const token = localStorage.getItem("token");

  const handleEvaluate = async () => {
    setLoading(true);
    const response = await axios.post(
      "http://localhost:5000/api/interview/evaluate",
      { interviewId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setEvaluation(response.data.evaluation);
    setLoading(false);
  };

  if (!evaluation) {
    return (
      <Card className="space-y-6">
        <h1 className="text-3xl font-semibold">
          Interview Completed
        </h1>

        <Button loading={loading} onClick={handleEvaluate}>
          Evaluate Interview
        </Button>
      </Card>
    );
  }

  return (
    <Card className="space-y-8">
      <h1 className="text-3xl font-semibold">
        Interview Results
      </h1>

      {evaluation.evaluations.map((item, index) => (
        <div key={index} className="border rounded-xl p-6 space-y-2">
          <p className="font-medium">{item.question}</p>
          <p className="text-sm">
            Score: <span className="font-semibold">{item.score}/10</span>
          </p>
          <p className="text-sm text-gray-600">{item.feedback}</p>
        </div>
      ))}

      <div className="pt-6 border-t">
        <p className="text-xl font-semibold">
          Overall Score: {evaluation.overall_score}/10
        </p>
        <p className="text-gray-600 mt-2">
          {evaluation.overall_summary}
        </p>
      </div>
    </Card>
  );
}

export default EvaluationScreen;