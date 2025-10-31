import React from 'react';
import { BarChart3, DollarSign, Wheat, Calendar } from 'lucide-react';

const StatsCards: React.FC = () => {
  const stats = [
    {
      id: 1,
      title: "Total Yield",
      value: "2,450 kg",
      change: "+12%",
      icon: Wheat,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      id: 2,
      title: "Revenue",
      value: "₹1,23,000",
      change: "+8%",
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      id: 3,
      title: "Farm Size",
      value: "5.2 acres",
      change: "0%",
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      id: 4,
      title: "Days to Harvest",
      value: "45 days",
      change: "-5 days",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${stat.borderColor} hover:shadow-xl transition-shadow`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <span className={`text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-600' :
                stat.change.startsWith('-') && stat.title !== 'Days to Harvest' ? 'text-red-600' :
                stat.change.startsWith('-') && stat.title === 'Days to Harvest' ? 'text-green-600' :
                'text-gray-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;