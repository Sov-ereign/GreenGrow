import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  CloudRain,
  Wheat,
  DollarSign,
  Building2,
  Settings,
  MessageCircle,
  Voicemail,
  X,
  Leaf,
  Plane,
  Sprout,
  TrendingUp,
} from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();

  const menuItems = [
    { id: "home", label: "Home", icon: Home, path: "/home" },
    { id: "chat", label: "AI Chat", icon: MessageCircle, path: "/chat" },
    {
      id: "voice",
      label: "Voice Assistant",
      icon: Voicemail,
      path: "/voice",
    },
    {
      id: "disease",
      label: "Disease Prediction",
      icon: Leaf,
      path: "/disease-prediction"
    },
    {
      id: "drone",
      label: "Drone Module",
      icon: Plane,
      path: "/drone-module"
    },
    {
      id: "crop-prediction",
      label: "Crop Prediction",
      icon: Sprout,
      path: "/crop-prediction"
    },
    {
      id: "crop-production",
      label: "Crop Production",
      icon: TrendingUp,
      path: "/crop-production"
    },
    { id: "weather", label: "Weather", icon: CloudRain, path: "/weather" },
    { id: "crops", label: "Crops", icon: Wheat, path: "/crops" },
    { id: "market", label: "Market Prices", icon: DollarSign, path: "/market" },
    { id: "schemes", label: "Gov Schemes", icon: Building2, path: "/schemes" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <div className="w-64 bg-white shadow-lg md:rounded-2xl md:m-4 p-6 h-full overflow-y-auto">
      {/* Mobile Close Button */}
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <Wheat className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">GreenGrow</h1>
            <p className="text-sm text-gray-500">Advisory Dashboard</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={onClose}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${isActive
                ? "bg-green-50 text-green-700 border-l-4 border-green-500"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-100">
        <div className="bg-green-50 rounded-xl p-4">
          <h3 className="font-medium text-green-800 mb-2">Need Help?</h3>
          <p className="text-sm text-green-600 mb-3">
            Get expert farming advice
          </p>
          <Link
            to="/support"
            onClick={onClose}
            className="w-full bg-green-500 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-green-600 transition-colors block text-center"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
