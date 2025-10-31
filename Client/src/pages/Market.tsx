import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

const Market: React.FC = () => {
  const marketPrices = [
    {
      crop: 'Wheat',
      currentPrice: '₹2,150',
      change: '+8.5%',
      trend: 'up',
      lastWeek: '₹1,980',
      market: 'Delhi Mandi'
    },
    {
      crop: 'Rice',
      currentPrice: '₹3,200',
      change: '-2.1%',
      trend: 'down',
      lastWeek: '₹3,270',
      market: 'Punjab Mandi'
    },
    {
      crop: 'Corn',
      currentPrice: '₹1,850',
      change: '+12.3%',
      trend: 'up',
      lastWeek: '₹1,650',
      market: 'UP Mandi'
    },
    {
      crop: 'Sugarcane',
      currentPrice: '₹350',
      change: '+5.2%',
      trend: 'up',
      lastWeek: '₹333',
      market: 'Maharashtra Mandi'
    },
    {
      crop: 'Cotton',
      currentPrice: '₹6,800',
      change: '-1.8%',
      trend: 'down',
      lastWeek: '₹6,925',
      market: 'Gujarat Mandi'
    },
    {
      crop: 'Soybean',
      currentPrice: '₹4,200',
      change: '+15.7%',
      trend: 'up',
      lastWeek: '₹3,630',
      market: 'MP Mandi'
    }
  ];

  const marketNews = [
    {
      title: 'Wheat Prices Surge Due to Export Demand',
      time: '2 hours ago',
      impact: 'positive'
    },
    {
      title: 'Monsoon Forecast Affects Rice Market',
      time: '5 hours ago',
      impact: 'neutral'
    },
    {
      title: 'Government Announces MSP Increase',
      time: '1 day ago',
      impact: 'positive'
    },
    {
      title: 'Cotton Export Restrictions Lifted',
      time: '2 days ago',
      impact: 'positive'
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Market Prices</h1>
        <p className="text-gray-600">Real-time commodity prices and market trends</p>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <span className="text-sm font-medium text-green-600">+12.5%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Average Gain</h3>
          <p className="text-2xl font-bold text-gray-800">₹2,450</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-blue-600">Live</span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Active Markets</h3>
          <p className="text-2xl font-bold text-gray-800">156</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-500" />
            </div>
            <span className="text-sm font-medium text-purple-600">Today</span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Trading Volume</h3>
          <p className="text-2xl font-bold text-gray-800">₹45.2L</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-yellow-500" />
            </div>
            <span className="text-sm font-medium text-yellow-600">Best</span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Top Performer</h3>
          <p className="text-2xl font-bold text-gray-800">Soybean</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Current Market Prices</h2>
          <div className="overflow-x-auto">
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
                {marketPrices.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-800">{item.crop}</div>
                      <div className="text-sm text-gray-500">Last week: {item.lastWeek}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-800">{item.currentPrice}</div>
                      <div className="text-sm text-gray-500">per quintal</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`flex items-center space-x-1 ${
                        item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="font-medium">{item.change}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{item.market}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Market News */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Market News</h2>
          <div className="space-y-4">
            {marketNews.map((news, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                <h3 className="font-medium text-gray-800 mb-1">{news.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{news.time}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    news.impact === 'positive' ? 'bg-green-100 text-green-700' :
                    news.impact === 'negative' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {news.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-6 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
            View All News
          </button>
        </div>
      </div>
    </div>
  );
};

export default Market;