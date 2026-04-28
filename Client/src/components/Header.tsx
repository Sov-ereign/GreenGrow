import React, { useEffect, useState } from "react";
import {
  Bell, Search, User, Menu, LogOut, LogIn,
  WifiOff, RefreshCw, CheckCircle2, Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { syncBus } from "../lib/syncBus";
import { apiUrl } from "../lib/env";

interface HeaderProps {
  onMenuClick?: () => void;
}

// ─── Sync status hook (now emits real refetch via syncBus) ────────────────────

type SyncStatus = "synced" | "syncing" | "offline" | "error";

function useSyncStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [status, setStatus] = useState<SyncStatus>(navigator.onLine ? "synced" : "offline");
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [, _tick] = useState(0); // for relative-time re-render

  // Online/offline events
  useEffect(() => {
    const goOnline  = () => { setOnline(true);  doSync(); };
    const goOffline = () => { setOnline(false); setStatus("offline"); };
    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodic auto-sync every 5 min
  useEffect(() => {
    if (!online) return;
    const id = setInterval(() => doSync(), 5 * 60 * 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  // Refresh relative time display every 30s
  useEffect(() => {
    const id = setInterval(() => _tick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const doSync = async () => {
    if (!online && navigator.onLine === false) return;
    setStatus("syncing");
    try {
      // Fire real API calls in parallel to confirm backend is alive
      await Promise.allSettled([
        fetch(apiUrl("/api/plants"), { credentials: "include" }),
        fetch(apiUrl("/api/mandi/prices"), { credentials: "include" }),
      ]);
      // Tell all hooks to bust cache and re-fetch
      syncBus.emit();
      setStatus("synced");
      setLastSynced(new Date());
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("synced"), 3000);
    }
  };

  const forceSync = () => {
    if (!navigator.onLine) { setStatus("offline"); return; }
    doSync();
  };

  return { status, lastSynced, forceSync };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelative(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)   return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ─── SyncBadge ────────────────────────────────────────────────────────────────

const SyncBadge: React.FC = () => {
  const { status, lastSynced, forceSync } = useSyncStatus();
  const [showTooltip, setShowTooltip] = useState(false);

  const config: Record<SyncStatus, { icon: React.ReactNode; label: string; dot: string; pill: string }> = {
    synced: {
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
      label: "Synced", dot: "bg-emerald-400",
      pill: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    },
    syncing: {
      icon: <RefreshCw className="h-3.5 w-3.5 text-sky-500 animate-spin" />,
      label: "Syncing…", dot: "bg-sky-400 animate-pulse",
      pill: "bg-sky-50 text-sky-700 border-sky-200",
    },
    offline: {
      icon: <WifiOff className="h-3.5 w-3.5 text-red-500" />,
      label: "Offline", dot: "bg-red-400 animate-pulse",
      pill: "bg-red-50 text-red-700 border-red-200",
    },
    error: {
      icon: <Zap className="h-3.5 w-3.5 text-orange-500" />,
      label: "Retry",  dot: "bg-orange-400",
      pill: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
    },
  };

  const c = config[status];

  return (
    <div className="relative">
      <button
        onClick={() => { forceSync(); }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={status === "syncing"}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-all hover:shadow-sm disabled:cursor-wait ${c.pill}`}
        aria-label={`Sync status: ${c.label} — click to refresh`}
        title="Click to sync all data"
      >
        {c.icon}
        <span className="hidden sm:inline">{c.label}</span>
        <span className={`h-2 w-2 rounded-full flex-shrink-0 ${c.dot}`} />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full mt-2 right-0 z-50 bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 whitespace-nowrap shadow-xl min-w-[180px] pointer-events-none">
          {status === "offline" ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-red-300 font-semibold">
                <WifiOff className="h-3 w-3" /> No internet connection
              </div>
              <p className="text-gray-400">Data may be outdated</p>
            </div>
          ) : status === "syncing" ? (
            <div className="flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3 text-sky-300 animate-spin" />
              Fetching weather, market &amp; crops…
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                <CheckCircle2 className="h-3 w-3" /> All data up to date
              </div>
              <p className="text-gray-400">Last synced {formatRelative(lastSynced)}</p>
              <p className="text-gray-500 text-[10px]">Click to force refresh</p>
            </div>
          )}
          <div className="absolute -top-1.5 right-4 w-3 h-3 bg-gray-900 rotate-45 rounded-sm" />
        </div>
      )}
    </div>
  );
};

// ─── Header ───────────────────────────────────────────────────────────────────

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm md:rounded-2xl m-2 md:m-4 px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between gap-3">
        {/* Left: hamburger + search */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search crops, weather, advice…"
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-transparent text-sm bg-gray-50 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Right: sync badge + bell + user */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <SyncBadge />

          {/* Bell */}
          <div className="relative">
            <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-[9px] text-white font-bold leading-none">3</span>
            </div>
          </div>

          <div className="h-8 w-px bg-gray-200 hidden sm:block" />

          {/* User */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{user.fullName}</p>
                <p className="text-xs text-gray-400">{user.location || "India"}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-sm">
                <User style={{ width: "1.125rem", height: "1.125rem" }} className="text-white" />
              </div>
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut style={{ width: "1.125rem", height: "1.125rem" }} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors text-sm font-semibold"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
