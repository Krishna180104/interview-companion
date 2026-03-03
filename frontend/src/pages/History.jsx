import { useEffect, useState } from "react";
import axios from "axios";
import Card from "../components/Card";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import ScoreTrend from "../components/ScoreTrend";

function History() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:5000/api/interview/history",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setInterviews(response.data);
            } catch (error) {
                console.error("Failed to load history");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) {
        return (
            <Card>
                <p className="text-gray-500">Loading interview history...</p>
            </Card>
        );
    }

    if (!interviews.length) {
        return (
            <Card>
                <h1 className="text-3xl font-semibold mb-4">
                    Interview History
                </h1>
                <p className="text-gray-500">
                    No completed interviews yet.
                </p>
            </Card>
        );
    }

    return (
        <Card className="space-y-8">
            <div>
                <h1 className="text-3xl font-semibold mb-2">
                    Interview History
                </h1>
                <p className="text-sm text-gray-500">
                    Track your performance over time.
                </p>
            </div>
            {/* Score Trend Chart */}
            {interviews.length > 1 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-medium">
                        Performance Trend
                    </h2>
                    <ScoreTrend interviews={interviews} />
                </div>
            )}
            <div className="space-y-4">
                {interviews.map((interview) => (
                    <div
                        key={interview._id}
                        className="border rounded-xl p-6 flex justify-between items-center"
                    >
                        <div>
                            <p className="font-medium">
                                Score: {interview.evaluation?.overall_score}/10
                            </p>
                            <p className="text-sm text-gray-500">
                                {new Date(interview.createdAt).toLocaleString()}
                            </p>
                        </div>

                        <Button
                            variant="secondary"
                            onClick={() =>
                                navigate("/history/" + interview._id)
                            }
                        >
                            View Details
                        </Button>
                    </div>
                ))}
            </div>
        </Card>
    );
}

export default History;