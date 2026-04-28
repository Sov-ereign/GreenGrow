import React, { useState } from "react";
import { Mic, MessageCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FloatingAIButton: React.FC = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded mini menu */}
      {expanded && (
        <div className="flex flex-col gap-2 items-end animate-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={() => { navigate("/chat"); setExpanded(false); }}
            className="flex items-center gap-2 bg-white text-slate-800 text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            Chat with AI
          </button>
          <button
            onClick={() => { navigate("/voice"); setExpanded(false); }}
            className="flex items-center gap-2 bg-white text-slate-800 text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Mic className="h-4 w-4 text-violet-600" />
            Voice Assistant
          </button>
        </div>
      )}

      {/* Main FAB */}
      <div className="relative">
        {/* Pulsing ring — only when not expanded */}
        {!expanded && (
          <>
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-25" />
            <span className="absolute inset-0 scale-125 rounded-full bg-emerald-400/20" />
          </>
        )}
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Close AI assistant menu" : "Open AI assistant"}
          className={`relative h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 ${
            expanded
              ? "bg-slate-800 hover:bg-slate-700 rotate-45 scale-95"
              : "bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 hover:scale-110"
          }`}
        >
          {expanded ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Mic className="h-6 w-6 text-white" />
          )}
        </button>
      </div>
    </div>
  );
};

export default FloatingAIButton;
