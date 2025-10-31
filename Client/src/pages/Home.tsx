import React from "react";
import WeatherWidget from "../components/WeatherWidget";
import RecommendationsPanel from "../components/RecommendationsPanel";
import StatsCards from "../components/StatsCards";

const Home: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, Team Devnest!
        </h1>
        <p className="text-gray-600">
          Here's what's happening on your farm today.
        </p>
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
