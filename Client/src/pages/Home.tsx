import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "@/lib/env";
import { ScanLine, Mic, Droplets, Settings, Activity, AlertCircle, Plus } from "lucide-react";

// New home section components
import SmartBanner from "../components/home/SmartBanner";
import ActionCards from "../components/home/ActionCards";
import Alerts from "../components/home/Alerts";
import CropsList from "../components/home/CropsList";
import FloatingAIButton from "../components/home/FloatingAIButton";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.fullName || "Farmer";

  // Keep the existing priority computation — passed down to ActionCards
  const [priorities, setPriorities] = useState<{ title: string; detail: string }[]>([]);

  // IoT state retained (for IoT page link / status badge)
  const [isDeviceConnected] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleConnectDevice = () => navigate("/iot-connect");
  const handleStartWatering = () => {
    if (!isDeviceConnected) setShowAlert(true);
  };

  useEffect(() => {
    const computePriorities = async () => {
      try {
        const res = await fetch(apiUrl("/api/plants"), { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        const actions: { title: string; detail: string }[] = [];

        const highRisk = data.filter(
          (p: any) => (p.riskLevel || "").toLowerCase() === "high"
        );
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
    <div className="space-y-6 pb-24">
      {/* ── 1. Smart Hero Banner ─────────────────────────────────────── */}
      <SmartBanner userName={userName} />

      {/* ── 2. Action Cards Row ──────────────────────────────────────── */}
      <ActionCards priorityTasks={priorities} />

      {/* ── 3. Alert Section ─────────────────────────────────────────── */}
      <Alerts />

      {/* ── 4. My Crops Section ──────────────────────────────────────── */}
      <CropsList />

      {/* ── 5. CTA Buttons ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Scan Crop Disease */}
        <button
          onClick={() => navigate("/disease-prediction")}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-green-500 p-6 text-left shadow-lg hover:shadow-emerald-200 hover:shadow-xl transition-all duration-200"
        >
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
            <ScanLine className="h-28 w-28 text-white" />
          </div>
          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm">
              <ScanLine className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Scan Crop Disease</h3>
            <p className="text-emerald-100 text-sm">Use camera to detect any disease</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-white text-emerald-700 text-sm font-bold px-4 py-2 rounded-xl shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all">
              Scan Now
              <span className="text-base">›</span>
            </div>
          </div>
        </button>

        {/* Talk to GreenGrow AI */}
        <button
          onClick={() => navigate("/chat")}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 p-6 text-left shadow-lg hover:shadow-violet-200 hover:shadow-xl transition-all duration-200"
        >
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
            <Mic className="h-28 w-28 text-white" />
          </div>
          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm">
              <Mic className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Talk to GreenGrow</h3>
            <p className="text-violet-100 text-sm">Ask farming questions by voice or text</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-white text-violet-700 text-sm font-bold px-4 py-2 rounded-xl shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all">
              Ask Now
              <span className="text-base">›</span>
            </div>
          </div>
        </button>
      </div>

      {/* ── 6. Quick IoT Status Strip ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isDeviceConnected ? "bg-green-100" : "bg-slate-100"}`}>
            <Droplets className={`h-5 w-5 ${isDeviceConnected ? "text-green-600" : "text-slate-400"}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">IoT Sprinkler System</p>
            <p className={`text-xs font-semibold ${isDeviceConnected ? "text-green-600" : "text-slate-400"}`}>
              {isDeviceConnected ? "● Connected" : "○ Not Connected"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isDeviceConnected && (
            <button
              onClick={handleConnectDevice}
              className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors"
            >
              Connect Device
            </button>
          )}
          <button
            onClick={handleStartWatering}
            disabled={!isDeviceConnected}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isDeviceConnected
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Droplets className="h-4 w-4" />
            Start Watering
          </button>
          <button
            onClick={handleConnectDevice}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            title="IoT Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* IoT Alert Toast */}
      {showAlert && !isDeviceConnected && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-orange-100 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">No IoT Device Connected</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Connect your device to enable watering control.
              </p>
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="text-slate-400 hover:text-slate-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ── 7. Floating AI Button ─────────────────────────────────────── */}
      <FloatingAIButton />
    </div>
  );
};

export default Home;
