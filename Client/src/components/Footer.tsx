import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Users, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white rounded-xl md:rounded-2xl shadow-lg m-2 md:m-4 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <Link
            to="/help"
            className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Help Center</span>
          </Link>
          <Link
            to="/community"
            className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Community</span>
          </Link>
          <Link
            to="/support"
            className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span className="text-sm font-medium">Support</span>
          </Link>
        </div>
        
        <div className="text-center md:text-right">
          <p className="text-xs md:text-sm text-gray-500">© 2024 GreenGrow Advisory</p>
          <p className="text-xs text-gray-400">Empowering farmers with smart technology</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;