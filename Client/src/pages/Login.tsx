import React, { useState } from "react";
import { Eye, EyeOff, Leaf } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface LoginData {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Login Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please enter both email and password.");
      return;
    }

    axios
      .post("http://localhost:5000/api/auth/login", formData)
      .then(() => navigate("/dashboard")) // redirect after login
      .catch((err) => {
        console.error(err);
        alert("Invalid credentials. Please try again.");
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl shadow-xl p-8">
        {/* App Icon */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-full shadow-md mx-auto mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Login to continue 🌱</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition"
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Login
          </button>
        </form>

        {/* Extra Links */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            Don’t have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-green-600 hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
