import React, { useCallback, useEffect, useState } from "react";
import AgriSmartAssistant from "../components/ChatInterface";
import { apiUrl } from "@/lib/env";

const Chat: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [openMenuSessionId, setOpenMenuSessionId] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const response = await fetch(apiUrl("/api/chat/sessions"), {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to load sessions");
      }
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Failed to load chat sessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest("[data-chat-menu-root='true']")) {
        setOpenMenuSessionId(null);
      }
    };

    document.addEventListener("click", onDocumentClick);
    return () => {
      document.removeEventListener("click", onDocumentClick);
    };
  }, []);

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setOpenMenuSessionId(null);
  };

  const formatSessionTime = (value: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const handleSessionChange = useCallback((sessionId: string | null) => {
    setActiveSessionId((prev) => (prev === sessionId ? prev : sessionId));
    loadSessions();
  }, [loadSessions]);

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
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ title: nextTitle }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to rename chat");
        }
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
      const ok = window.confirm("Delete this chat?");
      if (!ok) {
        setOpenMenuSessionId(null);
        return;
      }

      try {
        const response = await fetch(apiUrl(`/api/chat/sessions/${sessionId}`), {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to delete chat");
        }

        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (activeSessionId === sessionId) {
          setActiveSessionId(null);
        }
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
      {/* Left sidebar */}
      <aside className="hidden md:flex md:flex-col w-72 bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-green-100">
          <button
            onClick={handleNewChat}
            className="w-full py-2 px-3 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
          >
            New chat
          </button>
        </div>
        <div className="px-4 py-3 border-b border-green-100">
          <p className="text-xs text-green-700 font-semibold uppercase tracking-wide">
            Your chats
          </p>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {loadingSessions ? (
            <div className="p-4 text-sm text-gray-500">Loading chats...</div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No chats yet.</div>
          ) : (
            <ul className="py-2">
              {sessions.map((session) => (
                <li key={session.id} className="group relative" data-chat-menu-root="true">
                  <button
                    onClick={() => {
                      setOpenMenuSessionId(null);
                      handleSelectSession(session.id);
                    }}
                    className={`w-full text-left px-4 py-3 pr-12 transition-colors ${
                      activeSessionId === session.id
                        ? "bg-green-100"
                        : "hover:bg-green-50"
                    }`}
                  >
                    <div className={`text-sm font-medium truncate transition-colors ${
                      activeSessionId === session.id ? "text-green-800" : "text-gray-800 group-hover:text-green-800"
                    }`}>
                      {session.title || "New chat"}
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className={`text-xs truncate transition-colors ${
                        activeSessionId === session.id ? "text-green-700" : "text-gray-500 group-hover:text-green-700"
                      }`}>
                        {session.lastMessage || "No messages yet"}
                      </span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatSessionTime(session.lastMessageAt)}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuSessionId((prev) =>
                        prev === session.id ? null : session.id
                      );
                    }}
                    className={`absolute right-2 top-3 h-7 w-7 rounded-md text-sm font-bold transition ${
                      openMenuSessionId === session.id
                        ? "bg-green-100 text-green-700"
                        : "opacity-0 group-hover:opacity-100 text-gray-500 hover:bg-green-100 hover:text-green-700"
                    }`}
                    title="Options"
                  >
                    ...
                  </button>

                  {openMenuSessionId === session.id && (
                    <div className="absolute right-2 top-11 z-20 w-28 rounded-md border border-green-100 bg-white shadow-md overflow-hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameSession(session);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-green-50 transition-colors"
                      >
                        Rename
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 min-h-0">
        <AgriSmartAssistant
          initialSessionId={activeSessionId}
          onSessionChange={handleSessionChange}
        />
      </div>
    </div>
  );
};

export default Chat;
