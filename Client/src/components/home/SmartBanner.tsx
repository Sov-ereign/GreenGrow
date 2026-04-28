import React, { useMemo } from "react";
import {
  Sun, CloudRain, Cloud, AlertTriangle, CheckCircle2,
  TrendingUp, TrendingDown, MapPin, Sparkles,
  Wind, Droplets, Loader2, Clock, Flame, Activity,
} from "lucide-react";
import { useWeather } from "@/lib/useWeather";
import { getTopPriorityTask } from "@/lib/taskStore";
import { useMandiPrices } from "@/lib/useMandiPrices";

interface SmartBannerProps {
  userName: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   INLINE CSS — keeps all animation keyframes co-located with the component
   ═══════════════════════════════════════════════════════════════════════════ */

const bannerCSS = `
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0;  }
}
@keyframes float-slow {
  0%, 100% { transform: translateY(0px) scale(1);   }
  50%      { transform: translateY(-8px) scale(1.05);}
}
@keyframes float-med {
  0%, 100% { transform: translateY(0px);   }
  50%      { transform: translateY(-5px);  }
}
@keyframes aurora {
  0%   { opacity: 0.15; transform: translateX(-5%) rotate(-2deg); }
  50%  { opacity: 0.25; transform: translateX(5%)  rotate(2deg);  }
  100% { opacity: 0.15; transform: translateX(-5%) rotate(-2deg); }
}
.banner-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.07), transparent);
  background-size: 200% 100%;
  animation: shimmer 6s ease-in-out infinite;
}
.float-slow  { animation: float-slow 7s ease-in-out infinite; }
.float-med   { animation: float-med  5s ease-in-out infinite; }
.aurora-glow { animation: aurora 8s ease-in-out infinite; }
`;

// ─── Main Banner ──────────────────────────────────────────────────────────────

const SmartBanner: React.FC<SmartBannerProps> = ({ userName }) => {
  const { weather, advice, loading: wLoading } = useWeather();
  const { topGainer: topCrop, loading: mLoading } = useMandiPrices();
  const topTask = useMemo(() => getTopPriorityTask(), []);

  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? "Good night" :
      hour < 12 ? "Good morning" :
        hour < 17 ? "Good afternoon" : "Good evening";
  const emoji = hour < 5 ? "🌙" : hour < 12 ? "🌅" : hour < 17 ? "☀️" : "🌙";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });

  const desc = (weather?.description ?? "").toLowerCase();
  const isRainy = desc.includes("rain") || desc.includes("drizzle");
  const WIcon = isRainy ? CloudRain : desc.includes("cloud") ? Cloud : Sun;

  return (
    <>
      <style>{bannerCSS}</style>

      <div className="relative overflow-hidden rounded-[1.75rem] shadow-2xl shadow-emerald-950/30 ring-1 ring-white/10">

        {/* ▸ Deep base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 to-green-800" />

        {/* ▸ Aurora mesh — slowly swaying colour blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="aurora-glow absolute -left-20 top-0 h-[28rem] w-[28rem] rounded-full bg-emerald-500/20 blur-[80px]" />
          <div className="aurora-glow absolute -right-20 -bottom-10 h-[26rem] w-[26rem] rounded-full bg-teal-400/15 blur-[90px] [animation-delay:3s]" />
          <div className="aurora-glow absolute left-1/3 -top-10 h-64 w-64 rounded-full bg-lime-400/10 blur-[60px] [animation-delay:5s]" />
          <div className="aurora-glow absolute right-1/4 bottom-0 h-48 w-48 rounded-full bg-yellow-300/8 blur-[50px] [animation-delay:2s]" />
        </div>

        {/* ▸ Shimmer sweep layer */}
        <div className="banner-shimmer absolute inset-0 pointer-events-none" />

        {/* ▸ Grain / noise texture */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
        />

        {/* ▸ Floating orbs — animated */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="float-slow absolute top-6 right-12 h-2 w-2 rounded-full bg-emerald-300/50" />
          <div className="float-med  absolute top-14 right-40 h-1.5 w-1.5 rounded-full bg-white/30 [animation-delay:1.5s]" />
          <div className="float-slow absolute bottom-10 left-20 h-1 w-1 rounded-full bg-yellow-300/40 [animation-delay:3s]" />
          <div className="float-med  absolute bottom-16 right-24 h-1 w-1 rounded-full bg-sky-300/30 [animation-delay:0.8s]" />
        </div>

        {/* ═══ Content ═══ */}
        <div className="relative z-10 p-5 md:p-7">

          {/* ── Hero row ── */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
            <div>
              {/* AI badge */}
              <div className="inline-flex items-center gap-2 bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] rounded-full px-3.5 py-1.5 mb-3 shadow-lg shadow-black/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <Sparkles className="h-3 w-3 text-yellow-300" />
                <span className="text-[10px] font-bold text-emerald-200/90 uppercase tracking-[0.12em]">AI Farm Assistant</span>
              </div>

              <h1 className="text-2xl md:text-[1.75rem] font-black text-white leading-tight tracking-tight">
                {greeting}, {userName.split(" ")[0]}!{" "}
                <span className="text-2xl inline-block ml-0.5">{emoji}</span>
              </h1>
              <p className="text-emerald-300/70 text-xs font-medium mt-1.5 tracking-wide">{today}</p>
            </div>

            {/* Right — Location + weather summary pills */}
            {weather && (
              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                <GlassPill>
                  <MapPin className="h-3.5 w-3.5 text-emerald-300" />
                  <span className="text-white text-xs font-semibold truncate max-w-[120px]">{weather.location}</span>
                </GlassPill>
                <GlassPill>
                  <WIcon className="h-4 w-4 text-sky-300" />
                  <span className="text-xl font-black text-white leading-none">{weather.temp}°</span>
                  <span className="text-[10px] text-white/50 capitalize leading-none">{weather.description}</span>
                </GlassPill>
              </div>
            )}
          </div>

          {/* ── 4 Glass Cards ── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">

            {/* 1 — Weather */}
            <GlassInfoCard
              accent="sky"
              loading={wLoading}
              label="Live Weather"
              icon={
                wLoading
                  ? <Loader2 className="h-5 w-5 text-sky-300 animate-spin" />
                  : weather
                    ? <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt="" className="h-10 w-10 drop-shadow-[0_4px_12px_rgba(56,189,248,0.4)]" />
                    : <Sun className="h-5 w-5 text-yellow-300" />
              }
            >
              <p className="text-[1.65rem] font-black text-white leading-none tracking-tight">
                {weather ? `${weather.temp}°C` : "—"}
              </p>
              <p className="text-[11px] text-white/50 capitalize mt-0.5 font-medium">
                {weather?.description ?? "Add VITE_WEATHER_API_KEY"}
              </p>
              {weather && (
                <div className="mt-3 flex flex-col gap-1.5">
                  <MiniStat icon={<Droplets className="h-3 w-3" />} text={`${weather.humidity}% humidity`} tint="text-sky-300/80" />
                  <MiniStat icon={<Wind className="h-3 w-3" />} text={`${weather.windSpeedKmh} km/h wind`} tint="text-sky-300/80" />
                </div>
              )}
            </GlassInfoCard>

            {/* 2 — AI Alert */}
            <GlassInfoCard
              accent={advice?.tag === "good" ? "emerald" : advice?.tag === "warning" ? "rose" : "violet"}
              loading={wLoading}
              label="AI Alert"
              icon={
                <div className="relative">
                  <AlertTriangle className="h-5 w-5 text-rose-300" />
                  {advice?.tag === "warning" && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-rose-400 animate-ping" />
                  )}
                </div>
              }
            >
              <p className="text-[13px] font-bold text-white leading-snug">
                {advice?.primary ?? (isRainy ? "🌧 Fungus Risk" : "🔍 Inspect Today")}
              </p>
              <p className="text-[11px] text-white/45 mt-1 leading-snug">
                {advice?.secondary ?? "Check your crops"}
              </p>
              {advice?.suggestions[0] && (
                <div className="mt-3 flex items-start gap-2 bg-white/[0.06] border border-white/[0.08] rounded-xl px-2.5 py-2">
                  <Activity className="h-3 w-3 text-white/40 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] font-semibold text-white/70">{advice.suggestions[0]}</p>
                </div>
              )}
            </GlassInfoCard>

            {/* 3 — Today's Focus */}
            <GlassInfoCard
              accent="emerald"
              label="Today's Focus"
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-300" />}
            >
              {topTask ? (
                <>
                  <p className="text-[13px] font-bold text-white leading-snug">{topTask.label}</p>
                  {topTask.time && (
                    <div className="mt-1.5 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5 text-white/40" />
                      <span className="text-[10px] text-white/45 font-medium">{topTask.time}</span>
                    </div>
                  )}
                  <div className="mt-2.5 inline-flex items-center gap-1.5 bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1">
                    <Flame className={`h-3 w-3 ${topTask.priority === "high" ? "text-rose-400" :
                      topTask.priority === "medium" ? "text-amber-400" : "text-emerald-400"
                      }`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${topTask.priority === "high" ? "text-rose-300" :
                      topTask.priority === "medium" ? "text-amber-300" : "text-emerald-300"
                      }`}>
                      {topTask.priority}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-lg font-black text-white">All Done! ✅</p>
                  <p className="text-[11px] text-white/45 mt-1">Great work, farmer!</p>
                </>
              )}
            </GlassInfoCard>

            {/* 4 — Market Alert */}
            <GlassInfoCard
              accent="amber"
              loading={mLoading}
              label="Market Alert"
              icon={<TrendingUp className="h-5 w-5 text-yellow-300" />}
            >
              {topCrop ? (
                <>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[13px] font-bold text-white">{topCrop.name}</span>
                    <span className={`inline-flex items-center gap-0.5 text-[13px] font-black ${topCrop.change >= 0 ? "text-emerald-300" : "text-rose-300"
                      }`}>
                      {topCrop.change >= 0
                        ? <TrendingUp className="h-3.5 w-3.5" />
                        : <TrendingDown className="h-3.5 w-3.5" />}
                      {topCrop.change >= 0 ? "+" : ""}{topCrop.change.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-white/45 mt-0.5 font-medium">
                    ₹{topCrop.modalPrice.toFixed(0)}/qtl · {topCrop.market}
                  </p>
                  <div className="mt-3 flex items-start gap-2 bg-white/[0.06] border border-white/[0.08] rounded-xl px-2.5 py-2">
                    <span className="text-[10px] leading-none mt-0.5">💡</span>
                    <p className="text-[10px] font-semibold text-yellow-200/80">{topCrop.suggestion}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-white/40 font-medium">{mLoading ? "Loading…" : "No data"}</p>
              )}
            </GlassInfoCard>

          </div>
        </div>

        {/* ▸ Bottom edge refraction line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />
      </div>
    </>
  );
};

export default SmartBanner;

// ═══════════════════════════════════════════════════════════════════════════════
// SUB‑COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

/* ── Glass Pill (header location / weather) ── */

const GlassPill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-1.5 bg-white/[0.06] backdrop-blur-2xl border border-white/[0.1] rounded-2xl px-3 py-2 shadow-lg shadow-black/10 hover:bg-white/[0.1] transition-colors duration-200">
    {children}
  </div>
);

/* ── Glass Info Card ── */

const ACCENTS = {
  sky: { gradient: "from-sky-500/[0.12] via-sky-600/[0.05] to-transparent", border: "border-sky-400/[0.15]", label: "text-sky-300/90", glow: "bg-sky-400/25", hoverBorder: "hover:border-sky-400/30" },
  rose: { gradient: "from-rose-500/[0.12] via-rose-600/[0.05] to-transparent", border: "border-rose-400/[0.15]", label: "text-rose-300/90", glow: "bg-rose-400/25", hoverBorder: "hover:border-rose-400/30" },
  emerald: { gradient: "from-emerald-500/[0.12] via-emerald-600/[0.05] to-transparent", border: "border-emerald-400/[0.15]", label: "text-emerald-300/90", glow: "bg-emerald-400/25", hoverBorder: "hover:border-emerald-400/30" },
  amber: { gradient: "from-amber-500/[0.12] via-amber-600/[0.05] to-transparent", border: "border-amber-400/[0.15]", label: "text-amber-300/90", glow: "bg-amber-400/25", hoverBorder: "hover:border-amber-400/30" },
  violet: { gradient: "from-violet-500/[0.12] via-violet-600/[0.05] to-transparent", border: "border-violet-400/[0.15]", label: "text-violet-300/90", glow: "bg-violet-400/25", hoverBorder: "hover:border-violet-400/30" },
};

const GlassInfoCard: React.FC<{
  label: string;
  accent: keyof typeof ACCENTS;
  icon?: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
}> = ({ label, accent, icon, loading, children }) => {
  const a = ACCENTS[accent];
  return (
    <div className={`
      relative group overflow-hidden rounded-2xl
      bg-gradient-to-br ${a.gradient}
      backdrop-blur-2xl
      border ${a.border} ${a.hoverBorder}
      shadow-lg shadow-black/10
      p-4 flex flex-col gap-2
      hover:shadow-xl hover:shadow-black/15
      hover:-translate-y-[2px]
      transition-all duration-300 ease-out
    `}>
      {/* Inner glow — top-right corner */}
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${a.glow} blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500`} />

      {/* Top shine line — glass refraction illusion */}
      <div className="absolute top-0 inset-x-0 h-px">
        <div className="h-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      {/* Left edge highlight */}
      <div className="absolute top-2 bottom-2 left-0 w-px bg-gradient-to-b from-white/15 via-white/5 to-transparent" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${a.label}`}>{label}</span>
        <span className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">{icon}</span>
      </div>

      {/* Content / Skeleton */}
      {loading ? (
        <div className="space-y-2.5 mt-1">
          <div className="h-5 w-3/4 rounded-lg bg-white/[0.07] animate-pulse" />
          <div className="h-3 w-1/2 rounded-lg bg-white/[0.05] animate-pulse [animation-delay:0.15s]" />
          <div className="h-3 w-2/3 rounded-lg bg-white/[0.04] animate-pulse [animation-delay:0.3s]" />
        </div>
      ) : (
        <div className="relative z-10 flex-1">{children}</div>
      )}
    </div>
  );
};

/* ── Mini stat row ── */

const MiniStat: React.FC<{ icon: React.ReactNode; text: string; tint: string }> = ({ icon, text, tint }) => (
  <div className={`flex items-center gap-1.5 ${tint}`}>
    {icon}
    <span className="text-[10px] text-white/55 font-medium">{text}</span>
  </div>
);
