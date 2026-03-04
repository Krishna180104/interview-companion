import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Interview from "./pages/Interview";
import History from "./pages/History";
import InterviewDetail from "./pages/InterviewDetail";
import VerifyOTP from "./pages/VerifyOTP";

function App() {
  return (
    <Router>
      <Routes>

        {/* Auth Pages (No Navbar, Centered) */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Pages (With Navbar Layout) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <Layout>
                <Interview />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Layout>
                <History />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/history/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <InterviewDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/verify-otp" element={<VerifyOTP />} />

      </Routes>
    </Router>
  );
}

export default App;