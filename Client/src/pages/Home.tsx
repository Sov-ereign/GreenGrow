import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { cropService } from "../services/cropService";
import { recommendationService } from "../services/recommendationService";
import WeatherWidget from "../components/WeatherWidget";
import RecommendationsPanel from "../components/RecommendationsPanel";
import StatsCards from "../components/StatsCards";

const Home: React.FC = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const cropStats = await cropService.getCropStats(user.id);
        setStats(cropStats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {profile?.full_name || "Farmer"}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening on your farm today.
        </p>
      </div>

      <StatsCards stats={stats} />

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
