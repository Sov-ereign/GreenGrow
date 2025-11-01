import React, { useEffect, useState, useRef } from "react";
import {
  Bell,
  Search,
  User,
  Menu,
  Globe,
  ChevronDown,
  LogOut,
  LogIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "bn,en,hi,fr,de,ar,id,gu,ha",
          layout: (window as any).google.translate.TranslateElement.InlineLayout
            .SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    // Load Google Translate script only once
    const existing = document.getElementById("google-translate-script");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);
    }

    // Close dropdown on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <style>{`
        .goog-te-banner-frame.skiptranslate { display: none !important; }
        body { top: 0px !important; }
        .goog-logo-link, .goog-te-gadget span, .goog-te-gadget img { display: none !important; }
        .goog-te-gadget { font-size: 0 !important; }

        #google_translate_element select {
          appearance: none;
          width: 100%;
          height: 42px;
          padding: 8px 36px 8px 12px;
          font-size: 14px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background-color: #f9fafb;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        #google_translate_element select:hover {
          border-color: #22c55e;
          background-color: #ecfdf5;
        }

        #google_translate_element {
          position: relative;
          display: block;
          width: 100%;
        }

        #google_translate_element::after {
          content: "▾";
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          pointer-events: none;
          font-size: 12px;
        }
      `}</style>

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

          {/* Bottom Row - Notifications, Translate, and User */}
          <div className="flex items-center justify-between md:justify-end space-x-4">
            <div className="relative">
              <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </div>

            {/* Translate Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition text-sm"
              >
                <Globe className="h-4 w-4 text-green-600" />
                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                  Translate
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Google Translate Element */}
              <div
                className={`absolute right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-50 p-2 w-48 transition-all duration-200 ${
                  open
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-2 pointer-events-none"
                }`}
              >
                <div
                  id="google_translate_element"
                  className=" text-gray-800 text-base hover:scale-[1.02] transition-transform"
                  style={{ minHeight: "30px", minWidth: "100%" }}
                ></div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 md:pl-4 md:border-l md:border-gray-200">
              {user ? (
                <>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-800">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.location || "India"}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;




