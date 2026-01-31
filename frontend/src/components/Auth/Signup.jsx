import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/api/v1/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      console.log("Signup success:", data);
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="max-w-md w-full border border-gray-300 rounded-2xl p-8 bg-white">
        <form className="space-y-6">
          <h1 className="text-4xl font-semibold text-center">Sign Up</h1>
          <br />
          <div>
            <label className="text-slate-900 text-sm font-medium mb-2 block">
              Email Id
            </label>
            <input
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-slate-900 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="text-slate-900 text-sm font-medium mb-2 block">
              Password
            </label>
            <input
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-slate-900 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500"
              placeholder="Enter password"
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="text-slate-600 ml-3 text-sm"
            >
              I accept the{" "}
              <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                Terms and Conditions
              </span>
            </label>
          </div>

          <button
            onClick={handleSignup}
            type="button"
            className="w-full py-3 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Create an account
          </button>

          <p className="text-slate-600 text-sm text-center">
            Already have an account?
            <Link
              to="/login"
              className="text-blue-600 ml-1 cursor-pointer hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
