import { useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import Spinner from "../components/Spinner";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setError("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await registerUser(formData);

      // Save email for OTP verification page
      localStorage.setItem("verifyEmail", formData.email);

      setMessage("OTP sent to your email. Please verify.");

      // Redirect to OTP page
      setTimeout(() => {
        navigate("/verify-otp");
      }, 1200);

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-md">

        <h2 className="text-2xl font-semibold text-center mb-6">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-2 rounded">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 text-green-600 text-sm p-2 rounded">
              {message}
            </div>
          )}

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-3 rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Spinner /> : "Register"}
          </button>

        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/" className="text-black font-medium">
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Register;