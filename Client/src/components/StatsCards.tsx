import React from "react";
import {
  BarChart3,
  DollarSign,
  Wheat,
  CalendarDays,
} from "lucide-react";

type Accent = "emerald" | "blue" | "purple" | "orange";

const accentStyles: Record<
  Accent,
  { iconBg: string; iconColor: string; border: string }
> = {
  emerald: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    border: "border-emerald-200",
  },
  blue: {
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    border: "border-indigo-200",
  },
  purple: {
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
    border: "border-purple-200",
  },
  orange: {
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    border: "border-orange-200",
  },
};

const valueColor = (val: string) => {
  if (val.startsWith("+") || val.startsWith("-")) return "text-emerald-600";
  return "text-slate-500";
};

const StatsCards: React.FC = () => {
  const stats = [
    {
      id: 1,
      title: "Total Yield",
      value: "2,450 kg",
      change: "+12%",
      icon: Wheat,
      accent: "emerald" as Accent,
    },
    {
      id: 2,
      title: "Revenue",
      value: "₹1,23,000",
      change: "+8%",
      icon: DollarSign,
      accent: "blue" as Accent,
    },
    {
      id: 3,
      title: "Farm Size",
      value: "5.2 acres",
      change: "0%",
      icon: BarChart3,
      accent: "purple" as Accent,
    },
    {
      id: 4,
      title: "Days to Harvest",
      value: "45 days",
      change: "-5 days",
      icon: CalendarDays,
      accent: "orange" as Accent,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const accent = accentStyles[stat.accent];
        return (
          <div
            key={stat.id}
            className={`rounded-2xl bg-white p-5 border ${accent.border} shadow-sm`}
          >
            <div className="flex items-start justify-between mb-5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent.iconBg}`}
              >
                <Icon className={`h-5 w-5 ${accent.iconColor}`} />
              </div>
              <span className={`text-xs font-semibold ${valueColor(stat.change)}`}>
                {stat.change}
              </span>
            </div>
            
            <p className="text-xs font-semibold text-slate-500 mb-1.5">
              {stat.title}
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
