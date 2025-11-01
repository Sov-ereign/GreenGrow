import React from "react";
import { useAuth } from "../context/AuthContext";
import WeatherWidget from "../components/WeatherWidget";
import RecommendationsPanel from "../components/RecommendationsPanel";
import StatsCards from "../components/StatsCards";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

const Home: React.FC = () => {
  const Navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.fullName || "Guest";

  return (
    <div>
      <div className="flex justify-between">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {userName}!
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Here's what's happening on your farm today.
          </p>
        </div>
        <div>
          <button
            onClick={() => Navigate("/FarmForm")}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <span className="hidden sm:inline">Add</span>
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecommendationsPanel />
        </div>

        <div className="space-y-6">
          <WeatherWidget />
        </div>
      </div>
    </div>
  );
};

export default Home;
