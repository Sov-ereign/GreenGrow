import React from "react";
import {
  BarChart3,
  DollarSign,
  Wheat,
  CalendarDays,
} from "lucide-react";
import { apiUrl } from "@/lib/env";

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
  const [stats, setStats] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(apiUrl("/api/farm"), {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch farm stats");
        const data = await res.json();

        // Aggregate data
        const totalYield = data.reduce((sum: number, f: any) => sum + (Number(f.totalYield) || 0), 0);
        const revenue = data.reduce((sum: number, f: any) => sum + (Number(f.revenue) || 0), 0);
        const farmSize = data.reduce((sum: number, f: any) => sum + (Number(f.farmSize) || 0), 0);
        const daysToHarvest = data.length > 0
          ? Math.min(...data.map((f: any) => Number(f.daysToHarvest) || Infinity))
          : 0;

        const formattedStats = [
          {
            id: 1,
            title: "Total Yield",
            value: `${totalYield.toLocaleString()} kg`,
            change: "Live",
            icon: Wheat,
            accent: "emerald" as Accent,
          },
          {
            id: 2,
            title: "Revenue",
            value: `₹${revenue.toLocaleString()}`,
            change: "Live",
            icon: DollarSign,
            accent: "blue" as Accent,
          },
          {
            id: 3,
            title: "Farm Size",
            value: `${farmSize.toFixed(1)} acres`,
            change: "Total",
            icon: BarChart3,
            accent: "purple" as Accent,
          },
          {
            id: 4,
            title: "Nearest Harvest",
            value: `${daysToHarvest === Infinity ? 0 : daysToHarvest} days`,
            change: "Next",
            icon: CalendarDays,
            accent: "orange" as Accent,
          },
        ];

        setStats(formattedStats);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-sm">
        Failed to load statistics: {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const accent = accentStyles[stat.accent as Accent];
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
              <span className={`text-[10px] uppercase tracking-wider font-bold ${valueColor(stat.change)}`}>
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
