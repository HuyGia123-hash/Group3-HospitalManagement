import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      console.log("Server Response:", response.data);

      const { user } = response.data;

      if (user && user.role) {
        const userRole = user.role.toLowerCase().trim();

        localStorage.setItem("userRole", userRole);
        localStorage.setItem("userEmail", user.email);
        if (user.name) localStorage.setItem("userName", user.name);

        if (userRole === "doctor") {
          navigate("/doctor");
        } else if (userRole === "patient") {
          navigate("/patient");
        } else if (userRole === "nurse") {
          navigate("/nurse");
        } else {
          navigate("/");
        }

        window.location.reload();

      } else {
        setError("User role information not found.");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
        "Incorrect email or password!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-600">Hospital Health System</h2>
          <p className="text-gray-400 italic">Please login to continue</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-5 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Email</label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Password</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 text-white rounded-lg font-bold transition-all
            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-lg"}`}
          >
            {loading ? "Authenticating..." : "Login Now"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;