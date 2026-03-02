import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Spinner from "./Spinner";

function Layout({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    // Simulate async operation (future API call)
    setTimeout(() => {
      localStorage.removeItem("token");
      setLoading(false);
      navigate("/");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {token && (
        <nav className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            
            <Link to="/dashboard" className="text-lg font-semibold">
              AI Interview Simulator
            </Link>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="text-sm bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Spinner /> : "Logout"}
            </button>

          </div>
        </nav>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}

export default Layout;