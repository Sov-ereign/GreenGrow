import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bug,
  TrendingUp,
  MessageCircle,
  Image as ImageIcon,
  CheckCircle2,
  Leaf,
  Clock3,
  ArrowUpRight,
  Activity,
  Sparkles,
} from "lucide-react";
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
  profileImage?: string | null;
  linkedChatId?: string | null;
  latestSessionKey?: string | null;
  latestImage?:
  | {
    id: string;
    storagePath: string;
  }
  | null;
  latestAssessment?: {
    severity?: string;
    diseasePrediction?: string;
    createdAt?: string;
    recommendation?: string | null;
    nextCheckDate?: string | null;
    monitoringReason?: string | null;
    conditionTrend?: string | null;
    careActions?: string[];
  } | null;
}

type Tone = "emerald" | "rose" | "amber" | "sky" | "slate";

const toneMap: Record<Tone, { bg: string; text: string; ring: string }> = {
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-100",
  },
  rose: { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-100" },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-100",
  },
  sky: { bg: "bg-sky-50", text: "text-sky-700", ring: "ring-sky-100" },
  slate: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    ring: "ring-slate-100",
  },
};

const RecommendationsPanel: React.FC = () => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<PlantSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<"priority" | "nextCheck">(
    "priority"
  );
  const [confirmPlantId, setConfirmPlantId] = useState<string | null>(null);
  const [confirmPlantTitle, setConfirmPlantTitle] = useState<string>("");
  const [confirmBusy, setConfirmBusy] = useState(false);

  // New UI + filters
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const carouselRef = useRef<HTMLDivElement | null>(null);

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

  const severityWeight = (severity?: string) => {
    switch ((severity || "").toLowerCase()) {
      case "high":
        return 3;
      case "medium":
        return 2;
      case "low":
        return 1;
      default:
        return 0;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-rose-200/70 bg-rose-50/70";
      case "medium":
        return "border-amber-200/70 bg-amber-50/70";
      case "low":
        return "border-emerald-200/70 bg-emerald-50/60";
      default:
        return "border-slate-200 bg-white";
    }
  };

  const getIconColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-rose-500";
      case "medium":
        return "text-amber-500";
      case "low":
        return "text-emerald-500";
      default:
        return "text-slate-500";
    }
  };

  const getSeverityFromPlant = (plant: PlantSummary): string => {
    return plant.latestAssessment?.severity || plant.riskLevel || "low";
  };

  const healthScore = (plant: PlantSummary) => {
    const severity = getSeverityFromPlant(plant).toLowerCase();
    const trend = plant.latestAssessment?.conditionTrend;
    let base =
      severity === "high"
        ? 42
        : severity === "medium"
          ? 68
          : severity === "low"
            ? 92
            : 60;
    if (trend === "improving") base += 6;
    if (trend === "worsening") base -= 8;
    return Math.max(15, Math.min(100, base));
  };

  const formatTime = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (iso?: string) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const severityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return AlertTriangle;
      case "medium":
        return Bug;
      case "low":
      default:
        return TrendingUp;
    }
  };

  const handleOpenChat = async (plantId: string, sessionKey?: string | null) => {
    const goTo = (key?: string | null) => {
      if (!key) return false;
      navigate(`/chat/${key}?plantId=${plantId}`);
      return true;
    };

    // Use provided session key if present
    if (goTo(sessionKey)) return;

    // Otherwise resolve (or create) a session for this plant
    try {
      const res = await fetch(apiUrl(`/api/chat/sessions/by-plant/${plantId}`), {
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (goTo(data.sessionKey || data.id)) return;
    } catch (err) {
      console.error("Failed to resolve chat session for plant:", err);
    }

    // Fallback: open generic chat with plant context
    navigate(`/chat?plantId=${plantId}`);
  };

  const handleMarkTreated = async (plantId: string) => {
    const plant = plants.find((p) => p.id === plantId);
    setConfirmPlantId(plantId);
    setConfirmPlantTitle(plant?.plantName || plant?.cropType || "Plant");
  };

  const truncate = (value: string, limit = 150) =>
    value.length > limit ? `${value.slice(0, limit)}…` : value;

  const sortedPlants = useMemo(() => {
    const list = [...plants];
    const byPriority = (a: PlantSummary, b: PlantSummary) => {
      const sevDiff =
        severityWeight(b.latestAssessment?.severity) -
        severityWeight(a.latestAssessment?.severity);
      if (sevDiff !== 0) return sevDiff;
      const aNext = a.latestAssessment?.nextCheckDate
        ? new Date(a.latestAssessment.nextCheckDate).getTime()
        : Infinity;
      const bNext = b.latestAssessment?.nextCheckDate
        ? new Date(b.latestAssessment.nextCheckDate).getTime()
        : Infinity;
      if (aNext !== bNext) return aNext - bNext;
      const aUpdated = a.lastAssessmentAt
        ? new Date(a.lastAssessmentAt).getTime()
        : 0;
      const bUpdated = b.lastAssessmentAt
        ? new Date(b.lastAssessmentAt).getTime()
        : 0;
      return bUpdated - aUpdated;
    };

    if (sortMode === "nextCheck") {
      return list.sort((a, b) => {
        const aDate = a.latestAssessment?.nextCheckDate
          ? new Date(a.latestAssessment.nextCheckDate).getTime()
          : Infinity;
        const bDate = b.latestAssessment?.nextCheckDate
          ? new Date(b.latestAssessment.nextCheckDate).getTime()
          : Infinity;
        return aDate - bDate;
      });
    }
    return list.sort(byPriority);
  }, [plants, sortMode]);

  const filteredPlants = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return sortedPlants.filter((p) => {
      const risk = getSeverityFromPlant(p).toLowerCase();
      if (riskFilter !== "all" && risk !== riskFilter) return false;
      if (!term) return true;
      const hay = `${p.plantName || ""} ${p.cropType || ""}`.toLowerCase();
      return hay.includes(term);
    });
  }, [sortedPlants, searchTerm, riskFilter]);

  const featuredPlants = filteredPlants.slice(0, 3);
  const carouselPlants = filteredPlants.slice(3);

  const summary = useMemo(() => {
    const total = plants.length;
    const high = plants.filter(
      (p) => getSeverityFromPlant(p).toLowerCase() === "high"
    ).length;
    const medium = plants.filter(
      (p) => getSeverityFromPlant(p).toLowerCase() === "medium"
    ).length;
    const upcoming = plants.filter((p) =>
      p.latestAssessment?.nextCheckDate
    ).length;
    return { total, high, medium, upcoming };
  }, [plants]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.12em] text-emerald-600 font-semibold">
            Continuous Plant Health
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">
            Personalized Monitoring & Recommendations
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSortMode("priority")}
            className={`px-3 py-1.5 text-xs rounded-full border ${sortMode === "priority"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-slate-700 border-slate-200 hover:border-emerald-200"
              }`}
          >
            Severity first
          </button>
          <button
            onClick={() => setSortMode("nextCheck")}
            className={`px-3 py-1.5 text-xs rounded-full border ${sortMode === "nextCheck"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-white text-slate-700 border-slate-200 hover:border-emerald-200"
              }`}
          >
            Next check first
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryChip icon={Leaf} label="Plants monitored" value={summary.total.toString()} tone="emerald" />
        <SummaryChip icon={AlertTriangle} label="High risk" value={summary.high.toString()} tone="rose" />
        <SummaryChip icon={Bug} label="Medium risk" value={summary.medium.toString()} tone="amber" />
        <SummaryChip icon={Clock3} label="Upcoming checks" value={summary.upcoming.toString()} tone="sky" />
      </div>

      {loading && <CardSkeleton />}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {!loading && plants.length === 0 && !error && <EmptyState onAction={() => navigate("/chat")} />}

      {/* Featured top plants + controls */}
      {!loading && filteredPlants.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <p className="text-sm font-semibold text-slate-700">Highlighted plants (top 3 by risk and urgency)</p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              placeholder="Search plants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 w-full sm:w-auto"
            />
            <div className="flex flex-wrap gap-1">
              {["all", "high", "medium", "low"].map((risk) => (
                <button
                  key={risk}
                  onClick={() => setRiskFilter(risk as any)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 text-xs rounded-full border transition ${riskFilter === risk
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-700 border-slate-200 hover:border-emerald-200"
                    }`}
                >
                  {risk === "all" ? "All" : risk[0].toUpperCase() + risk.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition whitespace-nowrap"
            >
              View all
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {featuredPlants.map((plant) => {
          const severity = getSeverityFromPlant(plant);
          const Icon = severityIcon(severity);
          const priority = severity || "low";
          const title = plant.plantName || (plant.cropType ? `${plant.cropType} Plant` : "Plant");
          const nextCheck = formatShortDate(plant.latestAssessment?.nextCheckDate);
          const trend = plant.latestAssessment?.conditionTrend || "monitoring";
          const trendLabel =
            trend === "worsening" ? "Worsening" : trend === "improving" ? "Improving" : trend === "stable" ? "Stable" : "Monitoring";
          const score = plant.latestAssessment ? healthScore(plant) : 0;

          return (
            <div key={plant.id} className="group border border-gray-100 rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="flex gap-3 mb-3 items-center">
                <div className="h-14 w-14 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
                  {plant.profileImage ? (
                    <img src={plant.profileImage} alt={title} className="h-full w-full object-cover" />
                  ) : (
                    <div className={`h-full w-full flex items-center justify-center ${getIconColor(priority)} bg-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h3 className="font-semibold text-slate-900 leading-tight truncate">{title}</h3>
                      <p className="text-xs text-slate-500 truncate">{plant.cropType || "Crop"} {nextCheck ? `• Next check ${nextCheck}` : ""}</p>
                    </div>
                    <SeverityBadge severity={priority} />
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                    <TrendBadge trend={trendLabel} />
                    {nextCheck && <NextCheckBadge date={nextCheck} />}
                  </div>
                </div>
              </div>

              {score > 0 && (
                <div className="flex items-center gap-3 mb-3">
                  <HealthMeter score={score} />
                </div>
              )}

              <div className="space-y-1.5 text-sm text-slate-700">
                {(plant.latestAssessment?.careActions || []).slice(0, 2).map((action, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span className="leading-relaxed">{action}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <ActionButton
                  label="Open chat"
                  icon={MessageCircle}
                  onClick={() => handleOpenChat(plant.id, plant.latestSessionKey || plant.linkedChatId)}
                />
                <ActionButton
                  label="Upload image"
                  icon={ImageIcon}
                  onClick={() => handleOpenChat(plant.id, plant.latestSessionKey || plant.linkedChatId, true)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {carouselPlants.length > 0 && (
        <div className="mt-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-800">More plants</p>
            <div className="flex gap-2">
              <button
                onClick={() => carouselRef.current?.scrollBy({ left: -320, behavior: "smooth" })}
                className="w-9 h-9 rounded-full border border-gray-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 bg-white shadow-sm"
                aria-label="Scroll left"
              >
                ‹
              </button>
              <button
                onClick={() => carouselRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
                className="w-9 h-9 rounded-full border border-gray-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 bg-white shadow-sm"
                aria-label="Scroll right"
              >
                ›
              </button>
            </div>
          </div>
          <div ref={carouselRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
            {carouselPlants.map((plant) => {
              const severity = getSeverityFromPlant(plant);
              const Icon = severityIcon(severity);
              const priority = severity || "low";
              const title = plant.plantName || (plant.cropType ? `${plant.cropType} Plant` : "Plant");
              const nextCheck = formatShortDate(plant.latestAssessment?.nextCheckDate);
              const trend = plant.latestAssessment?.conditionTrend || "monitoring";
              const trendLabel =
                trend === "worsening" ? "Worsening" : trend === "improving" ? "Improving" : trend === "stable" ? "Stable" : "Monitoring";

              return (
                <div key={plant.id} className="min-w-[240px] border border-gray-100 rounded-2xl bg-white p-3 shadow-sm hover:shadow-md transition-all flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
                      {plant.profileImage ? (
                        <img src={plant.profileImage} alt={title} className="h-full w-full object-cover" />
                      ) : (
                        <div className={`h-full w-full flex items-center justify-center ${getIconColor(priority)} bg-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{title}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {plant.cropType || "Crop"} {nextCheck ? `• Next ${nextCheck}` : ""}
                      </p>
                    </div>
                    <SeverityBadge severity={priority} />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <TrendBadge trend={trendLabel} />
                    {nextCheck && <NextCheckBadge date={nextCheck} />}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <ActionButton
                      label="Chat"
                      icon={MessageCircle}
                      onClick={() => handleOpenChat(plant.id, plant.latestSessionKey || plant.linkedChatId)}
                    />
                    <ActionButton
                      label="Image"
                      icon={ImageIcon}
                      onClick={() => handleOpenChat(plant.id, plant.latestSessionKey || plant.linkedChatId, true)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAll && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-6xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-white via-emerald-50/60 to-white">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold truncate">All Plants</p>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate">Monitored plants</h3>
              </div>
              <button
                onClick={() => setShowAll(false)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 bg-white shadow-sm flex items-center justify-center flex-shrink-0"
              >
                ×
              </button>
            </div>

            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col gap-4">
              <div className="w-full">
                <input
                  type="text"
                  placeholder="Search by name or crop..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "high", "medium", "low"].map((risk) => (
                  <button
                    key={risk}
                    onClick={() => setRiskFilter(risk as any)}
                    className={`flex-1 sm:flex-none px-3 py-1.5 text-[11px] sm:text-xs rounded-full border transition ${riskFilter === risk
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-700 border-slate-200 hover:border-emerald-200"
                      }`}
                  >
                    {risk === "all" ? "All risks" : risk[0].toUpperCase() + risk.slice(1) + " risk"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 bg-slate-50/60">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPlants.length === 0 && (
                  <div className="col-span-full text-center text-slate-500 text-sm py-8">No plants found. Adjust filters or search.</div>
                )}
                {filteredPlants.map((plant) => {
                  const severity = getSeverityFromPlant(plant);
                  const Icon = severityIcon(severity);
                  const priority = severity || "low";
                  const title = plant.plantName || (plant.cropType ? `${plant.cropType} Plant` : "Plant");
                  const description =
                    plant.latestAssessment?.recommendation ||
                    plant.latestAssessment?.diseasePrediction ||
                    "No recommendations yet. Upload an image to start monitoring.";
                  const nextCheck = formatShortDate(plant.latestAssessment?.nextCheckDate);
                  const trend = plant.latestAssessment?.conditionTrend || "monitoring";
                  const trendLabel =
                    trend === "worsening" ? "Worsening" : trend === "improving" ? "Improving" : trend === "stable" ? "Stable" : "Monitoring";
                  const score = plant.latestAssessment ? healthScore(plant) : 0;

                  return (
                    <div key={plant.id} className="group border border-gray-100 rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
                      <div className="flex gap-3 items-start">
                        <div className="h-14 w-14 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
                          {plant.profileImage ? (
                            <img src={plant.profileImage} alt={title} className="h-full w-full object-cover" />
                          ) : (
                            <div className={`h-full w-full flex items-center justify-center ${getIconColor(priority)} bg-white`}>
                              <Icon className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <h3 className="font-semibold text-slate-900 leading-tight truncate">{title}</h3>
                              <p className="text-xs text-slate-500 truncate">
                                {plant.cropType || "Crop"} {nextCheck ? `• Next ${nextCheck}` : ""}
                              </p>
                            </div>
                            <SeverityBadge severity={priority} />
                          </div>
                          <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                            <TrendBadge trend={trendLabel} />
                            {nextCheck && <NextCheckBadge date={nextCheck} />}
                          </div>
                        </div>
                      </div>

                      {score > 0 && (
                        <div className="flex items-center gap-3">
                          <HealthMeter score={score} />
                        </div>
                      )}

                      <p className="text-sm text-slate-700 line-clamp-2">{truncate(description, 160)}</p>

                      <div className="flex flex-wrap gap-2 mt-auto">
                        <ActionButton
                          label="Chat"
                          icon={MessageCircle}
                          onClick={() => handleOpenChat(plant.id, plant.latestSessionKey || plant.linkedChatId)}
                        />
                        <ActionButton
                          label="Image"
                          icon={ImageIcon}
                          onClick={() => handleOpenChat(plant.id, plant.latestSessionKey || plant.linkedChatId, true)}
                        />
                        <ActionButton
                          label="Treated"
                          icon={CheckCircle2}
                          onClick={() => handleMarkTreated(plant.id)}
                          tone="emerald"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmPlantId && (
        <ConfirmModal
          title={confirmPlantTitle}
          busy={confirmBusy}
          onClose={() => {
            if (confirmBusy) return;
            setConfirmPlantId(null);
          }}
          onKeep={async () => {
            if (!confirmPlantId) return;
            setConfirmBusy(true);
            try {
              const res = await fetch(apiUrl(`/api/plants/${confirmPlantId}`), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  currentStatus: "healthy",
                  riskLevel: "low",
                }),
              });
              if (!res.ok) throw new Error("Failed to update plant");
              setPlants((prev) =>
                prev.map((p) =>
                  p.id === confirmPlantId
                    ? {
                      ...p,
                      currentStatus: "healthy",
                      riskLevel: "low",
                      latestAssessment: p.latestAssessment
                        ? {
                          ...p.latestAssessment,
                          severity: "low",
                          conditionTrend: "improving",
                        }
                        : p.latestAssessment,
                    }
                    : p
                )
              );
            } catch (err) {
              console.error("Failed to mark plant as healthy:", err);
            } finally {
              setConfirmBusy(false);
              setConfirmPlantId(null);
            }
          }}
          onDelete={async () => {
            if (!confirmPlantId) return;
            setConfirmBusy(true);
            try {
              const res = await fetch(apiUrl(`/api/plants/${confirmPlantId}`), {
                method: "DELETE",
                credentials: "include",
              });
              if (!res.ok) throw new Error("Failed to delete plant");
              setPlants((prev) => prev.filter((p) => p.id !== confirmPlantId));
            } catch (err) {
              console.error("Failed to delete plant:", err);
            } finally {
              setConfirmBusy(false);
              setConfirmPlantId(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default RecommendationsPanel;

const SummaryChip = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: any;
  label: string;
  value: string;
  tone: Tone;
}) => {
  const t = toneMap[tone] || toneMap.slate;
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm ring-1 ${t.ring}`}
    >
      <div className="flex items-center gap-2">
        <span className={`h-9 w-9 rounded-lg ${t.bg} flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${t.text}`} />
        </span>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="text-lg font-semibold text-slate-900 leading-tight">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

const SeverityBadge = ({ severity }: { severity: string }) => {
  const tone: Tone =
    severity === "high" ? "rose" : severity === "medium" ? "amber" : "emerald";
  const t = toneMap[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold ${t.bg} ${t.text} border border-white shadow-sm`}
    >
      {severity.toUpperCase()}
    </span>
  );
};

const TrendBadge = ({ trend }: { trend: string }) => {
  const tone: Tone =
    trend === "Worsening" ? "rose" : trend === "Improving" ? "emerald" : "sky";
  const t = toneMap[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold ${t.bg} ${t.text}`}
    >
      <Activity className="h-3 w-3" />
      {trend}
    </span>
  );
};

const NextCheckBadge = ({ date }: { date: string }) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
    <Clock3 className="h-3 w-3" />
    Next check: {date}
  </span>
);

const HealthMeter = ({ score }: { score: number }) => (
  <div className="flex items-center gap-3 w-full">
    <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
      <div
        className={`h-full rounded-full ${score >= 80
          ? "bg-emerald-500"
          : score >= 60
            ? "bg-amber-400"
            : "bg-rose-400"
          }`}
        style={{ width: `${score}%` }}
      />
    </div>
    <span className="text-xs font-semibold text-slate-800">{score}%</span>
  </div>
);

const ActionButton = ({
  label,
  icon: Icon,
  onClick,
  tone = "slate",
}: {
  label: string;
  icon: any;
  onClick: () => void;
  tone?: Tone;
}) => {
  const t = toneMap[tone] || toneMap.slate;
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-emerald-200 hover:text-emerald-700 transition-colors"
    >
      <Icon className={`h-4 w-4 ${t.text}`} />
      {label}
    </button>
  );
};

const CardSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {[1, 2, 3].map((k) => (
      <div
        key={k}
        className="border border-slate-200 rounded-2xl p-4 bg-white animate-pulse space-y-3"
      >
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-3 bg-slate-200 rounded w-2/3" />
        <div className="h-2.5 bg-slate-200 rounded w-full" />
        <div className="h-2.5 bg-slate-200 rounded w-5/6" />
        <div className="flex gap-2">
          <div className="h-7 bg-slate-200 rounded w-20" />
          <div className="h-7 bg-slate-200 rounded w-20" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ onAction }: { onAction: () => void }) => (
  <div className="border border-dashed border-emerald-200 rounded-2xl p-6 bg-emerald-50/60 text-center">
    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white shadow-sm mb-3">
      <Sparkles className="h-5 w-5 text-emerald-600" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900">
      No active plant monitoring yet
    </h3>
    <p className="text-sm text-slate-600 mt-1 mb-3">
      Upload a plant image or start a chat to begin continuous monitoring.
    </p>
    <button
      onClick={onAction}
      className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
    >
      Go to chat
    </button>
  </div>
);

const ConfirmModal = ({
  title,
  busy,
  onClose,
  onKeep,
  onDelete,
}: {
  title: string;
  busy: boolean;
  onClose: () => void;
  onKeep: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Mark as treated</h3>
          <p className="text-sm text-slate-600">
            {title} has been treated. Do you want to delete this profile or keep it for future monitoring?
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-amber-100 bg-amber-50 text-amber-800 text-xs p-3">
        Deleting will remove plant history, images, assessments, and linked chats. This cannot be undone.
      </div>

      <div className="flex flex-wrap gap-2 justify-end">
        <button
          disabled={busy}
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          disabled={busy}
          onClick={onKeep}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-semibold disabled:opacity-50"
        >
          Keep profile
        </button>
        <button
          disabled={busy}
          onClick={onDelete}
          className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-sm font-semibold disabled:opacity-50"
        >
          Delete profile
        </button>
      </div>
    </div>
  </div>
);
