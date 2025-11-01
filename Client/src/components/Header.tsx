import React, { useEffect, useState, useRef } from "react";
import { Globe, Search, User, ChevronDown } from "lucide-react";

const App: React.FC = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "bn,en,hi,fr,de,ar,id,gu,ha",
          layout: (window as any).google.translate.TranslateElement
            .InlineLayout.SIMPLE,
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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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

        /* Smooth fade animation */
        .fade-enter {
          opacity: 0;
          transform: translateY(-4px);
        }
        .fade-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: all 0.2s ease;
        }
        .fade-exit {
          opacity: 1;
        }
        .fade-exit-active {
          opacity: 0;
          transform: translateY(-4px);
          transition: all 0.15s ease;
        }
      `}</style>

      <header className="bg-white shadow-sm rounded-2xl m-4 px-6 py-4 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for crops, weather, or advice..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Translate Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition"
            >
              <Globe className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Translate</span>
              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Keep Google element mounted always */}
            <div
              className={`absolute right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-50 p-2 w-48 transition-all duration-200 ${
                open ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
              }`}
            >
              <div id="google_translate_element"></div>
            </div>
          </div>

          {/* Profile */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">Team Devnest</p>
              <p className="text-xs text-gray-500">Kolkata, India</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default App;
