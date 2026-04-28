import React, { useEffect, useState } from "react";
import {
  AlertTriangle, AlertCircle, ChevronDown, ChevronUp,
  X, Leaf, ArrowRight, Stethoscope, Activity, Wrench, Eye,
} from "lucide-react";
import { apiUrl } from "@/lib/env";
import { useNavigate } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlantSummary {
  id: string;
  plantName?: string;
  cropType?: string;
  riskLevel?: string;
  latestAssessment?: {
    severity?: string;
    diseasePrediction?: string;
    recommendation?: string | null;
    conditionTrend?: string | null;
    careActions?: string[];
  } | null;
}

interface AlertItem {
  id: string;
  level: "critical" | "warning";
  title: string;
  plants: { name: string; issue?: string }[];
  issue: string;
  severity: string;
  actions: string[];
  nextStep: string;
  actionLabel?: string;
  actionPath?: string;
}

const FALLBACKS: AlertItem[] = [
  {
    id: "fb1",
    level: "critical",
    title: "Heavy rain forecast tomorrow",
    plants: [],
    issue: "Risk of waterlogging and fungal infection",
    severity: "High",
    actions: ["Cover sensitive crops with tarpaulin", "Delay fertilizer application by 2 days", "Ensure drainage channels are clear"],
    nextStep: "Check weather again tomorrow morning",
    actionLabel: "Check Weather",
    actionPath: "/weather",
  },
  {
    id: "fb2",
    level: "warning",
    title: "Pest activity detected nearby",
    plants: [],
    issue: "Aphid & whitefly infestation risk",
    severity: "Medium",
    actions: ["Inspect undersides of leaves", "Apply neem oil spray", "Install yellow sticky traps"],
    nextStep: "Monitor every 2 days",
    actionLabel: "Scan Crops",
    actionPath: "/disease-prediction",
  },
];

// ─── Main Component ────────────────────────────────────────────────────────────

const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const build = async () => {
      try {
        const res = await fetch(apiUrl("/api/plants"), { credentials: "include" });
        if (!res.ok) throw new Error();
        const data: PlantSummary[] = await res.json();
        const built: AlertItem[] = [];

        // ── Critical: high severity ──
        const high = data.filter(p => (p.latestAssessment?.severity || p.riskLevel || "").toLowerCase() === "high");
        if (high.length > 0) {
          const actions = high[0].latestAssessment?.careActions?.length
            ? high[0].latestAssessment.careActions
            : ["Remove infected leaves immediately", "Avoid water splash on leaves", "Apply copper-based fungicide"];

          built.push({
            id: "critical-high",
            level: "critical",
            title: `${high.length} crop${high.length > 1 ? "s" : ""} need immediate attention`,
            plants: high.slice(0, 4).map(p => ({
              name: p.plantName || p.cropType || "Plant",
              issue: p.latestAssessment?.diseasePrediction || "High risk detected",
            })),
            issue: high[0].latestAssessment?.diseasePrediction || "Disease infection detected",
            severity: "High",
            actions,
            nextStep: "Monitor daily and re-scan in 48 hours",
            actionLabel: "Scan Crops",
            actionPath: "/disease-prediction",
          });
        }

        // ── Warning: worsening trend ──
        const worsening = data.filter(p => (p.latestAssessment?.conditionTrend || "").toLowerCase() === "worsening");
        if (worsening.length > 0) {
          built.push({
            id: "warning-worsening",
            level: "warning",
            title: `${worsening.length} crop${worsening.length > 1 ? "s" : ""} showing worsening trend`,
            plants: worsening.slice(0, 3).map(p => ({ name: p.plantName || p.cropType || "Plant", issue: "Condition worsening" })),
            issue: "Condition deteriorating — treatment needed soon",
            severity: "Medium",
            actions: ["Re-scan crops with camera", "Apply recommended treatment", "Increase monitoring frequency"],
            nextStep: "Consult AI assistant for treatment plan",
            actionLabel: "Ask AI",
            actionPath: "/chat",
          });
        }

        // ── Warning: medium risk ──
        const medium = data.filter(p => (p.latestAssessment?.severity || p.riskLevel || "").toLowerCase() === "medium");
        if (medium.length > 0) {
          built.push({
            id: "warning-medium",
            level: "warning",
            title: `${medium.length} crop${medium.length > 1 ? "s" : ""} at moderate risk`,
            plants: medium.slice(0, 3).map(p => ({ name: p.plantName || p.cropType || "Plant", issue: "Moderate risk" })),
            issue: "Preventive treatment recommended",
            severity: "Medium",
            actions: ["Monitor closely every 2 days", "Apply preventive fungicide", "Ensure proper spacing for airflow"],
            nextStep: "Plan field inspection this week",
          });
        }

        setAlerts(built.length > 0 ? built : FALLBACKS);
      } catch {
        setAlerts(FALLBACKS);
      } finally {
        setLoading(false);
      }
    };
    build();
  }, []);

  const visible = alerts.filter(a => !dismissed.has(a.id));
  const critCount = visible.filter(a => a.level === "critical").length;
  const warnCount = visible.filter(a => a.level === "warning").length;

  const toggleExpanded = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (loading) return <div className="h-12 rounded-2xl bg-slate-100 animate-pulse" />;
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* ── Summary toggle strip ── */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-2.5">
          {critCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
              <AlertTriangle className="h-3 w-3" /> {critCount} Critical
            </span>
          )}
          {warnCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
              <AlertCircle className="h-3 w-3" /> {warnCount} Warning
            </span>
          )}
          <span className="text-sm font-semibold text-slate-700 line-clamp-1">{visible[0]?.title}</span>
        </div>
        {collapsed
          ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
          : <ChevronUp   className="h-4 w-4 text-slate-400 flex-shrink-0" />}
      </button>

      {/* ── Alert cards ── */}
      {!collapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visible.map(alert => (
            <StructuredAlertCard
              key={alert.id}
              alert={alert}
              isExpanded={expanded.has(alert.id)}
              onToggle={() => toggleExpanded(alert.id)}
              onDismiss={() => setDismissed(prev => new Set([...prev, alert.id]))}
              onAction={alert.actionPath ? () => navigate(alert.actionPath!) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;

// ─── Structured Alert Card ────────────────────────────────────────────────────

const StructuredAlertCard: React.FC<{
  alert: AlertItem;
  isExpanded: boolean;
  onToggle: () => void;
  onDismiss: () => void;
  onAction?: () => void;
}> = ({ alert, isExpanded, onToggle, onDismiss, onAction }) => {
  const c = alert.level === "critical";
  const theme = {
    border:    c ? "border-rose-200"    : "border-amber-200",
    bg:        c ? "from-rose-50 to-red-50/50" : "from-amber-50 to-yellow-50/50",
    accent:    c ? "bg-rose-500"        : "bg-amber-400",
    iconBg:    c ? "bg-rose-100"        : "bg-amber-100",
    iconColor: c ? "text-rose-600"      : "text-amber-600",
    titleColor:c ? "text-rose-900"      : "text-amber-900",
    textColor: c ? "text-rose-700"      : "text-amber-700",
    mutedColor:c ? "text-rose-500"      : "text-amber-500",
    tagBg:     c ? "bg-rose-100 border-rose-200 text-rose-800" : "bg-amber-100 border-amber-200 text-amber-800",
    btnBg:     c ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-500 hover:bg-amber-600",
    sectionBg: c ? "bg-rose-50/80"      : "bg-amber-50/80",
  };

  return (
    <div className={`rounded-2xl border overflow-hidden bg-gradient-to-br ${theme.bg} ${theme.border}`}>
      {/* Left accent bar */}
      <div className={`${theme.accent} h-1 w-full`} />

      <div className="p-4">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-2.5">
            <div className={`p-2 rounded-xl flex-shrink-0 ${theme.iconBg}`}>
              {c ? <AlertTriangle className={`h-4 w-4 ${theme.iconColor}`} /> : <AlertCircle className={`h-4 w-4 ${theme.iconColor}`} />}
            </div>
            <div>
              <p className={`text-sm font-bold leading-tight ${theme.titleColor}`}>{alert.title}</p>
              <div className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.tagBg}`}>
                <Activity className="h-2.5 w-2.5" /> Severity: {alert.severity}
              </div>
            </div>
          </div>
          <button onClick={onDismiss} className={`p-1 rounded-lg hover:bg-black/5 transition-colors ${theme.mutedColor}`}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── Affected crops (always visible) ── */}
        {alert.plants.length > 0 && (
          <div className="mb-3">
            <p className={`text-[10px] font-black uppercase tracking-wider ${theme.mutedColor} mb-1.5 flex items-center gap-1`}>
              <Leaf className="h-3 w-3" /> Crops Affected
            </p>
            <div className="flex flex-wrap gap-1.5">
              {alert.plants.map((pl, i) => (
                <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${theme.tagBg}`}>
                  <Leaf className="h-3 w-3" />
                  <span>{pl.name}</span>
                  {pl.issue && pl.issue !== "High risk detected" && (
                    <span className="opacity-60 font-normal">· {pl.issue}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Issue summary ── */}
        <div className={`rounded-xl px-3 py-2 mb-3 ${theme.sectionBg} border ${theme.border}`}>
          <p className={`text-[10px] font-black uppercase tracking-wider ${theme.mutedColor} mb-1 flex items-center gap-1`}>
            <Stethoscope className="h-3 w-3" /> Issue
          </p>
          <p className={`text-xs font-semibold ${theme.textColor}`}>{alert.issue}</p>
        </div>

        {/* ── Accordion: recommended actions ── */}
        <button
          onClick={onToggle}
          className={`w-full flex items-center justify-between text-left py-2 border-t ${theme.border}`}
        >
          <p className={`text-[10px] font-black uppercase tracking-wider ${theme.mutedColor} flex items-center gap-1`}>
            <Wrench className="h-3 w-3" /> Recommended Actions ({alert.actions.length})
          </p>
          {isExpanded ? <ChevronUp className={`h-3.5 w-3.5 ${theme.mutedColor}`} /> : <ChevronDown className={`h-3.5 w-3.5 ${theme.mutedColor}`} />}
        </button>

        {isExpanded && (
          <div className="mt-2 space-y-1.5 mb-3">
            {alert.actions.map((action, i) => (
              <div key={i} className={`flex items-start gap-2 rounded-xl px-3 py-2 ${theme.sectionBg}`}>
                <span className={`text-[10px] font-black w-4 flex-shrink-0 ${theme.iconColor}`}>{i + 1}.</span>
                <p className={`text-xs font-medium ${theme.textColor}`}>{action}</p>
              </div>
            ))}

            {/* Next step */}
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${theme.border} ${theme.sectionBg}`}>
              <Eye className={`h-3.5 w-3.5 flex-shrink-0 ${theme.iconColor}`} />
              <div>
                <p className={`text-[10px] font-black uppercase tracking-wider ${theme.mutedColor}`}>Next Step</p>
                <p className={`text-xs font-semibold ${theme.textColor}`}>{alert.nextStep}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        {onAction && alert.actionLabel && (
          <button
            onClick={onAction}
            className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl text-white transition-colors ${theme.btnBg}`}
          >
            {alert.actionLabel} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
