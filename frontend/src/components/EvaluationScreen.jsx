import { useState } from "react";
import axios from "axios";
import Spinner from "./Spinner";

function EvaluationScreen({ interviewId }) {
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const token = localStorage.getItem("token");

  const handleEvaluate = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/interview/evaluate",
        { interviewId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEvaluation(response.data.evaluation);

    } catch (error) {
      alert("Evaluation failed");
    } finally {
      setLoading(false);
    }
  };

  if (!evaluation) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border max-w-xl">
        <h2 className="text-2xl font-semibold mb-4">
          Interview Completed 🎉
        </h2>

        <p className="text-gray-600 mb-6">
          Click below to evaluate your performance.
        </p>

        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="bg-black text-white px-6 py-3 rounded-md flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Spinner /> : "Evaluate Interview"}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border max-w-2xl">
      <h2 className="text-2xl font-semibold mb-6">
        Interview Results
      </h2>

      <div className="space-y-6">

        {evaluation.evaluations.map((item, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <p className="font-medium mb-2">
              {item.question}
            </p>

            <p className="text-sm mb-2">
              Score: <span className="font-semibold">{item.score}/10</span>
            </p>

            <p className="text-gray-600 text-sm">
              {item.feedback}
            </p>
          </div>
        ))}

        <hr />

        <div>
          <p className="text-lg font-semibold">
            Overall Score: {evaluation.overall_score}/10
          </p>

          <p className="text-gray-600 mt-2">
            {evaluation.overall_summary}
          </p>
        </div>

      </div>
    </div>
  );
}

export default EvaluationScreen;