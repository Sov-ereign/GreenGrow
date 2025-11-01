import React from "react";
import { Bell, Search, User, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm md:rounded-2xl m-2 md:m-4 px-4 md:px-6 py-3 md:py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Top Row - Menu Button and Search */}
        <div className="flex items-center gap-3 flex-1 w-full">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for crops, weather, or advice..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
            />
          </div>
        </div>

        {/* Bottom Row - Notifications and User */}
        <div className="flex items-center justify-between md:justify-end space-x-4">
          <div className="relative">
            <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">3</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 md:pl-4 md:border-l md:border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">Team Devnest</p>
              <p className="text-xs text-gray-500">Kolkata, India</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
