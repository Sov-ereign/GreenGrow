import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

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

const Market: React.FC = () => {
  const [records, setRecords] = useState<MandiRecord[]>([]);
  const [filtered, setFiltered] = useState<MandiRecord[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('All');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/mandi/prices');
        if (!res.ok) throw new Error('Failed to fetch mandi prices');
        const data = await res.json();
        const recs = data.records || [];
        setRecords(recs);
        setFiltered(recs);
        const uniqueStates = Array.from(new Set(recs.map((r: any) => r.state))).sort();
        setStates(['All', ...uniqueStates]);
      } catch (err) {
        console.error('Error fetching prices:', err);
        setRecords([]);
        setFiltered([]);
        setStates(['All']);
      } finally {
        setLoading(false);
      }
    };

    const fetchNews = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/news');
        if (!res.ok) throw new Error('News API not found');
        const data = await res.json();
        setNews(data.news || []);
      } catch (err) {
        console.error('Error fetching news:', err);
        setNews([]);
      }
    };

    fetchPrices();
    fetchNews();
  }, []);

  const handleFilter = (state: string) => {
    setSelectedState(state);
    setFiltered(state === 'All' ? records : records.filter((r) => r.state === state));
  };

  const transformed = filtered.map((item) => {
    const min = parseFloat(item.min_price);
    const modal = parseFloat(item.modal_price);
    const change = min ? (((modal - min) / min) * 100).toFixed(1) : '0.0';
    const trend = modal >= min ? 'up' : 'down';

    return {
      crop: item.commodity,
      currentPrice: `₹${modal}`,
      change: `${trend === 'up' ? '+' : '-'}${change}%`,
      trend,
      lastWeek: `₹${min}`,
      market: `${item.market}, ${item.state}`
    };
  });

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">Loading market data...</div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Market Prices</h1>
        <select
          value={selectedState}
          onChange={(e) => handleFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700"
        >
          {states.map((state, index) => (
            <option key={index} value={state}>{state}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Current Market Prices</h2>

          {filtered.length === 0 ? (
            <p className="text-gray-500">No records found.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Crop</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Current Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Change</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Market</th>
                </tr>
              </thead>
              <tbody>
                {transformed.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-800">{item.crop}</div>
                      <div className="text-sm text-gray-500">Last week: {item.lastWeek}</div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-800">{item.currentPrice}</td>
                    <td className="py-4 px-4">
                      <div className={`flex items-center space-x-1 ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="font-medium">{item.change}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{item.market}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* News Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Today Market News</h2>

          {news.length === 0 ? (
            <p className="text-gray-500 text-sm">No news available right now.</p>
          ) : (
            <div className="space-y-4">
              {news.map((item, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-800 mb-1">{item.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{item.time}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.impact === 'positive' ? 'bg-green-100 text-green-700' :
                      item.impact === 'negative' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {item.impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="w-full mt-6 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
            More News +
          </button>
        </div>
      </div>
    </div>
  );
};

export default Market;
