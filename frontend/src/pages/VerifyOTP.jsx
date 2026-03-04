import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

const API = import.meta.env.VITE_API_URL;

function VerifyOTP() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    const storedEmail = localStorage.getItem("verifyEmail");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter complete OTP");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(`${API}/api/auth/verify-otp`, {
        email,
        otp: otpValue,
      });

      localStorage.setItem("token", res.data.token);

      setMessage("Email verified successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);

    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(`${API}/api/auth/resend-otp`, { email });

      setMessage(res.data.message);
      setTimer(30);

    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-md">

        <h2 className="text-2xl font-semibold text-center mb-4">
          Verify your Email
        </h2>

        <p className="text-sm text-gray-500 text-center mb-6">
          Enter the 6 digit code sent to
          <br />
          <span className="font-medium">{email}</span>
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-2 rounded mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-600 text-sm p-2 rounded mb-4">
            {message}
          </div>
        )}

        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              className="w-12 h-12 border rounded-lg text-center text-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Spinner /> : "Verify OTP"}
        </button>

        <div className="text-center mt-4 text-sm">

          {timer > 0 ? (
            <p className="text-gray-500">
              Resend OTP in {timer}s
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-black font-medium"
            >
              {resendLoading ? "Sending..." : "Resend OTP"}
            </button>
          )}

        </div>

      </div>
    </div>
  );
}

export default VerifyOTP;