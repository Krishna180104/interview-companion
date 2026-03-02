import { useState } from "react";
import { uploadResume } from "../services/resumeService";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";

function Dashboard() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => {
    setError("");
    setSuccess("");

    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB");
      return;
    }

    setFile(selectedFile);
  };

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
    <div className="bg-white p-8 rounded-xl shadow-sm border max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">
        Dashboard
      </h1>

      {/* Upload Section */}
      <h2 className="text-lg font-medium mb-4">
        Upload Your Resume
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 text-sm p-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="space-y-4">

        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="block w-full text-sm border p-2 rounded"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Spinner /> : "Upload Resume"}
        </button>

      </div>

      {/* Divider */}
      <hr className="my-8" />

      {/* Start Interview Section */}
      <h2 className="text-lg font-medium mb-4">
        Mock Interview
      </h2>

      <Link
        to="/interview"
        className="w-full block text-center bg-black text-white p-3 rounded-md"
      >
        Start Interview
      </Link>

    </div>
  );
}

export default Dashboard;