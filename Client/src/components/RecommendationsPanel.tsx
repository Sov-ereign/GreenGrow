import React, { useEffect, useState } from 'react';
import { AlertTriangle, Droplets, Bug, TrendingUp, MessageCircle, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { apiUrl } from "@/lib/env";
import { useNavigate } from "react-router-dom";

interface PlantSummary {
  id: string;
  plantName?: string;
  cropType?: string;
  location?: string;
  currentStatus?: string;
  riskLevel?: string;
  lastAssessmentAt?: string;
  latestImage?: {
    id: string;
    storagePath: string;
  } | null;
  latestAssessment?: {
    severity?: string;
    diseasePrediction?: string;
    createdAt?: string;
    recommendation?: string | null;
    nextCheckDate?: string | null;
    monitoringReason?: string | null;
    conditionTrend?: string | null;
  } | null;
}

const RecommendationsPanel: React.FC = () => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<PlantSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlants = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(apiUrl("/api/plants"), {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to load plant recommendations");
        }
        const data = await res.json();
        setPlants(data);
      } catch (err: any) {
        console.error("Error loading plant recommendations:", err);
        setError(err.message || "Failed to load plant recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getIconColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityFromPlant = (plant: PlantSummary): string => {
    return plant.latestAssessment?.severity || plant.riskLevel || 'low';
  };

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString();
  };

  const severityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return Droplets;
      case 'medium':
        return Bug;
      case 'low':
      default:
        return TrendingUp;
    }
  };

  const handleOpenChat = (plantId: string) => {
    navigate(`/chat?plantId=${plantId}`);
  };

  const handleMarkTreated = async (plantId: string) => {
    try {
      await fetch(apiUrl(`/api/plants/${plantId}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentStatus: "healthy",
          riskLevel: "low",
        }),
      });
      setPlants((prev) =>
        prev.map((p) =>
          p.id === plantId
            ? { ...p, currentStatus: "healthy", riskLevel: "low" }
            : p
        )
      );
    } catch (err) {
      console.error("Failed to mark plant as treated:", err);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Personalized Recommendations</h2>
      {loading && <p className="text-sm text-gray-500">Loading plant recommendations...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4">
        {plants.length === 0 && !loading && !error && (
          <p className="text-sm text-gray-500">
            No active plant monitoring yet. Upload a plant image in KrishiBot to get started.
          </p>
        )}

        {plants.map((plant) => {
          const severity = getSeverityFromPlant(plant);
          const Icon = severityIcon(severity);
          const priority = severity || "low";
          const title =
            plant.plantName ||
            (plant.cropType ? `${plant.cropType} Plant` : "Plant");
          const description =
            plant.latestAssessment?.recommendation ||
            plant.latestAssessment?.diseasePrediction ||
            "No recommendations yet. Upload an image to start monitoring.";
          const time = formatTime(
            plant.lastAssessmentAt || plant.latestAssessment?.createdAt
          );
          const nextCheck =
            plant.latestAssessment?.nextCheckDate &&
            formatTime(plant.latestAssessment.nextCheckDate);
          const trend = plant.latestAssessment?.conditionTrend || "unknown";

          const trendLabel =
            trend === "worsening"
              ? "Worsening"
              : trend === "improving"
              ? "Improving"
              : trend === "stable"
              ? "Stable"
              : "Monitoring";

          return (
            <div
              key={plant.id}
              className={`border-2 rounded-2xl p-4 transition-all hover:shadow-md ${getPriorityColor(
                priority
              )}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-white ${getIconColor(priority)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {plant.cropType && (
                        <span className="mr-2">{plant.cropType}</span>
                      )}
                      {time && <span>• {time}</span>}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    priority === "high"
                      ? "bg-red-100 text-red-700"
                      : priority === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {priority.toUpperCase()}
                </span>
              </div>

              <p className="text-gray-700 mb-2">{description}</p>
              {plant.latestAssessment?.monitoringReason && (
                <p className="text-xs text-gray-500 mb-2">
                  {plant.latestAssessment.monitoringReason}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-gray-600">
                <span>
                  Trend:&nbsp;
                  <span
                    className={
                      trend === "worsening"
                        ? "text-red-600 font-medium"
                        : trend === "improving"
                        ? "text-green-600 font-medium"
                        : "text-gray-700 font-medium"
                    }
                  >
                    {trendLabel}
                  </span>
                </span>
                {nextCheck && (
                  <span>
                    Next check:&nbsp;
                    <span className="font-medium">{nextCheck}</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleOpenChat(plant.id)}
                  className="inline-flex items-center bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Open Chat
                </button>
                <button
                  onClick={() => handleOpenChat(plant.id)}
                  className="inline-flex items-center bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
                >
                  <ImageIcon className="h-4 w-4 mr-1" />
                  Upload New Image
                </button>
                <button
                  onClick={() => handleMarkTreated(plant.id)}
                  className="inline-flex items-center bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                  Mark as Treated
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationsPanel;