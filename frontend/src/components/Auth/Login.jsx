import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      console.log("Login success:", data);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full border border-gray-300 rounded-2xl p-8 bg-white">
        <form className="space-y-6" onSubmit={handleLogin}>
          <h1 className="text-4xl font-semibold text-center">Login</h1>
          <br />

          <div>
            <label className="text-slate-900 text-sm font-medium mb-2 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border w-full px-4 py-3 rounded-md"
              placeholder="Enter email"
              required
            />
          </div>

          <div>
            <label className="text-slate-900 text-sm font-medium mb-2 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border w-full px-4 py-3 rounded-md"
              placeholder="Enter password"
              required
            />
          </div>
          <br />

          <button
            type="submit"
            className="w-full py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Login
          </button>

          <p className="text-sm text-center text-slate-600">
            Don’t have an account?
            <Link
              to="/signup"
              className="text-blue-600 ml-1 cursor-pointer hover:underline"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
