import React, { useEffect, useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Loader2,
} from "lucide-react";

// --- TYPE DEFINITIONS ---

interface MandiRecord {
  commodity: string;
  market: string;
  state: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

interface NewsItem {
  title: string;
  time: string;
  impact: string;
}

interface TransformedData {
  crop: string;
  currentPrice: string;
  change: string;
  trend: "up" | "down";
  lastWeek: string;
  market: string;
}

interface MarketStats {
  avgChange: number;
  avgPrice: number;
  activeMarkets: number;
  topPerformer: string;
}

// --- MAIN COMPONENT ---

const Market: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [records, setRecords] = useState<MandiRecord[]>([]);
  const [filtered, setFiltered] = useState<MandiRecord[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("All");
  const [news, setNews] = useState<NewsItem[]>([]);

  // Loading states are split for a better UX
  const [pricesLoading, setPricesLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [moreNewsLoading, setMoreNewsLoading] = useState(false);

  // **NEW**: State for crop pagination
  const [visibleCropsCount, setVisibleCropsCount] = useState(10);

  const [stats, setStats] = useState<MarketStats>({
    avgChange: 0,
    avgPrice: 0,
    activeMarkets: 0,
    topPerformer: "N/A",
  });

  // --- DATA FETCHING ---

  const fetchNews = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/news");
      if (!res.ok) throw new Error("News API not found");
      const data = await res.json();
      setNews((prevNews) => [...prevNews, ...(data.news || [])]);
    } catch (err) {
      console.error("Error fetching news:", err);
    }
  };

  const handleLoadMoreNews = async () => {
    setMoreNewsLoading(true);
    await fetchNews();
    setMoreNewsLoading(false);
  };

  useEffect(() => {
    const fetchInitialPrices = async () => {
      setPricesLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/mandi/prices");
        if (!res.ok) throw new Error("Failed to fetch mandi prices");
        const data = await res.json();
        const recs = data.records || [];
        
        setRecords(recs);
        setFiltered(recs);
        const uniqueStates = Array.from(
          new Set(recs.map((r: MandiRecord) => r.state))
        ).sort();
        setStates(["All", ...uniqueStates]);
      } catch (err) {
        console.error("Error fetching prices:", err);
      } finally {
        setPricesLoading(false);
      }
    };

    const fetchInitialNews = async () => {
      setNewsLoading(true);
      await fetchNews();
      setNewsLoading(false);
    };

    fetchInitialPrices();
    fetchInitialNews();
  }, []);

  // --- DATA COMPUTATION ---

  useEffect(() => {
    if (records.length === 0) return;
    // ... (stat calculation logic remains the same)
    let totalChange = 0;
    let totalPrice = 0;
    let topPerf = { name: "N/A", change: -Infinity };
    let validRecords = 0;

    records.forEach((item) => {
      const min = parseFloat(item.min_price);
      const modal = parseFloat(item.modal_price);

      if (min > 0 && modal > 0) {
        const change = ((modal - min) / min) * 100;
        totalChange += change;
        totalPrice += modal;
        validRecords++;

        if (change > topPerf.change) {
          topPerf = { name: item.commodity, change: change };
        }
      }
    });

    setStats({
      avgChange: validRecords > 0 ? totalChange / validRecords : 0,
      avgPrice: validRecords > 0 ? totalPrice / validRecords : 0,
      activeMarkets: states.length > 1 ? states.length - 1 : 0,
      topPerformer: topPerf.name,
    });
  }, [records, states]);

  const handleFilter = (state: string) => {
    setSelectedState(state);
    setVisibleCropsCount(10); // Reset count on filter change
    setFiltered(
      state === "All" ? records : records.filter((r) => r.state === state)
    );
  };

  const transformed: TransformedData[] = useMemo(() => {
    // ... (transformation logic remains the same)
    return filtered.map((item) => {
      const min = parseFloat(item.min_price);
      const modal = parseFloat(item.modal_price);
      const change = min > 0 ? ((modal - min) / min) * 100 : 0;
      const trend = modal >= min ? "up" : "down";

      return {
        crop: item.commodity,
        currentPrice: `₹${modal.toFixed(2)}`,
        change: `${trend === "up" ? "+" : ""}${change.toFixed(1)}%`,
        trend,
        lastWeek: `₹${min.toFixed(2)}`,
        market: `${item.market}, ${item.state}`,
      };
    });
  }, [filtered]);

  // --- RENDER LOGIC ---

  if (pricesLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
        <p className="ml-4 text-lg text-gray-700">Loading Market Data...</p>
      </div>
    );
  }

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">
          Market Overview
        </h1>
        <p className="text-gray-600">
          Real-time commodity prices and market trends
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Average Price"
          value={`₹${stats.avgPrice.toFixed(2)}`}
          change={`${stats.avgChange.toFixed(1)}%`}
          icon={TrendingUp}
          trend={stats.avgChange >= 0 ? "up" : "down"}
        />
        <StatCard
          title="Active States"
          value={stats.activeMarkets.toString()}
          change="Live"
          icon={BarChart3}
          trend="neutral"
        />
        <StatCard
          title="Trading Volume"
          value="₹45.2L"
          change="Today"
          icon={DollarSign}
          trend="neutral"
        />
        <StatCard
          title="Top Performer"
          value={stats.topPerformer}
          change="Best"
          icon={TrendingUp}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 sm:mb-0">
              Current Market Prices
            </h2>
            <select
              value={selectedState}
              onChange={(e) => handleFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 w-full sm:w-auto"
            >
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Crop
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Current Price
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Change
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Market
                  </th>
                </tr>
              </thead>
              <tbody>
                {transformed.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  // **FIX**: Slice the array to show only visible crops
                  transformed.slice(0, visibleCropsCount).map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-800">
                          {item.crop}
                        </div>
                        <div className="text-sm text-gray-500">
                          Last week: {item.lastWeek}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-800">
                          {item.currentPrice}
                        </div>
                        <div className="text-sm text-gray-500">per quintal</div>
                      </td>
                      <td className="py-4 px-4">
                        <div
                          className={`flex items-center space-x-1 ${
                            item.trend === "up"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.trend === "up" ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="font-medium">{item.change}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {item.market}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* **NEW**: Load More Button for Crops */}
          {visibleCropsCount < transformed.length && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setVisibleCropsCount((prev) => prev + 10)}
                className="bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors font-medium"
              >
                Load More Crops
              </button>
            </div>
          )}
        </div>

        {/* **FIX**: Market News with responsive height and scroll */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col h-[36rem]">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 shrink-0">
            Today's Market News
          </h2>
          <div className="flex-grow overflow-y-auto pr-2">
            {newsLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : news.length === 0 ? (
              <p className="text-gray-500 text-sm text-center">
                No news available right now.
              </p>
            ) : (
              <div className="space-y-4">
                {news.map((item, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-green-500 pl-4 py-1"
                  >
                    <h3 className="font-medium text-gray-800 mb-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{item.time}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          item.impact === "positive"
                            ? "bg-green-100 text-green-700"
                            : item.impact === "negative"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {capitalize(item.impact)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleLoadMoreNews}
            disabled={moreNewsLoading}
            className="w-full mt-6 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center disabled:bg-gray-400 shrink-0"
          >
            {moreNewsLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "More News +"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- REUSABLE STAT CARD SUB-COMPONENT ---
// (This component remains unchanged)
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  trend: "up" | "down" | "neutral";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  trend,
}) => {
  const trendClasses = {
    up: "text-green-600 bg-green-100",
    down: "text-red-600 bg-red-100",
    neutral: "text-blue-600 bg-blue-100",
  };

  let iconColor: string;
  let iconBg: string;

  if (trend === "up") {
    iconColor = "text-green-500";
    iconBg = "bg-green-100";
  } else if (trend === "down") {
    iconColor = "text-red-500";
    iconBg = "bg-red-100";
  } else {
    iconColor = "text-blue-500";
    iconBg = "bg-blue-100";
  }

  if (title === "Trading Volume") {
    iconColor = "text-purple-500";
    iconBg = "bg-purple-100";
  } else if (title === "Top Performer") {
    iconColor = "text-yellow-500";
    iconBg = "bg-yellow-100";
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <span
          className={`text-sm font-medium px-2 py-1 rounded-full ${trendClasses[trend]}`}
        >
          {change}
        </span>
      </div>
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-800 truncate">{value}</p>
    </div>
  );
};

export default Market;
