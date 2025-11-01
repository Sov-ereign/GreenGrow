import React, { useState, useEffect } from "react";
import {
  User,
  Bell,
  Shield,
  Globe,
  Smartphone,
  Mail,
  MapPin,
  Edit,
  Save,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Settings: React.FC = () => {
  const { user, loading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    weather: true,
    market: true,
    crops: false,
    schemes: true,
  });

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    farmSize: "",
    language: "English",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.fullName || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
        location: user.location || "",
        farmSize: user.farmSize || "",
        language: user.language || "English",
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setSaving(true);
    try {
      // Update profile via API - map fields correctly
      const response = await axios.put(
        `${API_BASE_URL}/api/auth/profile`,
        {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          farmSize: profile.farmSize,
          language: profile.language,
        },
        { withCredentials: true }
      );
      
      if (response.data) {
        updateUser(response.data);
        alert("Profile updated successfully!");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Please login to access settings.</p>
        <button
          onClick={() => navigate("/login")}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Settings
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Manage your account and application preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
            <div className="flex items-center space-x-3 mb-4 md:mb-6">
              <User className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                Profile Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                  />
                  <Edit className="absolute right-3 top-2.5 md:top-3 h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                  />
                  <Mail className="absolute right-3 top-2.5 md:top-3 h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                  />
                  <Smartphone className="absolute right-3 top-2.5 md:top-3 h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) =>
                      setProfile({ ...profile, location: e.target.value })
                    }
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                  />
                  <MapPin className="absolute right-3 top-2.5 md:top-3 h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Farm Size
                </label>
                <input
                  type="text"
                  value={profile.farmSize}
                  onChange={(e) =>
                    setProfile({ ...profile, farmSize: e.target.value })
                  }
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={profile.language}
                  onChange={(e) =>
                    setProfile({ ...profile, language: e.target.value })
                  }
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Punjabi">Punjabi</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Bhojpuri">Bhojpuri</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Marathi">Marathi</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-4 md:mt-6 bg-green-500 text-white py-2 md:py-3 px-4 md:px-6 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm md:text-base w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
            <div className="flex items-center space-x-3 mb-4 md:mb-6">
              <Bell className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                Notification Preferences
              </h2>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 text-sm md:text-base">
                    Weather Alerts
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    Get notified about weather changes
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.weather}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        weather: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 text-sm md:text-base">
                    Market Price Updates
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    Receive market price notifications
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.market}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        market: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 text-sm md:text-base">
                    Crop Health Alerts
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    Get alerts about crop health issues
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.crops}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        crops: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 text-sm md:text-base">
                    Government Schemes
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    Updates on new schemes and deadlines
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.schemes}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        schemes: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
            <div className="flex items-center space-x-3 mb-4 md:mb-6">
              <Shield className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                Security
              </h2>
            </div>

            <div className="space-y-3 md:space-y-4">
              <button className="w-full text-left p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <h3 className="font-medium text-gray-800 text-sm md:text-base">
                  Change Password
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Update your account password
                </p>
              </button>

              <button className="w-full text-left p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <h3 className="font-medium text-gray-800 text-sm md:text-base">
                  Two-Factor Authentication
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Add extra security to your account
                </p>
              </button>

              <button className="w-full text-left p-3 md:p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <h3 className="font-medium text-red-800 text-sm md:text-base">
                  Delete Account
                </h3>
                <p className="text-xs md:text-sm text-red-600">
                  Permanently delete your account
                </p>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
            <div className="flex items-center space-x-3 mb-4 md:mb-6">
              <Globe className="h-5 w-5 md:h-6 md:w-6 text-purple-500" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                App Preferences
              </h2>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Units
                </label>
                <select className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base">
                  <option value="metric">Metric (°C, km/h)</option>
                  <option value="imperial">Imperial (°F, mph)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
