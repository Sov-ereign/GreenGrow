import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Leaf, CloudRain, Sun, Cloud, CheckCircle2, TrendingUp, TrendingDown,
  ListChecks, Droplets, Wind, Plus, Trash2, Bug,
} from "lucide-react";
import { apiUrl } from "@/lib/env";
import { useWeather } from "@/lib/useWeather";
import { useMandiPrices } from "@/lib/useMandiPrices";
import { loadTasks, saveTasks, addTask, deleteTask, toggleTask, Task } from "@/lib/taskStore";

// ─── Card wrapper (solid gradient, no glassmorphism) ──────────────────────────

const CARD_GRADIENTS = {
  emerald: "from-emerald-500 to-green-600",
  sky:     "from-sky-500 to-blue-600",
  violet:  "from-violet-500 to-indigo-600",
  amber:   "from-amber-500 to-orange-500",
};

const GlassCard: React.FC<{
  gradient: keyof typeof CARD_GRADIENTS;
  icon: React.ReactNode;
  title: string;
  badge?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}> = ({ gradient, icon, title, badge, actionLabel, onAction, children }) => (
  <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${CARD_GRADIENTS[gradient]} p-5 flex flex-col gap-4 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200`}>
    {/* subtle gloss orb */}
    <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

    {/* header */}
    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-white/20 rounded-xl">{icon}</div>
        <span className="text-sm font-bold text-white drop-shadow-sm">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/25">
            {badge}
          </span>
        )}
        {actionLabel && onAction && (
          <button onClick={onAction} className="text-[11px] font-bold text-white/80 hover:text-white transition-colors">
            {actionLabel}
          </button>
        )}
      </div>
    </div>

    {/* content */}
    <div className="relative z-10 flex-1">{children}</div>
  </div>
);

// ─── Health bar ───────────────────────────────────────────────────────────────

const HealthBar = ({ label, pct, fill }: { label: string; pct: number; fill: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[11px] font-semibold text-white/85">
      <span>{label}</span><span>{pct}%</span>
    </div>
    <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${fill}`} style={{ width: `${pct}%` }} />
    </div>
  </div>
);

// ─── 1. Crop Health Card ──────────────────────────────────────────────────────

const CropHealthCard: React.FC = () => {
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl("/api/plants"), { credentials: "include" })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setPlants)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    if (plants.length === 0) return { healthy: 0, atRisk: 0, critical: 0, total: 0 };
    const total = plants.length;
    const critical = plants.filter(p => (p.latestAssessment?.severity || p.riskLevel || "").toLowerCase() === "high").length;
    const atRisk   = plants.filter(p => (p.latestAssessment?.severity || p.riskLevel || "").toLowerCase() === "medium").length;
    const healthy  = Math.max(0, total - critical - atRisk);
    return {
      healthy:  Math.round((healthy  / total) * 100),
      atRisk:   Math.round((atRisk   / total) * 100),
      critical: Math.round((critical / total) * 100),
      total,
    };
  }, [plants]);

  return (
    <GlassCard gradient="emerald" icon={<Leaf className="h-4 w-4 text-white" />} title="Crop Health" badge={loading ? "…" : `${stats.total} crops`}>
      {loading ? (
        <div className="space-y-2.5">
          {[1,2,3].map(i => <div key={i} className="h-4 rounded-full bg-white/20 animate-pulse" />)}
        </div>
      ) : stats.total === 0 ? (
        <p className="text-xs text-white/50 text-center py-3">No crops tracked yet</p>
      ) : (
        <div className="space-y-2.5">
          <HealthBar label="Healthy"  pct={stats.healthy}  fill="bg-emerald-300" />
          <HealthBar label="At Risk"  pct={stats.atRisk}   fill="bg-yellow-300" />
          <HealthBar label="Critical" pct={stats.critical} fill="bg-red-300" />
        </div>
      )}
    </GlassCard>
  );
};

// ─── 2. Weather Impact Card ───────────────────────────────────────────────────

const WeatherImpactCard: React.FC = () => {
  const { weather, advice, loading } = useWeather();
  const desc = weather?.description.toLowerCase() ?? "";
  const WIcon = desc.includes("rain") ? CloudRain : desc.includes("cloud") ? Cloud : Sun;

  return (
    <GlassCard gradient="sky" icon={<WIcon className="h-4 w-4 text-white" />} title="Weather Impact" badge={weather ? `${weather.temp}°C` : undefined}>
      {loading ? (
        <div className="space-y-1.5">
          {[1,2].map(i => <div key={i} className="h-8 rounded-xl bg-white/20 animate-pulse" />)}
        </div>
      ) : weather ? (
        <div className="space-y-1.5">
          <p className="text-[11px] text-white/60 capitalize mb-1.5">{weather.description}</p>
          {advice?.suggestions.slice(0, 3).map((s, i) => (
            <div key={i} className="flex items-start gap-2 bg-white/10 rounded-xl px-2.5 py-1.5">
              {i === 0 ? <Droplets className="h-3.5 w-3.5 text-sky-200 flex-shrink-0 mt-0.5" /> :
               i === 1 ? <Wind className="h-3.5 w-3.5 text-sky-200 flex-shrink-0 mt-0.5" /> :
                         <Sun className="h-3.5 w-3.5 text-sky-200 flex-shrink-0 mt-0.5" />}
              <span className="text-[11px] font-medium text-white/85">{s}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-2.5 py-1.5">
            <Bug className="h-3.5 w-3.5 text-white/60" />
            <span className="text-[11px] text-white/70">Set VITE_WEATHER_API_KEY in .env</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-2.5 py-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-white/60" />
            <span className="text-[11px] text-white/70">Inspect crops daily</span>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

// ─── 3. Market Prices Card (data.gov.in via shared hook) ────────────────────────
const MarketPricesCard: React.FC = () => {
  const { crops, topGainer, loading } = useMandiPrices();

  return (
    <GlassCard
      gradient="violet"
      icon={<TrendingUp className="h-4 w-4 text-white" />}
      title="Market Prices"
      badge="Live"
      actionLabel="View all →"
      onAction={() => window.location.href = "/market"}
    >
      {loading ? (
        <div className="space-y-1.5">
          {[1,2,3].map(i => <div key={i} className="h-7 rounded-xl bg-white/20 animate-pulse" />)}
        </div>
      ) : crops.length === 0 ? (
        <p className="text-[11px] text-white/50 text-center py-3">No market data available</p>
      ) : (
        <div className="space-y-1.5">
          {/* Top gainer highlight */}
          {topGainer && (
            <div className="flex items-center gap-2 bg-yellow-400/20 rounded-xl px-2.5 py-1.5 mb-2">
              <TrendingUp className="h-3 w-3 text-yellow-300 flex-shrink-0" />
              <span className="text-[10px] font-black text-yellow-200">
                {topGainer.name} +{topGainer.change.toFixed(1)}% · {topGainer.suggestion}
              </span>
            </div>
          )}
          {/* Price rows */}
          {crops.slice(0, 4).map(c => (
            <div key={c.name} className="flex items-center justify-between bg-white/10 rounded-xl px-2.5 py-1.5">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-white/90 truncate max-w-[80px]">{c.name}</p>
                <p className="text-[10px] text-white/40 truncate max-w-[80px]">{c.market}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[11px] font-black text-white">₹{c.modalPrice.toFixed(0)}</span>
                <span className={`text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
                  c.change >= 0 ? "bg-emerald-400/20 text-emerald-200" : "bg-red-400/20 text-red-200"
                }`}>
                  {c.change >= 0
                    ? <TrendingUp className="h-2.5 w-2.5" />
                    : <TrendingDown className="h-2.5 w-2.5" />}
                  {Math.abs(c.change).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};

// ─── 4. Today's Tasks Card ─────────────────────────────────────────────────────

const TodaysTasksCard: React.FC<{ priorityTasks?: { title: string; detail: string }[] }> = ({
  priorityTasks = [],
}) => {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!priorityTasks.length) return;
    const current = loadTasks();
    const existingLabels = new Set(current.map(t => t.label.toLowerCase()));
    let changed = false;
    const updated = [...current];
    priorityTasks.forEach(pt => {
      if (!existingLabels.has(pt.title.toLowerCase())) {
        updated.unshift({ id: `api-${Date.now()}-${Math.random()}`, label: pt.title, time: pt.detail, done: false, priority: "high", createdAt: Date.now() });
        changed = true;
      }
    });
    if (changed) { const s = updated.slice(0, 8); saveTasks(s); setTasks(s); }
  }, [priorityTasks]);

  const handleToggle = useCallback((id: string) => setTasks(toggleTask(id)), []);
  const handleDelete = useCallback((id: string) => setTasks(deleteTask(id)), []);
  const handleAdd = useCallback(() => {
    if (!newLabel.trim()) return;
    setTasks(addTask(newLabel));
    setNewLabel(""); setAdding(false);
  }, [newLabel]);

  const completed = tasks.filter(t => t.done).length;

  return (
    <GlassCard gradient="amber" icon={<ListChecks className="h-4 w-4 text-white" />} title="Today's Tasks" badge={`${completed}/${tasks.length}`}>
      {tasks.length === 0 ? (
        <p className="text-[11px] text-white/50 text-center py-2">No tasks yet — add one!</p>
      ) : (
        <div className="space-y-1">
          {tasks.slice(0, 4).map(task => (
            <div key={task.id} className="flex items-center gap-2 group">
              <button onClick={() => handleToggle(task.id)}
                className={`h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${task.done ? "bg-white border-white" : "border-white/40 hover:border-white"}`}>
                {task.done && <CheckCircle2 className="h-3 w-3 text-amber-500" />}
              </button>
              <p className={`flex-1 text-[11px] font-medium truncate ${task.done ? "line-through text-white/35" : "text-white/85"}`}>
                {task.label}
                {task.time && <span className="text-white/35 ml-1">· {task.time}</span>}
              </p>
              <button onClick={() => handleDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-white/30 hover:text-red-300 transition-all">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {adding ? (
        <div className="mt-2 flex gap-1.5">
          <input autoFocus value={newLabel} onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setAdding(false); setNewLabel(""); } }}
            placeholder="Task name…"
            className="flex-1 text-[11px] bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white placeholder-white/35 focus:outline-none focus:border-white/40" />
          <button onClick={handleAdd} className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[11px] font-bold text-white transition-colors">Add</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="mt-2 w-full flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-white/60 hover:text-white transition-all">
          <Plus className="h-3 w-3" /> Add task
        </button>
      )}
    </GlassCard>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

const ActionCards: React.FC<{ priorityTasks?: { title: string; detail: string }[] }> = ({
  priorityTasks = [],
}) => (
  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
    <CropHealthCard />
    <WeatherImpactCard />
    <MarketPricesCard />
    <TodaysTasksCard priorityTasks={priorityTasks} />
  </div>
);

export default ActionCards;
