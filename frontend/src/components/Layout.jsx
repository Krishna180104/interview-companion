import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "./Button";

function Layout({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      setLoading(false);
      navigate("/");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {token && (
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-8 py-6 flex justify-between items-center">
            <Link to="/dashboard" className="text-xl font-semibold">
              AI Interview
            </Link>

            <Button loading={loading} onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </nav>
      )}

      <main className="max-w-4xl mx-auto px-8 py-12">
        {children}
      </main>
    </div>
  );
}

export default Layout;