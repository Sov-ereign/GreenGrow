import React from 'react';
import { AlertTriangle, Droplets, Bug, TrendingUp } from 'lucide-react';

const RecommendationsPanel: React.FC = () => {
  const recommendations = [
    {
      id: 1,
      title: "Irrigation Alert",
      description: "Your wheat field needs watering. Soil moisture is at 35%.",
      priority: "high",
      icon: Droplets,
      action: "Water Now",
      time: "2 hours ago"
    },
    {
      id: 2,
      title: "Pest Warning",
      description: "Aphids detected in nearby farms. Consider preventive spraying.",
      priority: "medium",
      icon: Bug,
      action: "View Details",
      time: "1 day ago"
    },
    {
      id: 3,
      title: "Market Price Update",
      description: "Wheat prices increased by 8% this week. Good time to sell surplus.",
      priority: "low",
      icon: TrendingUp,
      action: "Check Prices",
      time: "3 days ago"
    },
    {
      id: 4,
      title: "Weather Advisory",
      description: "Light rain expected in 2 days. Postpone fertilizer application.",
      priority: "medium",
      icon: AlertTriangle,
      action: "View Forecast",
      time: "5 hours ago"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getIconColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Personalized Recommendations</h2>
      
      <div className="grid gap-4">
        {recommendations.map((rec) => {
          const Icon = rec.icon;
          return (
            <div
              key={rec.id}
              className={`border-2 rounded-2xl p-4 transition-all hover:shadow-md ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-white ${getIconColor(rec.priority)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{rec.title}</h3>
                    <p className="text-sm text-gray-500">{rec.time}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {rec.priority.toUpperCase()}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4">{rec.description}</p>
              
              <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                {rec.action}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationsPanel;