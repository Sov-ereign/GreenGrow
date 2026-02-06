import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import WeatherWidget from "../components/WeatherWidget";
import RecommendationsPanel from "../components/RecommendationsPanel";
import StatsCards from "../components/StatsCards";
import { useNavigate } from "react-router-dom";
import { Plus, Droplets, AlertCircle, Settings, Activity } from "lucide-react";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.fullName || "Guest";

  // IoT device connection state (false = not connected)
  const [isDeviceConnected] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleStartWatering = () => {
    if (!isDeviceConnected) {
      setShowAlert(true);
    } else {
      // Future: Start watering logic
      console.log("Starting watering...");
    }
  };

  const handleConnectDevice = () => {
    navigate("/iot-connect");
  };

  return (
    <div className="space-y-6">
      {/* Header Section with Gradient Background */}
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 rounded-2xl shadow-lg p-6 md:p-8 text-white">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-md">
              Welcome back, {userName}! 🌱
            </h1>
            <p className="text-sm md:text-base text-green-50 opacity-90">
              Here's what's happening on your farm today.
            </p>
          </div>
          <button
            onClick={() => navigate("/FarmForm")}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-green-50 text-green-600 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
          >
            <span className="hidden sm:inline">Add Farm</span>
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecommendationsPanel />
        </div>

        <div className="space-y-6">
          <WeatherWidget />
        </div>
      </div>

      {/* Separate IoT Sprinkler Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Droplets className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">IoT Sprinkler System</h2>
                <p className="text-blue-100 text-sm mt-1">Smart Irrigation Control</p>
              </div>
            </div>
            <button
              onClick={handleConnectDevice}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Connection Alert */}
        {showAlert && !isDeviceConnected && (
          <div className="mx-6 mt-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-orange-900">No IoT Device Connected</h3>
                  <p className="text-xs text-orange-700 mt-1">
                    Please connect your IoT sprinkler device to enable remote watering control.
                  </p>
                  <button
                    onClick={handleConnectDevice}
                    className="mt-3 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Connect Device
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowAlert(false)}
                className="text-orange-600 hover:text-orange-800 text-xl leading-none"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Device Status */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${isDeviceConnected ? 'bg-green-100' : 'bg-red-100'}`}>
                <Activity className={`h-5 w-5 ${isDeviceConnected ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Device Status</p>
                <p className={`text-lg font-bold ${isDeviceConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isDeviceConnected ? 'Connected' : 'Not Connected'}
                </p>
              </div>
            </div>
            {!isDeviceConnected && (
              <button
                onClick={handleConnectDevice}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Connect
              </button>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <p className="text-xs text-blue-600 font-semibold mb-1">Coverage Area</p>
              <p className="text-2xl font-bold text-blue-900">2.5</p>
              <p className="text-xs text-blue-600">acres</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl border border-cyan-200">
              <p className="text-xs text-cyan-600 font-semibold mb-1">Water Usage</p>
              <p className="text-2xl font-bold text-cyan-900">0</p>
              <p className="text-xs text-cyan-600">L/min</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200">
              <p className="text-xs text-teal-600 font-semibold mb-1">Status</p>
              <p className="text-2xl font-bold text-teal-900">OFF</p>
              <p className="text-xs text-teal-600">Idle</p>
            </div>
          </div>

          {/* Control Button */}
          <button
            onClick={handleStartWatering}
            disabled={!isDeviceConnected}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all transform ${isDeviceConnected
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:scale-[1.02] hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            <div className="flex items-center justify-center space-x-3">
              <Droplets className="h-6 w-6" />
              <span>Start Watering</span>
            </div>
          </button>

          {/* Info Text */}
          <p className="text-xs text-center text-gray-500">
            {isDeviceConnected
              ? 'Click the button above to start watering your field'
              : 'Connect your IoT device to enable watering control'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
