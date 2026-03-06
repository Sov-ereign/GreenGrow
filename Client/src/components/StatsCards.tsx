import React from "react";
import {
  BarChart3,
  DollarSign,
  Wheat,
  Calendar,
  Activity,
} from "lucide-react";

type Accent = "emerald" | "rose" | "amber" | "sky" | "slate";

const accentStyles: Record<
  Accent,
  { text: string; bg: string; ring: string; pill: string }
> = {
  emerald: {
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    ring: "ring-emerald-100",
    pill: "bg-emerald-100 text-emerald-700",
  },
  rose: {
    text: "text-rose-700",
    bg: "bg-rose-50",
    ring: "ring-rose-100",
    pill: "bg-rose-100 text-rose-700",
  },
  amber: {
    text: "text-amber-700",
    bg: "bg-amber-50",
    ring: "ring-amber-100",
    pill: "bg-amber-100 text-amber-700",
  },
  sky: {
    text: "text-sky-700",
    bg: "bg-sky-50",
    ring: "ring-sky-100",
    pill: "bg-sky-100 text-sky-700",
  },
  slate: {
    text: "text-slate-700",
    bg: "bg-slate-50",
    ring: "ring-slate-100",
    pill: "bg-slate-100 text-slate-700",
  },
};

const StatsCards: React.FC = () => {
  const stats = [
    {
      id: 1,
      title: "Active plants",
      value: "24",
      change: "+3 this week",
      icon: Wheat,
      accent: "emerald" as Accent,
      hint: "Monitored with latest assessments",
    },
    {
      id: 2,
      title: "High risk",
      value: "3",
      change: "needs attention",
      icon: Activity,
      accent: "rose" as Accent,
      hint: "Prioritize inspections",
    },
    {
      id: 3,
      title: "Next check",
      value: "Thu, 7 Mar",
      change: "2 due today",
      icon: Calendar,
      accent: "amber" as Accent,
      hint: "Schedule follow-ups",
    },
    {
      id: 4,
      title: "Water savings",
      value: "18%",
      change: "this month",
      icon: DollarSign,
      accent: "sky" as Accent,
      hint: "Smart irrigation impact",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const accent = accentStyles[stat.accent] || accentStyles.slate;
        return (
          <div
            key={stat.id}
            className={`relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all ring-1 ${accent.ring}`}
          >
            <div className="flex items-start justify-between p-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-gray-100 shadow-sm">
                  <Icon className={`h-4 w-4 ${accent.text}`} />
                  <span className="text-gray-700">{stat.title}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${accent.pill}`}
                  >
                    {stat.change}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{stat.hint}</p>
              </div>
              <div
                className={`h-12 w-12 rounded-xl ${accent.bg} flex items-center justify-center`}
              >
                <Icon className={`h-6 w-6 ${accent.text}`} />
              </div>
            </div>
            <div className="h-1 w-full bg-gray-100">
              <div className={`h-full w-3/4 ${accent.bg}`}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
