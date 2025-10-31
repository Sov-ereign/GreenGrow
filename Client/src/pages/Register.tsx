import React, { useState } from "react";
import { Eye, EyeOff, Leaf, X } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Step 1 (Basic Info)
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password) {
      alert("Please fill all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    // Open the dialog for next details
    setShowDialog(true);
  };

  // Handle Final Submit (Step 2)
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Full Registration Data:", formData);
    axios
      .post("http://localhost:5000/api/auth/signup", formData)
      .then(() => navigate("/"))
      .catch(console.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl shadow-xl p-8 relative">
        {/* App Icon */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-full shadow-md mx-auto mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Create Account
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Step 1: Basic Information 🌱
          </p>
        </div>

        {/* Step 1 Form */}
        <form onSubmit={handleNext} className="space-y-5">
          <input
            name="fullName"
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition"
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition"
          />

          <input
            name="phoneNumber"
            type="tel"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
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
            Next
          </button>
        </form>

        {/* Step 2 Dialog */}
        {showDialog && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-md">
            <div className="bg-white rounded-3xl shadow-lg w-[90%] max-w-md p-6 relative">
              <button
                onClick={() => setShowDialog(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Step 2: Farm Details 🌾
              </h2>

              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <input
                  name="location"
                  type="text"
                  placeholder="Village / District"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition"
                />

                <input
                  name="farmSize"
                  type="number"
                  placeholder="Farm Size (in acres)"
                  value={formData.farmSize}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition"
                />

                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Bhojpuri">Bhojpuri</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Marathi">Marathi</option>
                </select>

                <button
                  type="submit"
                  className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
