import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import AgriSmartAssistant from "../components/ChatInterface";
import { apiUrl } from "@/lib/env";
import {
  MessageSquare,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Leaf,
  Clock,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatRelativeTime(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ---------------------------------------------------------------------------
// Sub-components (defined before Chat so they're available)
// ---------------------------------------------------------------------------
const SessionSkeleton: React.FC = () => (
  <div className="px-3 py-2 space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse flex items-center gap-3 px-3 py-3 rounded-xl">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-white/10 rounded-full w-3/4" />
          <div className="h-2.5 bg-white/10 rounded-full w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

interface SessionItemProps {
  session: any;
  isActive: boolean;
  openMenuId: string | null;
  onSelect: (session: any) => void;
  onMenuToggle: (id: string) => void;
  onRename: (session: any) => void;
  onDelete: (id: string) => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  openMenuId,
  onSelect,
  onMenuToggle,
  onRename,
  onDelete,
}) => {
  const isMenuOpen = openMenuId === session.id;

  return (
    <li className="group relative" data-chat-menu-root="true">
      <button
        onClick={() => onSelect(session)}
        className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-150 flex items-start gap-3 pr-10 ${
          isActive
            ? "bg-green-500/20 border border-green-500/30"
            : "hover:bg-white/8 border border-transparent"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
            isActive
              ? "bg-green-500 text-white"
              : "bg-white/10 text-gray-400 group-hover:bg-white/15 group-hover:text-gray-300"
          }`}
        >
          <MessageSquare size={14} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium truncate leading-tight ${
              isActive ? "text-white" : "text-gray-300 group-hover:text-white"
            }`}
          >
            {session.title || "New chat"}
          </p>
          <div className="flex items-center justify-between gap-1 mt-1">
            <p className="text-xs text-gray-500 truncate flex-1 group-hover:text-gray-400">
              {session.lastMessage || "No messages yet"}
            </p>
            <span className="text-[10px] text-gray-600 whitespace-nowrap flex items-center gap-0.5 flex-shrink-0">
              <Clock size={9} />
              {formatRelativeTime(session.lastMessageAt)}
            </span>
          </div>
        </div>
      </button>

      {/* Kebab button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onMenuToggle(session.id);
        }}
        className={`absolute right-2 top-3 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
          isMenuOpen
            ? "opacity-100 bg-white/15 text-white"
            : "opacity-0 group-hover:opacity-100 text-gray-500 hover:bg-white/15 hover:text-white"
        }`}
        title="Options"
      >
        <MoreHorizontal size={14} />
      </button>

      {/* Context menu */}
      {isMenuOpen && (
        <div className="absolute right-2 top-11 z-30 w-36 rounded-xl border border-white/10 bg-gray-800 shadow-2xl overflow-hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRename(session);
            }}
            className="w-full px-3 py-2.5 text-left text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
          >
            <Pencil size={12} />
            Rename
          </button>
          <div className="border-t border-white/10" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(session.id);
            }}
            className="w-full px-3 py-2.5 text-left text-xs text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-colors flex items-center gap-2"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      )}
    </li>
  );
};

// ---------------------------------------------------------------------------
// Main Chat page
// ---------------------------------------------------------------------------
const Chat: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { sessionKey } = useParams();

  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessionKey || null);
  const [initialPlantId, setInitialPlantId] = useState<string | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [openMenuSessionId, setOpenMenuSessionId] = useState<string | null>(null);

  const buildChatUrl = useCallback(
    (sessionId: string | null) => {
      const suffix = initialPlantId ? `?plantId=${initialPlantId}` : "";
      return sessionId ? `/chat/${sessionId}${suffix}` : `/chat${suffix}`;
    },
    [initialPlantId]
  );

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const response = await fetch(apiUrl("/api/chat/sessions"), {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error((await response.text()) || "Failed to load sessions");
      }
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Failed to load chat sessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  // On mount: read plantId param and load sessions
  useEffect(() => {
    const plantIdParam = searchParams.get("plantId");
    if (plantIdParam) setInitialPlantId(plantIdParam);
    loadSessions();
  }, [loadSessions, searchParams]);

  // Sync active session with route param
  useEffect(() => {
    setActiveSessionId(sessionKey ?? null);
  }, [sessionKey]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-chat-menu-root='true']")) {
        setOpenMenuSessionId(null);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const handleSelectSession = (session: any) => {
    setActiveSessionId(session.id);
    navigate(buildChatUrl(session.id));
    setOpenMenuSessionId(null);
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    navigate(buildChatUrl(null));
    setOpenMenuSessionId(null);
  };

  const handleSessionChange = useCallback(
    (sessionId: string | null) => {
      setActiveSessionId((prev) => (prev === sessionId ? prev : sessionId));
      navigate(buildChatUrl(sessionId));
      loadSessions();
    },
    [buildChatUrl, loadSessions, navigate]
  );

  const handleRenameSession = useCallback(
    async (session: any) => {
      const currentTitle = session?.title || "";
      const nextTitle = window.prompt("Rename chat", currentTitle)?.trim();
      if (!nextTitle || nextTitle === currentTitle) {
        setOpenMenuSessionId(null);
        return;
      }
      try {
        const response = await fetch(apiUrl(`/api/chat/sessions/${session.id}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title: nextTitle }),
        });
        if (!response.ok) throw new Error((await response.text()) || "Failed to rename chat");
        await loadSessions();
      } catch (error) {
        console.error("Failed to rename session:", error);
      } finally {
        setOpenMenuSessionId(null);
      }
    },
    [loadSessions]
  );

  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      if (!window.confirm("Delete this chat?")) {
        setOpenMenuSessionId(null);
        return;
      }
      try {
        const response = await fetch(apiUrl(`/api/chat/sessions/${sessionId}`), {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) throw new Error((await response.text()) || "Failed to delete chat");
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (activeSessionId === sessionId) setActiveSessionId(null);
      } catch (error) {
        console.error("Failed to delete session:", error);
      } finally {
        setOpenMenuSessionId(null);
      }
    },
    [activeSessionId]
  );

  return (
    <div className="h-full min-h-0 w-full flex gap-4">
      {/* ---------------------------------------------------------------- */}
      {/* Sidebar                                                           */}
      {/* ---------------------------------------------------------------- */}
      <aside
        className="hidden md:flex md:flex-col w-72 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "linear-gradient(180deg, #111827 0%, #0f1d13 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Header */}
        <div className="px-4 pt-5 pb-4 border-b border-white/8">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
              <Leaf size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">KrishiBot</p>
              <p className="text-[10px] text-gray-500 leading-tight">Agriculture AI</p>
            </div>
          </div>

          <button
            onClick={handleNewChat}
            className="w-full py-2.5 px-3 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-px active:translate-y-0"
          >
            <Plus size={16} />
            New conversation
          </button>
        </div>

        {/* Section label */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            Recent chats
          </p>
          {sessions.length > 0 && (
            <span className="text-[10px] font-bold bg-white/8 text-gray-500 rounded-full px-2 py-0.5">
              {sessions.length}
            </span>
          )}
        </div>

        {/* Session list */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-4">
          {loadingSessions ? (
            <SessionSkeleton />
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                <MessageSquare size={20} className="text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-700 mt-1">Start a new chat to get farming advice</p>
            </div>
          ) : (
            <ul className="space-y-1 pt-1">
              {sessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={activeSessionId === session.id}
                  openMenuId={openMenuSessionId}
                  onSelect={handleSelectSession}
                  onMenuToggle={(id) =>
                    setOpenMenuSessionId((prev) => (prev === id ? null : id))
                  }
                  onRename={handleRenameSession}
                  onDelete={handleDeleteSession}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/8 px-4 py-3">
          <p className="text-[10px] text-gray-700 text-center font-medium">
            Powered by GreenGrow AI · KrishiBot v2
          </p>
        </div>
      </aside>

      {/* ---------------------------------------------------------------- */}
      {/* Chat area                                                         */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex-1 min-h-0">
        <AgriSmartAssistant
          initialSessionId={activeSessionId}
          initialPlantId={initialPlantId}
          onSessionChange={handleSessionChange}
          initialAutoUpload={searchParams.get("upload") === "true"}
        />
      </div>
    </div>
  );
};

export default Chat;
