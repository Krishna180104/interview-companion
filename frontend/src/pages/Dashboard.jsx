import { useState } from "react";
import { uploadResume } from "../services/resumeService";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";

function Dashboard() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await uploadResume(file);
      setSuccess(data.message);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="space-y-10">

      <div>
        <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Upload your resume and start your AI-powered mock interview.
        </p>
      </div>

      {/* Resume Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Resume</h2>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border rounded-xl p-3"
        />

        <Button loading={loading} onClick={handleUpload} className="w-full">
          Upload Resume
        </Button>
      </div>

      {/* Interview Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Mock Interview</h2>

        <Link to="/interview">
          <Button className="w-full">Start Interview</Button>
        </Link>
        
        <Link to="/history">
          <Button variant="secondary" className="w-full mt-3">
            View Interview History
          </Button>
        </Link>
      </div>

    </Card>
  );
}

export default Dashboard;