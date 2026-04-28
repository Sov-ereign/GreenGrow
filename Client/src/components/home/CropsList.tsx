import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Leaf,
  AlertTriangle,
  Bug,
  TrendingUp,
  MessageCircle,
  ScanLine,
  Zap,
  ChevronRight,
  Activity,
  Clock3,
  Filter,
} from "lucide-react";
import { apiUrl } from "@/lib/env";
import { useNavigate } from "react-router-dom";

// ─── Types ─────────────────────────────────────────────────────────────────

interface PlantSummary {
  id: string;
  plantName?: string;
  cropType?: string;
  riskLevel?: string;
  profileImage?: string | null;
  lastAssessmentAt?: string;
  latestSessionKey?: string | null;
  linkedChatId?: string | null;
  latestAssessment?: {
    severity?: string;
    diseasePrediction?: string;
    conditionTrend?: string | null;
    nextCheckDate?: string | null;
    careActions?: string[];
    recommendation?: string | null;
  } | null;
}

type RiskFilter = "all" | "high" | "medium" | "low";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getSeverity = (p: PlantSummary) =>
  (p.latestAssessment?.severity || p.riskLevel || "low").toLowerCase();

const healthScore = (p: PlantSummary) => {
  const sev = getSeverity(p);
  const trend = p.latestAssessment?.conditionTrend?.toLowerCase() || "";
  let base = sev === "high" ? 42 : sev === "medium" ? 68 : 92;
  if (trend === "improving") base += 6;
  if (trend === "worsening") base -= 8;
  return Math.max(15, Math.min(100, base));
};

const formatDate = (iso?: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff}d ago`;
};

const severityConfig = {
  high: {
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    border: "border-rose-200",
    glow: "shadow-rose-100",
    icon: AlertTriangle,
    iconColor: "text-rose-500",
    healthBar: "bg-rose-500",
  },
  medium: {
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    border: "border-amber-200",
    glow: "shadow-amber-50",
    icon: Bug,
    iconColor: "text-amber-500",
    healthBar: "bg-amber-400",
  },
  low: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    border: "border-slate-100",
    glow: "",
    icon: TrendingUp,
    iconColor: "text-emerald-500",
    healthBar: "bg-emerald-500",
  },
};

// ─── CropsList Component ──────────────────────────────────────────────────────

const CropsList: React.FC = () => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<PlantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch(apiUrl("/api/plants"), { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then(setPlants)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...plants].sort((a, b) => {
      const sevOrder = { high: 3, medium: 2, low: 1 };
      const aS = sevOrder[getSeverity(a) as keyof typeof sevOrder] || 0;
      const bS = sevOrder[getSeverity(b) as keyof typeof sevOrder] || 0;
      return bS - aS;
    });
    if (riskFilter !== "all") {
      list = list.filter((p) => getSeverity(p) === riskFilter);
    }
    return list;
  }, [plants, riskFilter]);

  const displayed = showAll ? filtered : filtered.slice(0, 4);

  const handleChat = async (plant: PlantSummary) => {
    const key = plant.latestSessionKey || plant.linkedChatId;
    if (key) {
      navigate(`/chat/${key}?plantId=${plant.id}`);
      return;
    }
    try {
      const res = await fetch(
        apiUrl(`/api/chat/sessions/by-plant/${plant.id}`),
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.sessionKey || data.id) {
          navigate(`/chat/${data.sessionKey || data.id}?plantId=${plant.id}`);
          return;
        }
      }
    } catch {}
    navigate(`/chat?plantId=${plant.id}`);
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 rounded-xl">
            <Leaf className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Crops</h2>
            <p className="text-xs text-slate-500">
              {plants.length} crop{plants.length !== 1 ? "s" : ""} monitored
            </p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-slate-400" />
          {(["all", "high", "medium", "low"] as RiskFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setRiskFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                riskFilter === f
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-56 rounded-2xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-sm">
          Unable to load crops: {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && plants.length === 0 && (
        <div className="py-16 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
          <Leaf className="h-12 w-12 text-emerald-200 mb-3" />
          <p className="text-slate-600 font-semibold">No crops added yet</p>
          <p className="text-slate-400 text-sm mt-1">
            Start by adding your first crop to get AI-powered insights
          </p>
          <button
            onClick={() => navigate("/FarmForm")}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Add First Crop
          </button>
        </div>
      )}

      {/* Crop cards grid */}
      {!loading && !error && displayed.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {displayed.map((plant) => (
              <CropCard
                key={plant.id}
                plant={plant}
                onScan={() => navigate("/disease-prediction")}
                onChat={() => handleChat(plant)}
                onAction={() => navigate(`/chat?plantId=${plant.id}`)}
              />
            ))}
          </div>

          {filtered.length > 4 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="w-full py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-emerald-300 transition-all flex items-center justify-center gap-2"
            >
              {showAll ? "Show less" : `View all ${filtered.length} crops`}
              <ChevronRight
                className={`h-4 w-4 transition-transform ${showAll ? "rotate-90" : ""}`}
              />
            </button>
          )}
        </>
      )}
    </section>
  );
};

export default CropsList;

// ─── CropCard ─────────────────────────────────────────────────────────────────

const CropCard: React.FC<{
  plant: PlantSummary;
  onScan: () => void;
  onChat: () => void;
  onAction: () => void;
}> = ({ plant, onScan, onChat, onAction }) => {
  const sev = getSeverity(plant) as "high" | "medium" | "low";
  const cfg = severityConfig[sev] || severityConfig.low;
  const Icon = cfg.icon;
  const score = healthScore(plant);
  const title =
    plant.plantName || (plant.cropType ? plant.cropType : "Plant");
  const problem =
    plant.latestAssessment?.diseasePrediction ||
    plant.latestAssessment?.careActions?.[0] ||
    null;
  const lastChecked = formatDate(plant.lastAssessmentAt);
  const nextCheck = formatDate(plant.latestAssessment?.nextCheckDate);
  const trend = plant.latestAssessment?.conditionTrend?.toLowerCase();

  return (
    <div
      className={`group relative bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col ${cfg.border} ${cfg.glow}`}
    >
      {/* Image / header */}
      <div className="relative h-36 bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
        {plant.profileImage ? (
          <img
            src={plant.profileImage}
            alt={title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Icon className={`h-16 w-16 ${cfg.iconColor} opacity-20`} />
          </div>
        )}

        {/* Severity badge overlay */}
        <span
          className={`absolute top-2 right-2 text-[11px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm ${cfg.badge}`}
        >
          {sev.toUpperCase()}
        </span>

        {/* Health score overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-white/30 overflow-hidden">
              <div
                className={`h-full rounded-full ${cfg.healthBar}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-white text-xs font-bold">{score}%</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <div>
          <h3 className="font-bold text-slate-900 leading-tight">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {plant.cropType || "Crop"}
            {lastChecked ? ` · Last checked ${lastChecked}` : ""}
          </p>
        </div>

        {/* Trend badge */}
        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit ${
              trend === "improving"
                ? "bg-emerald-50 text-emerald-700"
                : trend === "worsening"
                ? "bg-rose-50 text-rose-700"
                : "bg-sky-50 text-sky-700"
            }`}
          >
            <Activity className="h-3 w-3" />
            {trend.charAt(0).toUpperCase() + trend.slice(1)}
          </span>
        )}

        {/* Problem */}
        {problem && (
          <div className="flex items-start gap-1.5">
            {sev === "high" ? (
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
            ) : (
              <Bug className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            )}
            <p className="text-xs text-slate-600 line-clamp-2">{problem}</p>
          </div>
        )}

        {nextCheck && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-auto">
            <Clock3 className="h-3 w-3" />
            Next check {nextCheck}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-1 mt-auto">
          <button
            onClick={onScan}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            <ScanLine className="h-3.5 w-3.5" />
            Scan
          </button>
          <button
            onClick={onChat}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Chat
          </button>
          <button
            onClick={onAction}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors"
          >
            <Zap className="h-3.5 w-3.5" />
            Action
          </button>
        </div>
      </div>
    </div>
  );
};
