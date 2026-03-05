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
      `${import.meta.env.VITE_API_URL}/api/interview/evaluate`,
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

      {/* Per Question Feedback */}
      {evaluation.evaluations.map((item, index) => (
        <div key={index} className="border rounded-xl p-6 space-y-2">
          <p className="font-medium">{item.question}</p>

          <p className="text-sm">
            Score: <span className="font-semibold">{item.score}/10</span>
          </p>

          <p className="text-sm text-gray-600">
            {item.feedback}
          </p>
        </div>
      ))}

      {/* Overall Section */}
      <div className="pt-6 border-t space-y-4">

        <p className="text-xl font-semibold">
          Overall Score: {evaluation.overall_score}/10
        </p>

        <p className="text-gray-600">
          {evaluation.overall_summary}
        </p>

        {/* Confidence */}
        <div className="pt-2">
          <p className="font-semibold">
            Confidence Score: {evaluation.confidence_score}/10
          </p>

          <p className="text-gray-600 text-sm">
            {evaluation.communication_feedback}
          </p>
        </div>

        {/* AI Recommendation */}
        {evaluation.ai_recommendation && (
          <div className="pt-2">
            <p className="font-semibold">
              AI Recommendation
            </p>

            <p className="text-gray-600 text-sm">
              {evaluation.ai_recommendation}
            </p>
          </div>
        )}

        {/* Structured Recommendations */}
        {evaluation.recommendations && evaluation.recommendations.length > 0 && (
          <div className="pt-2">
            <p className="font-semibold">
              Improvement Suggestions
            </p>

            <ul className="list-disc list-inside text-gray-600 text-sm">
              {evaluation.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

      </div>

    </Card>
  );
}

export default EvaluationScreen;