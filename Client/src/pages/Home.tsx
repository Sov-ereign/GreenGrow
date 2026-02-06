import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import WeatherWidget from "../components/WeatherWidget";
import RecommendationsPanel from "../components/RecommendationsPanel";
import StatsCards from "../components/StatsCards";
import { useNavigate } from "react-router-dom";
import { Plus, Droplets, Power, Wifi, WifiOff } from "lucide-react";

const Home: React.FC = () => {
  const Navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.fullName || "Guest";
  const [sprinklerOn, setSprinklerOn] = useState(false);
  const [showConnectMessage, setShowConnectMessage] = useState(false);

  const handleSprinklerToggle = () => {
    setSprinklerOn(!sprinklerOn);
    setShowConnectMessage(true);
    setTimeout(() => setShowConnectMessage(false), 3000);
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
            onClick={() => Navigate("/FarmForm")}
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

          {/* IoT Sprinkler Control Section */}
          <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-2xl shadow-lg border-2 border-blue-100 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Droplets className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">IoT Sprinkler System</h2>
                  <p className="text-sm text-gray-500">Smart irrigation control</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                {showConnectMessage ? (
                  <span className="flex items-center text-orange-600 font-medium animate-pulse">
                    <WifiOff className="h-4 w-4 mr-1" />
                    Not Connected
                  </span>
                ) : (
                  <span className="flex items-center text-gray-400">
                    <WifiOff className="h-4 w-4 mr-1" />
                    Offline
                  </span>
                )}
              </div>
            </div>

            {/* Connection Status Message */}
            {showConnectMessage && (
              <div className="mb-4 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-lg animate-fade-in">
                <div className="flex items-start">
                  <Wifi className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-orange-800">Connect IoT Device</p>
                    <p className="text-xs text-orange-600 mt-1">
                      Please connect your IoT sprinkler device to enable remote control.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Control Panel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-100">
                <div className="flex items-center space-x-3">
                  <Power className={`h-6 w-6 ${sprinklerOn ? 'text-green-500' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-semibold text-gray-800">Sprinkler Status</p>
                    <p className="text-sm text-gray-500">
                      {sprinklerOn ? 'Active - Watering in progress' : 'Inactive - Ready to start'}
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={handleSprinklerToggle}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${sprinklerOn ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${sprinklerOn ? 'translate-x-7' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium mb-1">Coverage Area</p>
                  <p className="text-lg font-bold text-blue-800">2.5 acres</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg border border-cyan-200">
                  <p className="text-xs text-cyan-600 font-medium mb-1">Water Usage</p>
                  <p className="text-lg font-bold text-cyan-800">0 L/min</p>
                </div>
              </div>

              {/* Connect Device Button */}
              <button
                onClick={handleSprinklerToggle}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2"
              >
                <Wifi className="h-5 w-5" />
                <span>Connect IoT Device</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <WeatherWidget />
        </div>
      </div>
    </div>
  );
};

export default Home;
