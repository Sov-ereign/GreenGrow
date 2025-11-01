import React, { useState } from "react";
import { Eye, EyeOff, Leaf, X, UserPlus } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  location: string;
  farmSize: string;
  language: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    location: "",
    farmSize: "",
    language: "English",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Handle Step 1 (Basic Info)
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // Open the dialog for next details
    setShowDialog(true);
  };

  // Handle Final Submit (Step 2)
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(formData);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 sm:p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 relative">
        {/* App Icon */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-600 rounded-full shadow-md mx-auto mb-3 sm:mb-4">
            <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Create Account
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Step 1: Basic Information 🌱
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step 1 Form */}
        <form onSubmit={handleNext} className="space-y-4 sm:space-y-5">
          <input
            name="fullName"
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm sm:text-base"
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm sm:text-base"
          />

          <input
            name="phoneNumber"
            type="tel"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm sm:text-base"
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 sm:py-3 pr-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full h-11 sm:h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <UserPlus className="w-4 h-4" />
            Next
          </button>
        </form>

        {/* Step 2 Dialog */}
        {showDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg w-full max-w-md p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowDialog(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                Step 2: Farm Details 🌾
              </h2>

              {/* Error Message in Dialog */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleFinalSubmit} className="space-y-3 sm:space-y-4">
                <input
                  name="location"
                  type="text"
                  placeholder="Village / District"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm sm:text-base"
                />

                <input
                  name="farmSize"
                  type="number"
                  placeholder="Farm Size (in acres)"
                  value={formData.farmSize}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm sm:text-base"
                />

                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm sm:text-base"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Bhojpuri">Bhojpuri</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Marathi">Marathi</option>
                </select>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 sm:h-12 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating account...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Login Link */}
        <div className="text-center mt-5 sm:mt-6 text-xs sm:text-sm text-gray-500">
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-green-600 hover:text-green-700 hover:underline font-medium transition"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
