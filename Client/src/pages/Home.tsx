import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import WeatherWidget from "../components/WeatherWidget";
import RecommendationsPanel from "../components/RecommendationsPanel";
import StatsCards from "../components/StatsCards";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "@/lib/env";
import {
  Plus,
  Droplets,
  AlertCircle,
  Settings,
  Activity,
  Sparkles,
  Bell,
} from "lucide-react";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.fullName || "Guest";

  const [isDeviceConnected] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [priorities, setPriorities] = useState<
    { title: string; detail: string }[]
  >([]);

  const handleStartWatering = () => {
    if (!isDeviceConnected) {
      setShowAlert(true);
    } else {
      console.log("Starting watering...");
    }
  };

  const handleConnectDevice = () => {
    navigate("/iot-connect");
  };

  useEffect(() => {
    const computePriorities = async () => {
      try {
        const res = await fetch(apiUrl("/api/plants"), { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        const actions: { title: string; detail: string }[] = [];

        const highRisk = data.filter((p: any) => (p.riskLevel || "").toLowerCase() === "high");
        if (highRisk.length) {
          actions.push({
            title: "Inspect high-risk plants",
            detail: `${highRisk.length} flagged today`,
          });
        }

        const now = Date.now();
        const dueFollowups = data.filter((p: any) => {
          const d = p.latestAssessment?.nextCheckDate
            ? new Date(p.latestAssessment.nextCheckDate).getTime()
            : null;
          return d !== null && d <= now;
        });
        if (dueFollowups.length) {
          actions.push({
            title: "Upload fresh photos",
            detail: `${dueFollowups.length} follow-ups due`,
          });
        }

        const worsening = data.filter(
          (p: any) =>
            (p.latestAssessment?.conditionTrend || "").toLowerCase() === "worsening"
        );
        if (worsening.length) {
          actions.push({
            title: "Re-scan worsening plants",
            detail: `${worsening.length} need attention`,
          });
        }

        if (actions.length === 0) {
          actions.push({
            title: "Keep monitoring",
            detail: "All plants stable. Upload new images weekly.",
          });
        }

        setPriorities(actions.slice(0, 3));
      } catch (err) {
        console.error("Failed to compute priorities", err);
      }
    };

    computePriorities();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 rounded-3xl shadow-lg p-6 md:p-8 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_top_right,#fff,transparent_45%)]" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-50 font-semibold">
              Continuous Plant Health Dashboard
            </p>
            <h1 className="text-3xl md:text-4xl font-bold drop-shadow-sm">
              Welcome back, {userName}
            </h1>
            <p className="text-sm md:text-base text-emerald-50/90">
              Live monitoring, clearer priorities, and faster follow-ups.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/FarmForm")}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-700 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Farm
            </button>
          </div>
        </div>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          <RecommendationsPanel />
        </div>

        <div className="space-y-4 xl:col-span-4">
          <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-emerald-600 font-semibold">
                  Today
                </p>
                <h3 className="text-lg font-bold text-slate-900">
                  Priority actions
                </h3>
              </div>
              <Bell className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="space-y-2">
              {priorities.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-600">{item.detail}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    Go
                  </span>
                </div>
              ))}
            </div>
          </section>
          <WeatherWidget />
        </div>
      </div>

      {/* IoT Sprinkler Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Droplets className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">IoT Sprinkler System</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Smart Irrigation Control
                </p>
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

        {showAlert && !isDeviceConnected && (
          <div className="mx-6 mt-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-orange-900">
                    No IoT Device Connected
                  </h3>
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

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${isDeviceConnected ? "bg-green-100" : "bg-red-100"
                  }`}
              >
                <Activity
                  className={`h-5 w-5 ${isDeviceConnected ? "text-green-600" : "text-red-600"
                    }`}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Device Status</p>
                <p
                  className={`text-lg font-bold ${isDeviceConnected ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {isDeviceConnected ? "Connected" : "Not Connected"}
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

          <div className="grid grid-cols-3 gap-4">
            <DeviceMetric label="Coverage Area" value="2.5" unit="acres" tone="blue" />
            <DeviceMetric label="Water Usage" value="0" unit="L/min" tone="cyan" />
            <DeviceMetric label="Status" value="OFF" unit="Idle" tone="teal" />
          </div>

          <button
            onClick={handleStartWatering}
            disabled={!isDeviceConnected}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all transform ${isDeviceConnected
                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:scale-[1.02] hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            <div className="flex items-center justify-center space-x-3">
              <Droplets className="h-6 w-6" />
              <span>Start Watering</span>
            </div>
          </button>
          <p className="text-xs text-center text-gray-500">
            {isDeviceConnected
              ? "Click the button above to start watering your field"
              : "Connect your IoT device to enable watering control"}
          </p>
        </div>
      </div>
    </div>
  );
};

const DeviceMetric = ({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  tone: "blue" | "cyan" | "teal";
}) => {
  const toneMap = {
    blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-900",
    cyan: "from-cyan-50 to-cyan-100 border-cyan-200 text-cyan-900",
    teal: "from-teal-50 to-teal-100 border-teal-200 text-teal-900",
  };
  return (
    <div
      className={`p-4 bg-gradient-to-br ${toneMap[tone]} rounded-xl border`}
    >
      <p className="text-xs text-gray-600 font-semibold mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-600">{unit}</p>
    </div>
  );
};

export default Home;
