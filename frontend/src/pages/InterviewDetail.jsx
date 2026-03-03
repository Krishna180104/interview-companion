import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";

function InterviewDetail() {
    const { id } = useParams();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/interview/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setInterview(response.data);
            } catch (error) {
                console.error("Failed to fetch interview");
            } finally {
                setLoading(false);
            }
        };

        fetchInterview();
    }, [id]);

    if (loading) {
        return (
            <Card>
                <p className="text-gray-500">Loading interview details...</p>
            </Card>
        );
    }

    if (!interview) {
        return (
            <Card>
                <p className="text-red-500">Interview not found.</p>
            </Card>
        );
    }

    const technicalScores = [];
    const behavioralScores = [];

    interview?.evaluation?.evaluations?.forEach((item, index) => {
        const questionType = interview.questions[index]?.type;

        if (questionType === "technical") {
            technicalScores.push(item.score);
        } else if (questionType === "behavioral") {
            behavioralScores.push(item.score);
        }
    });

    const avgTechnical =
        technicalScores.length
            ? (
                technicalScores.reduce((a, b) => a + b, 0) /
                technicalScores.length
            ).toFixed(1)
            : null;

    const avgBehavioral =
        behavioralScores.length
            ? (
                behavioralScores.reduce((a, b) => a + b, 0) /
                behavioralScores.length
            ).toFixed(1)
            : null;

    return (
        <Card className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-semibold mb-2">
                    Interview Details
                </h1>
                <p className="text-sm text-gray-500">
                    {new Date(interview.createdAt).toLocaleString()}
                </p>
            </div>

            {/* Overall Section */}
            {interview.evaluation && (
                <div className="border rounded-2xl p-6 space-y-4 bg-gray-50">
                    <p className="text-xl font-semibold">
                        Overall Score: {interview.evaluation.overall_score}/10
                    </p>
                    <p className="text-gray-700">
                        {interview.evaluation.overall_summary}
                    </p>
                </div>
            )}

            {(avgTechnical || avgBehavioral) && (
                <div className="grid grid-cols-2 gap-6 mt-6">
                    {avgTechnical && (
                        <div className="bg-white border rounded-xl p-4">
                            <p className="text-sm text-gray-500">
                                Technical Average
                            </p>
                            <p className="text-lg font-semibold">
                                {avgTechnical}/10
                            </p>
                        </div>
                    )}

                    {avgBehavioral && (
                        <div className="bg-white border rounded-xl p-4">
                            <p className="text-sm text-gray-500">
                                Behavioral Average
                            </p>
                            <p className="text-lg font-semibold">
                                {avgBehavioral}/10
                            </p>
                        </div>
                    )}
                </div>
            )}

            {interview.evaluation?.confidence_score && (
                <div className="mt-8 border rounded-2xl p-6 bg-gray-50 space-y-4">
                    <div>
                        <p className="text-sm text-gray-500">
                            Confidence Score
                        </p>
                        <p className="text-xl font-semibold">
                            {interview.evaluation.confidence_score}/10
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Communication Feedback
                        </p>
                        <p className="text-gray-700 mt-1">
                            {interview.evaluation.communication_feedback}
                        </p>
                    </div>
                </div>
            )}

            {/* Questions Section */}
            <div className="space-y-8">
                {interview.questions.map((q, index) => {
                    const evaluationItem =
                        interview.evaluation?.evaluations?.[index];

                    return (
                        <div
                            key={index}
                            className="border rounded-2xl p-6 space-y-4"
                        >
                            <div>
                                <p className="text-sm text-gray-500">
                                    Question {index + 1}
                                </p>
                                <p className="font-medium mt-1">
                                    {q.question}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Your Answer
                                </p>
                                <p className="text-gray-700 mt-1">
                                    {q.answer || "No answer provided."}
                                </p>
                            </div>

                            {evaluationItem && (
                                <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                                    <p className="text-sm font-medium">
                                        Score: {evaluationItem.score}/10
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {evaluationItem.feedback}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

export default InterviewDetail;