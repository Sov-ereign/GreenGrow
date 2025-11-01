import { vapi } from "../../lib/vapi";
import { useEffect, useRef, useState } from "react";
import { Bot, User, Mic, Volume2, VolumeX, PhoneOff } from "lucide-react";

function VapiWidget() {
  const ASSISTANT_KEY = import.meta.env.VITE_VAPI_API_KEY;
  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [callEnded, setCallEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);

  const messageContainerRef = useRef<HTMLDivElement>(null);

  // auto-scroll messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // event listeners setup
  useEffect(() => {
    const handleCallStart = () => {
      setConnecting(false);
      setCallActive(true);
      setCallEnded(false);
      setError(null);
    };

    const handleCallEnd = () => {
      setCallActive(false);
      setConnecting(false);
      setIsSpeaking(false);
      setCallEnded(true);
    };

    const handleSpeechStart = () => setIsSpeaking(true);
    const handleSpeechEnd = () => setIsSpeaking(false);

    const handleMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = {
          content: message.transcript,
          role: message.role,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const handleError = (error: any) => {
      console.log("Vapi Error", error);
      setConnecting(false);
      setCallActive(false);
      setError("Something went wrong. Please try again.");
    };

    vapi
      .on("call-start", handleCallStart)
      .on("call-end", handleCallEnd)
      .on("speech-start", handleSpeechStart)
      .on("speech-end", handleSpeechEnd)
      .on("message", handleMessage)
      .on("error", handleError);

    return () => {
      vapi
        .off("call-start", handleCallStart)
        .off("call-end", handleCallEnd)
        .off("speech-start", handleSpeechStart)
        .off("speech-end", handleSpeechEnd)
        .off("message", handleMessage)
        .off("error", handleError);
    };
  }, []);

  const toggleCall = async () => {
    if (callActive) {
      vapi.stop();
    } else {
      try {
        setConnecting(true);
        setMessages([]);
        setCallEnded(false);
        await vapi.start("4befcadb-e2a8-46e4-be47-35a8c646d12d");
      } catch (error) {
        console.log("Failed to start call", error);
        setConnecting(false);
      }
    }
  };

  const toggleMute = () => {
    setMuted((prev) => !prev);
    // here you can call vapi mute/unmute methods if available
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="w-full max-w-4xl flex flex-col gap-4 md:gap-8">
        {/* Header */}
        <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 tracking-tight">
          Voice Assistant Call
        </h2>

        {/* AI + User Section */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* AI Agent */}
          <div className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8 flex flex-col items-center border border-green-100">
            <div
              className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-md transition-all relative ${
                isSpeaking
                  ? "bg-green-200 scale-110 ring-4 ring-green-300 animate-pulse"
                  : "bg-green-100"
              }`}
            >
              <Bot className="md:h-10 md:w-10 h-8 w-8 text-green-600" />
              {isSpeaking && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-12 h-12 md:w-16 md:h-16 border-2 border-green-400 rounded-full animate-ping opacity-75"></div>
                  <div
                    className="absolute w-10 h-10 md:w-12 md:h-12 border-2 border-green-400 rounded-full animate-ping opacity-50"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              )}
            </div>
            <h3 className="mt-3 md:mt-4 text-lg md:text-xl font-semibold text-gray-800">
              Aarav (AI Assistant)
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              {isSpeaking
                ? "Speaking..."
                : callActive
                ? "Listening..."
                : callEnded
                ? "Call Ended"
                : "Waiting..."}
            </p>

            {messages.filter((m) => m.role === "assistant").length > 0 && (
              <p className="text-xs md:text-sm text-gray-600 mt-3 text-center italic px-2 break-words">
                “
                {
                  messages.filter((m) => m.role === "assistant").slice(-1)[0]
                    ?.content
                }
                ”
              </p>
            )}
          </div>

          {/* User */}
          <div className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8 flex flex-col items-center border border-gray-100">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-md bg-gray-100">
              <User className="md:h-10 md:w-10 h-8 w-8 text-gray-600" />
            </div>
            <h3 className="mt-3 md:mt-4 text-lg md:text-xl font-semibold text-gray-800">
              You
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              {callActive
                ? "Speaking..."
                : callEnded
                ? "Disconnected"
                : "Ready"}
            </p>

            {messages.filter((m) => m.role === "user").length > 0 && (
              <p className="text-xs md:text-sm text-gray-600 mt-3 text-center italic px-2 break-words">
                “
                {
                  messages.filter((m) => m.role === "user").slice(-1)[0]
                    ?.content
                }
                ”
              </p>
            )}
          </div>
        </div>

        {/* Conversation */}
        {messages.length > 0 && (
          <div
            ref={messageContainerRef}
            className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg p-4 md:p-6 max-h-64 overflow-y-auto"
          >
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3">
              Conversation
            </h3>
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.role === "user" ? "bg-gray-100" : "bg-green-100"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User size={16} className="text-gray-600" />
                    ) : (
                      <Bot size={16} className="text-green-600" />
                    )}
                  </div>
                  <div
                    className={`flex-1 rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-blue-50 text-blue-900"
                        : "bg-green-50 text-green-900"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-60">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-4 md:gap-8 mt-4">
          {!callActive ? (
            <button
              onClick={toggleCall}
              disabled={connecting}
              className="p-4 md:p-5 rounded-full bg-green-500 hover:bg-green-600 transition shadow-lg text-white"
              title="Start Call"
            >
              {connecting ? (
                <span className="animate-pulse">...</span>
              ) : (
                <Mic size={24} className="md:w-7 md:h-7" />
              )}
            </button>
          ) : (
            <>
              <button
                onClick={toggleMute}
                className={`p-4 md:p-5 rounded-full transition shadow-md ${
                  muted
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    : "bg-yellow-100 hover:bg-yellow-200 text-yellow-600"
                }`}
                title={muted ? "Unmute" : "Mute"}
              >
                {muted ? (
                  <VolumeX size={24} className="md:w-7 md:h-7" />
                ) : (
                  <Volume2 size={24} className="md:w-7 md:h-7" />
                )}
              </button>
              <button
                onClick={toggleCall}
                className="p-4 md:p-5 rounded-full bg-red-500 hover:bg-red-600 transition shadow-lg text-white"
                title="End Call"
              >
                <PhoneOff size={24} className="md:w-7 md:h-7" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VapiWidget;
