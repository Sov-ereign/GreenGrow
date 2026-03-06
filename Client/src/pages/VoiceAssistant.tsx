import React, { useState, useEffect, useRef } from "react";
import { Bot, User, PhoneOff, Mic, MicOff, Volume2, VolumeX, Loader2, Signal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const VoiceAssistant: React.FC = () => {
  const [isInCall, setIsInCall] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const conversationHistoryRef = useRef<Message[]>([]);

  // Voice activity detection refs
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTranscriptRef = useRef<string>('');
  const isUserSpeakingRef = useRef<boolean>(false);
  const lastSpeechTimeRef = useRef<number>(0);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (err) => {
          console.warn('Geolocation error:', err);
        }
      );
    }
  }, []);

  // Clear silence timeout helper
  const clearSilenceTimeout = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  // Process user message after silence detected
  const processUserMessage = () => {
    const finalMessage = accumulatedTranscriptRef.current.trim();

    if (!finalMessage || isProcessing || isSpeaking) {
      accumulatedTranscriptRef.current = '';
      setCurrentTranscript('');
      return;
    }

    console.log('Processing user message after silence:', finalMessage);
    accumulatedTranscriptRef.current = '';
    setCurrentTranscript('');

    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) { }
      setIsListening(false);
    }

    handleUserMessage(finalMessage);
  };

  // Initialize Web Speech API
  useEffect(() => {
    if (!isInCall || isConnecting) return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        if (isProcessing || isSpeaking || !isListening) return;

        let fullTranscript = '';
        let hasNewFinal = false;

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          fullTranscript += transcript;
          if (i < event.results.length - 1) fullTranscript += ' ';
          if (event.results[i].isFinal && i >= event.resultIndex) hasNewFinal = true;
        }

        setCurrentTranscript(fullTranscript);

        if (hasNewFinal) {
          let finalTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            }
          }
          if (finalTranscript.trim()) {
            accumulatedTranscriptRef.current = finalTranscript.trim();
            lastSpeechTimeRef.current = Date.now();
          }
        }
      };

      recognitionRef.current.onspeechstart = () => {
        if (isProcessing || isSpeaking) return;
        isUserSpeakingRef.current = true;
        lastSpeechTimeRef.current = Date.now();
        clearSilenceTimeout();
      };

      recognitionRef.current.onspeechend = () => {
        if (isProcessing || isSpeaking) return;
        isUserSpeakingRef.current = false;
        lastSpeechTimeRef.current = Date.now();

        if (accumulatedTranscriptRef.current.trim()) {
          clearSilenceTimeout();
          silenceTimeoutRef.current = setTimeout(() => {
            const timeSinceLastSpeech = Date.now() - lastSpeechTimeRef.current;
            if (timeSinceLastSpeech >= 2000 && !isUserSpeakingRef.current && accumulatedTranscriptRef.current.trim()) {
              processUserMessage();
            }
          }, 2000);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'no-speech') return;
        if (event.error === 'aborted') {
          setIsListening(false);
          return;
        }
        if (event.error === 'not-allowed') {
          setIsListening(false);
          setError('Microphone permission denied.');
          return;
        }
        console.warn('Speech recognition error:', event.error);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (isInCall && !isProcessing && !isSpeaking && !isUserSpeakingRef.current) {
          setTimeout(() => {
            if (isInCall && !isProcessing && !isSpeaking && recognitionRef.current && !isListening) {
              try {
                recognitionRef.current.start();
                setIsListening(true);
              } catch (err) { }
            }
          }, 300);
        }
      };

      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) { }
    }

    synthRef.current = window.speechSynthesis;

    return () => {
      clearSilenceTimeout();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (err) { }
      }
    };
  }, [isInCall, isProcessing, isSpeaking, isConnecting]);

  const speak = (text: string, onComplete?: () => void) => {
    if (!synthRef.current || !text || !text.trim()) {
      if (onComplete) onComplete();
      return;
    }

    if (synthRef.current.speaking || synthRef.current.pending) {
      synthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (recognitionRef.current && isListening) {
        try { recognitionRef.current.stop(); } catch (err) { }
        setIsListening(false);
      }
      clearSilenceTimeout();
      accumulatedTranscriptRef.current = '';
      setCurrentTranscript('');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onComplete) onComplete();
      setTimeout(() => {
        if (isInCall && recognitionRef.current && !isProcessing && !isSpeaking && !isListening) {
          try {
            recognitionRef.current.start();
            setIsListening(true);
          } catch (err) { }
        }
      }, 500);
    };

    utterance.onerror = (event: any) => {
      if (event.error !== 'interrupted') setIsSpeaking(false);
      if (event.error !== 'interrupted' && onComplete) onComplete();
    };

    try { synthRef.current.speak(utterance); } catch (err) {
      setIsSpeaking(false);
      if (onComplete) onComplete();
    }
  };

  const handleUserMessage = async (message: string) => {
    if (!message.trim() || isProcessing || isSpeaking) return;

    setIsProcessing(true);
    setError(null);

    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    conversationHistoryRef.current.push(userMessage);

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (userLocation) headers['X-User-Location'] = JSON.stringify(userLocation);

      const res = await fetch(`${API_BASE_URL}/api/chat/live-voice`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          conversationHistory: conversationHistoryRef.current.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          weatherApiKey: import.meta.env.VITE_WEATHER_API_KEY || undefined
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server error: ${res.status}`);

      const aiResponse = data.response || 'I understand.';
      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      conversationHistoryRef.current.push(assistantMessage);

      speak(aiResponse, () => setIsProcessing(false));

    } catch (err: any) {
      const errorMsg = "I'm sorry, I encountered an issue. Could you repeat that?";
      setError(errorMsg);
      speak(errorMsg, () => setIsProcessing(false));
    }
  };

  const startCall = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('Speech recognition not supported in your browser');
      return;
    }

    setIsConnecting(true);
    setMessages([]);
    conversationHistoryRef.current = [];
    setError(null);
    setCurrentTranscript('');
    accumulatedTranscriptRef.current = '';
    isUserSpeakingRef.current = false;
    clearSilenceTimeout();

    // Simulated connection delay for premium feel
    setTimeout(() => {
      setIsConnecting(false);
      setIsInCall(true);
      speak('Hello! I am Arav, your farming assistant. How can I help you today?');
    }, 2500);
  };

  const endCall = () => {
    setIsInCall(false);
    setIsListening(false);
    setIsProcessing(false);
    clearSilenceTimeout();

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (err) { }
    }

    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }

    setCurrentTranscript('');
    accumulatedTranscriptRef.current = '';
    speak('Goodbye! Have a great day!');
  };

  const toggleMute = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const WaveVisualizer = ({ active, color }: { active: boolean, color: string }) => (
    <div className="flex items-center gap-1 h-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          animate={active ? {
            height: [8, 16 + Math.random() * 10, 8],
          } : { height: 4 }}
          transition={{
            repeat: Infinity,
            duration: 0.5 + Math.random() * 0.5,
            ease: "easeInOut"
          }}
          className={`w-1 rounded-full ${color}`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex flex-col gap-8">

        {/* Header with connection status */}
        <div className="flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isInCall ? 'bg-green-100 text-green-700' : isConnecting ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
            }`}>
            <Signal size={16} className={isInCall ? 'animate-pulse' : ''} />
            {isInCall ? 'Secure Connection Active' : isConnecting ? 'Establishing Link...' : 'Voice System Offline'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

          {/* AI Persona Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`relative overflow-hidden group rounded-[2.5rem] bg-white border shadow-2xl transition-all duration-500 ${isSpeaking ? 'border-green-400 ring-4 ring-green-500/10' : 'border-gray-100'
              }`}
          >
            {/* Animated Background Gradient */}
            <div className={`absolute inset-0 opacity-5 transition-opacity duration-1000 ${isSpeaking ? 'bg-gradient-to-br from-green-500 to-emerald-600 opacity-20' : 'bg-transparent'
              }`} />

            <div className="relative p-10 flex flex-col items-center text-center">
              <div className="relative mb-8">
                <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${isSpeaking ? 'bg-green-400 opacity-40 scale-150' : 'bg-gray-200 opacity-0'
                  }`} />
                <div className={`relative w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isSpeaking ? 'bg-green-500 border-green-200 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'bg-gray-100 border-white shadow-xl'
                  }`}>
                  <Bot size={56} className={`transition-colors duration-500 ${isSpeaking ? 'text-white' : 'text-gray-400'}`} />
                  {isSpeaking && <WaveVisualizer active color="bg-white" />}
                </div>
              </div>

              <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Arav</h3>
              <p className="text-gray-500 font-medium uppercase tracking-widest text-xs mb-6 px-4 py-1 bg-gray-50 rounded-full">
                AI Agricultural Specialist
              </p>

              <div className="h-16 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isSpeaking ? (
                    <motion.div
                      key="speaking"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-green-700 font-bold text-lg"
                    >
                      Speaking to you...
                    </motion.div>
                  ) : isProcessing ? (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 text-emerald-600 font-bold"
                    >
                      <Loader2 size={20} className="animate-spin" />
                      Analyzing data...
                    </motion.div>
                  ) : (
                    <div className="text-gray-400 font-medium">System Idle</div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* User Persona Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`relative overflow-hidden group rounded-[2.5rem] bg-white border shadow-2xl transition-all duration-500 ${isListening ? 'border-blue-400 ring-4 ring-blue-500/10' : 'border-gray-100'
              }`}
          >
            <div className={`absolute inset-0 opacity-5 transition-opacity duration-1000 ${isListening ? 'bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20' : 'bg-transparent'
              }`} />

            <div className="relative p-10 flex flex-col items-center text-center">
              <div className="relative mb-8">
                <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${isListening ? 'bg-blue-400 opacity-40 scale-150' : 'bg-gray-200 opacity-0'
                  }`} />
                <div className={`relative w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isListening ? 'bg-blue-500 border-blue-200 shadow-[0_0_50px_rgba(59,130,246,0.3)]' : 'bg-gray-100 border-white shadow-xl'
                  }`}>
                  <User size={56} className={`transition-colors duration-500 ${isListening ? 'text-white' : 'text-gray-400'}`} />
                  {isListening && <WaveVisualizer active color="bg-white" />}
                </div>
              </div>

              <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-2">You</h3>
              <p className="text-gray-500 font-medium uppercase tracking-widest text-xs mb-6 px-4 py-1 bg-gray-50 rounded-full">
                Verified Farmer
              </p>

              <div className="h-16 flex items-center justify-center w-full px-6">
                <AnimatePresence mode="wait">
                  {currentTranscript ? (
                    <motion.p
                      key="transcript"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-gray-700 italic font-medium line-clamp-2"
                    >
                      "{currentTranscript}"
                    </motion.p>
                  ) : (
                    <div className="text-gray-400 font-medium">{isListening ? 'Listening for voice...' : 'Waiting to start'}</div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Global Control Dock */}
        <div className="flex flex-col items-center gap-6 mt-4">
          <AnimatePresence>
            {!isInCall && !isConnecting && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={startCall}
                className="group relative flex items-center gap-4 bg-green-600 hover:bg-green-700 text-white px-10 py-6 rounded-3xl font-black text-2xl shadow-2xl transition-all duration-300 transform active:scale-95"
              >
                <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
                  <Mic size={32} />
                </div>
                <span>Connect with Arav</span>
                <div className="absolute inset-0 rounded-3xl border-2 border-white/30 animate-ping opacity-20 pointer-events-none" />
              </motion.button>
            )}

            {isConnecting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4 bg-white/50 backdrop-blur-xl border border-white/50 px-12 py-8 rounded-[2.5rem] shadow-xl"
              >
                <Loader2 size={64} className="text-blue-600 animate-spin" />
                <div className="text-center">
                  <p className="text-xl font-black text-gray-900">Establishing Agricultural Link</p>
                  <p className="text-gray-500 text-sm">Synchronizing with central climate nodes...</p>
                </div>
              </motion.div>
            )}

            {isInCall && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-6 bg-gray-900 border border-white/10 p-5 rounded-full shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
              >
                <button
                  onClick={toggleMute}
                  className={`p-5 rounded-full transition-all duration-300 ${isSpeaking ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-yellow-500 text-white shadow-[0_0_20px_rgba(234,179,8,0.4)]'
                    }`}
                  title={isSpeaking ? 'Force Mute AI' : 'AI Speech Ready'}
                >
                  {isSpeaking ? <Volume2 size={28} /> : <VolumeX size={28} />}
                </button>

                <div className="w-px h-8 bg-white/20" />

                <button
                  onClick={endCall}
                  className="p-5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)] transform hover:scale-110 active:scale-90"
                  title="Disconnect"
                >
                  <PhoneOff size={28} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3 shadow-lg"
            >
              <AlertTriangle size={18} />
              {error}
            </motion.div>
          )}
        </div>

        {/* Floating Conversation Thread View */}
        {messages.length > 0 && isInCall && (
          <div className="mt-8 grid grid-cols-1 gap-4 max-w-3xl mx-auto w-full">
            <h4 className="text-xs uppercase tracking-widest font-black text-gray-400 text-center mb-2">Live Session Transcript</h4>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-4 scroll-smooth custom-scrollbar">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border text-gray-800 rounded-tl-none'
                    }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;