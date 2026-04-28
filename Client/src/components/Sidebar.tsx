import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, CloudRain, Wheat, DollarSign, Building2, Settings,
  MessageCircle, Voicemail, PhoneCall, X, Leaf, Plane, Sprout,
  Brain, ChevronDown, ChevronRight, Cpu, BarChart2, HeartPulse,
  HelpCircle, ListChecks,
} from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

// ─── Nav structure ────────────────────────────────────────────────────────────

type NavItem = { id: string; label: string; icon: React.ElementType; path: string };
type NavGroup = {
  id: string; label: string; icon: React.ElementType;
  color: string; activeBg: string; items: NavItem[];
};
type FlatItem = NavItem & { flat: true };
type SidebarEntry = NavGroup | FlatItem;

const NAV: SidebarEntry[] = [
  { id: "home",       label: "Home",        icon: Home,       path: "/home",    flat: true },
  { id: "tasks",      label: "Tasks",       icon: ListChecks, path: "/tasks",   flat: true },
  {
    id: "ai-tools", label: "AI Tools", icon: Brain,
    color: "text-violet-600", activeBg: "bg-violet-50",
    items: [
      { id: "chat",  label: "AI Chat",          icon: MessageCircle, path: "/chat" },
      { id: "voice", label: "Voice Assistant",   icon: Voicemail,     path: "/voice" },
      { id: "ivr",   label: "IVR Dialer",        icon: PhoneCall,     path: "/ivr-dialer" },
    ],
  },
  {
    id: "crop-intel", label: "Crop Intelligence", icon: Cpu,
    color: "text-emerald-600", activeBg: "bg-emerald-50",
    items: [
      { id: "disease",         label: "Disease Detection",   icon: Leaf,     path: "/disease-prediction" },
      { id: "crop-prediction", label: "Crop Prediction",     icon: Sprout,   path: "/crop-prediction" },
      { id: "crop-production", label: "Production Forecast", icon: BarChart2,path: "/crop-production" },
      { id: "drone",           label: "Drone Module",        icon: Plane,    path: "/drone-module" },
    ],
  },
  {
    id: "farm-info", label: "Farm Info", icon: HeartPulse,
    color: "text-sky-600", activeBg: "bg-sky-50",
    items: [
      { id: "weather", label: "Weather",       icon: CloudRain,  path: "/weather" },
      { id: "market",  label: "Market Prices", icon: DollarSign, path: "/market" },
      { id: "schemes", label: "Gov Schemes",   icon: Building2,  path: "/schemes" },
    ],
  },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings", flat: true },
];

// ─── Component ────────────────────────────────────────────────────────────────

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();

  const defaultOpen = () => {
    const open = new Set<string>();
    NAV.forEach(entry => {
      if (!("flat" in entry)) {
        const g = entry as NavGroup;
        if (g.items.some(i => i.path === location.pathname)) open.add(g.id);
      }
    });
    return open;
  };

  const [openGroups, setOpenGroups] = useState<Set<string>>(defaultOpen);

  const toggle = (id: string) =>
    setOpenGroups(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const isGroupActive = (g: NavGroup) => g.items.some(i => i.path === location.pathname);

  return (
    <div className="w-64 bg-white shadow-lg md:rounded-2xl md:m-4 p-4 h-full md:h-[calc(100vh-2rem)] md:sticky md:top-4 overflow-y-auto flex flex-col gap-1">
      {/* Logo */}
      <div className="flex items-center justify-between mb-3 px-2 py-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
            <Wheat className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-800 leading-tight">GreenGrow</h1>
            <p className="text-[11px] text-gray-400 font-medium">Farm Assistant</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV.map(entry => {
          if ("flat" in entry) {
            const Icon = entry.icon;
            const isActive = location.pathname === entry.path;
            return (
              <Link
                key={entry.id}
                to={entry.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border-l-[3px] border-emerald-500 pl-[9px]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon style={{ width: "1.125rem", height: "1.125rem" }} className={`flex-shrink-0 ${isActive ? "text-emerald-600" : ""}`} />
                {entry.label}
              </Link>
            );
          }

          const group = entry as NavGroup;
          const active = isGroupActive(group);
          const open = openGroups.has(group.id);
          const GroupIcon = group.icon;

          return (
            <div key={group.id}>
              <button
                onClick={() => toggle(group.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold ${
                  active ? `${group.activeBg} ${group.color}` : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <GroupIcon style={{ width: "1.125rem", height: "1.125rem" }} className="flex-shrink-0" />
                <span className="flex-1 text-left">{group.label}</span>
                {open ? <ChevronDown className="h-3.5 w-3.5 opacity-60" /> : <ChevronRight className="h-3.5 w-3.5 opacity-40" />}
              </button>

              {open && (
                <div className="ml-4 mt-0.5 mb-1 pl-3 border-l-2 border-gray-100 flex flex-col gap-0.5">
                  {group.items.map(child => {
                    const ChildIcon = child.icon;
                    const childActive = location.pathname === child.path;
                    return (
                      <Link
                        key={child.id}
                        to={child.path}
                        onClick={onClose}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm ${
                          childActive
                            ? `${group.activeBg} font-semibold ${group.color}`
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium"
                        }`}
                      >
                        <ChildIcon style={{ width: "1rem", height: "1rem" }} className="flex-shrink-0" />
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Help card */}
      <div className="pt-3 border-t border-gray-100 mt-2">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-4 w-4 text-emerald-600" />
            <h3 className="font-semibold text-emerald-800 text-sm">Need Help?</h3>
          </div>
          <p className="text-xs text-emerald-600 mb-3 leading-relaxed">Get expert farming advice from our team.</p>
          <Link
            to="/support"
            onClick={onClose}
            className="w-full bg-emerald-600 text-white text-xs font-semibold py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors block text-center"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
