import React, { useState, useEffect, useRef } from "react";
import { Bot, User, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const VoiceAssistant: React.FC = () => {
  const [isInCall, setIsInCall] = useState(false);
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
      // Clear accumulated transcript if we're not processing
      accumulatedTranscriptRef.current = '';
      setCurrentTranscript('');
      return;
    }

    console.log('Processing user message after silence:', finalMessage);
    
    // Clear the accumulated transcript
    accumulatedTranscriptRef.current = '';
    setCurrentTranscript('');
    
    // Stop listening before processing
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignore
      }
      setIsListening(false);
    }

    // Process the message
    handleUserMessage(finalMessage);
  };

  // Initialize Web Speech API
  useEffect(() => {
    if (!isInCall) {
      return;
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      // Track all results (interim + final)
      recognitionRef.current.onresult = (event: any) => {
        // Only process if we're listening and AI is not busy
        if (isProcessing || isSpeaking) {
          return;
        }

        if (!isListening) {
          return;
        }

        // Build transcript from all results
        let fullTranscript = '';
        let hasNewFinal = false;

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          fullTranscript += transcript;
          if (i < event.results.length - 1) {
            fullTranscript += ' ';
          }
          
          // Check if we have a new final result
          if (event.results[i].isFinal && i >= event.resultIndex) {
            hasNewFinal = true;
          }
        }

        // Update current transcript display
        setCurrentTranscript(fullTranscript);
        
        // Accumulate final results
        if (hasNewFinal) {
          // Rebuild transcript from all final results
          let finalTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
              if (i < event.results.length - 1) {
                finalTranscript += ' ';
              }
            }
          }
          
          if (finalTranscript.trim()) {
            accumulatedTranscriptRef.current = finalTranscript.trim();
            lastSpeechTimeRef.current = Date.now();
          }
        }
      };

      // User started speaking
      recognitionRef.current.onspeechstart = () => {
        if (isProcessing || isSpeaking) {
          return;
        }

        console.log('User started speaking (voice detected)');
        isUserSpeakingRef.current = true;
        lastSpeechTimeRef.current = Date.now();
        
        // Clear any existing silence timeout - voice got loud again
        clearSilenceTimeout();
      };

      // User stopped speaking (voice got quieter)
      recognitionRef.current.onspeechend = () => {
        if (isProcessing || isSpeaking) {
          return;
        }

        console.log('User stopped speaking (voice got quieter)');
        isUserSpeakingRef.current = false;
        const speechEndTime = Date.now();
        lastSpeechTimeRef.current = speechEndTime;
        
        // Wait to see if voice gets loud again
        // If we have accumulated transcript, start the silence timer
        if (accumulatedTranscriptRef.current.trim()) {
          clearSilenceTimeout();
          
          // Start silence detection timer
          silenceTimeoutRef.current = setTimeout(() => {
            // Check if voice got loud again during the wait
            // If speech started again, isUserSpeakingRef would be true and we'd have newer lastSpeechTime
            const timeSinceLastSpeech = Date.now() - lastSpeechTimeRef.current;
            const silenceDuration = 2000; // 2 seconds

            // Only process if:
            // 1. We've been silent for at least 2 seconds
            // 2. User is not currently speaking
            // 3. We have a valid message
            if (timeSinceLastSpeech >= silenceDuration && !isUserSpeakingRef.current && accumulatedTranscriptRef.current.trim()) {
              console.log('Silence confirmed, processing message');
              processUserMessage();
            } else if (isUserSpeakingRef.current) {
              // Voice got loud again during wait - timeout will be cleared by onspeechstart
              console.log('Voice resumed during silence wait - will wait more');
            } else if (!accumulatedTranscriptRef.current.trim()) {
              // No transcript to process
              console.log('No transcript to process');
            }
          }, 2000); // Wait 2 seconds after speech ends to check if it resumes
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          return;
        }
        
        if (event.error === 'aborted') {
          setIsListening(false);
          return;
        }
        
        if (event.error === 'not-allowed') {
          setIsListening(false);
          setError('Microphone permission denied. Please allow microphone access.');
          return;
        }
        
        if (event.error === 'network') {
          setIsListening(false);
          
          // Retry after delay if still in call
          if (isInCall && !isProcessing && !isSpeaking) {
            setTimeout(() => {
              if (isInCall && !isProcessing && !isSpeaking && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                  setIsListening(true);
                } catch (err) {
                  console.warn('Failed to restart after network error:', err);
                }
              }
            }, 1000);
          }
          return;
        }
        
        console.warn('Speech recognition error:', event.error);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        
        // Only restart if AI is idle and we're still in call
        if (isInCall && !isProcessing && !isSpeaking && !isUserSpeakingRef.current) {
          setTimeout(() => {
            if (isInCall && !isProcessing && !isSpeaking && recognitionRef.current && !isListening) {
              try {
                recognitionRef.current.start();
                setIsListening(true);
              } catch (err: any) {
                if (err.message && err.message.includes('already started')) {
                  setIsListening(true);
                }
              }
            }
          }, 300);
        }
      };

      // Start recognition if in call
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        if (err.message && !err.message.includes('already started')) {
          console.error('Failed to start recognition:', err);
        }
      }
    }

    synthRef.current = window.speechSynthesis;

    return () => {
      clearSilenceTimeout();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore
        }
      }
    };
  }, [isInCall, isProcessing, isSpeaking]);

  // Speak function - simplified, no interruptions
  const speak = (text: string, onComplete?: () => void) => {
    if (!synthRef.current || !text || !text.trim()) {
      if (onComplete) onComplete();
      return;
    }
    
    // Cancel any existing speech
    if (synthRef.current.speaking || synthRef.current.pending) {
      synthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => {
      console.log('AI started speaking');
      setIsSpeaking(true);
      
      // Stop listening when AI starts speaking
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore
        }
        setIsListening(false);
      }
      
      // Clear any silence timeout
      clearSilenceTimeout();
      accumulatedTranscriptRef.current = '';
      setCurrentTranscript('');
    };
    
    utterance.onend = () => {
      console.log('AI finished speaking');
      setIsSpeaking(false);
      
      if (onComplete) {
        onComplete();
      }
      
      // Resume listening after AI finishes (wait a moment)
      setTimeout(() => {
        if (isInCall && recognitionRef.current && !isProcessing && !isSpeaking && !isListening) {
          try {
            recognitionRef.current.start();
            setIsListening(true);
            console.log('Listening resumed after AI finished');
          } catch (err: any) {
            if (err.message && err.message.includes('already started')) {
              setIsListening(true);
            } else {
              console.warn('Failed to resume listening:', err);
            }
          }
        }
      }, 500);
    };
    
    utterance.onerror = (event: any) => {
      if (event.error !== 'interrupted') {
        console.error('Speech synthesis error:', event.error);
      }
      
      setIsSpeaking(false);
      
      if (event.error !== 'interrupted' && onComplete) {
        onComplete();
      }
      
      // Resume listening even on error
      if (event.error !== 'interrupted' && isInCall && recognitionRef.current && !isProcessing) {
        setTimeout(() => {
          if (isInCall && !isProcessing && !isSpeaking && recognitionRef.current && !isListening) {
            try {
              recognitionRef.current.start();
              setIsListening(true);
            } catch (err: any) {
              if (err.message && !err.message.includes('already started')) {
                console.warn('Failed to resume listening after error:', err);
              } else {
                setIsListening(true);
              }
            }
          }
        }, 500);
      }
    };
    
    try {
      synthRef.current.speak(utterance);
    } catch (err) {
      console.error('Failed to speak:', err);
      setIsSpeaking(false);
      if (onComplete) onComplete();
    }
  };

  const handleUserMessage = async (message: string) => {
    if (!message.trim() || isProcessing || isSpeaking) {
      return;
    }

    console.log('Processing user message:', message);
    setIsProcessing(true);
    setError(null);
    
    // Add user message to conversation
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    conversationHistoryRef.current.push(userMessage);

    try {
      // Prepare headers with location
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (userLocation) {
        headers['X-User-Location'] = JSON.stringify(userLocation);
      }

      const weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY;
      
      const res = await fetch(`${API_BASE_URL}/api/chat/live-voice`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          conversationHistory: conversationHistoryRef.current.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          weatherApiKey: weatherApiKey || undefined
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      const aiResponse = data.response || 'I understand.';
      
      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      conversationHistoryRef.current.push(assistantMessage);

      // Speak the response
      speak(aiResponse, () => {
        setIsProcessing(false);
        console.log('Processing complete');
      });

    } catch (err: any) {
      console.error('Error processing message:', err);
      const errorMsg = "I'm sorry, I encountered an issue. Could you repeat that?";
      setError(errorMsg);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: errorMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      speak(errorMsg, () => {
        setIsProcessing(false);
      });
    }
  };

  const startCall = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('Speech recognition not supported in your browser');
      return;
    }

    setIsInCall(true);
    setMessages([]);
    conversationHistoryRef.current = [];
    setError(null);
    setCurrentTranscript('');
    accumulatedTranscriptRef.current = '';
    isUserSpeakingRef.current = false;
    clearSilenceTimeout();

    // Speak greeting after a moment
    setTimeout(() => {
      speak('Hello! I am Arav, your farming assistant. How can I help you today?', () => {
        console.log('Greeting finished');
      });
    }, 500);
  };

  const endCall = () => {
    setIsInCall(false);
    setIsListening(false);
    setIsProcessing(false);
    clearSilenceTimeout();
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignore
      }
    }
    
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }

    setCurrentTranscript('');
    accumulatedTranscriptRef.current = '';
    
    // Say goodbye
    speak('Goodbye! Have a great day!');
    
    // Clear conversation after a delay
    setTimeout(() => {
      setMessages([]);
      conversationHistoryRef.current = [];
    }, 2000);
  };

  const toggleMute = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="w-full max-w-4xl flex flex-col gap-4 md:gap-8">
        {/* Header */}
        <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 tracking-tight">
          Voice Assistant Call
        </h2>

        {/* Two Large Dialogue Boxes */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* AI Agent */}
          <div className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8 flex flex-col items-center border border-green-100">
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-md transition-all relative ${
              isSpeaking 
                ? 'bg-green-200 scale-110 ring-4 ring-green-300 ring-opacity-50 animate-pulse' 
                : isProcessing
                ? 'bg-yellow-100 scale-105'
                : 'bg-green-100'
            }`}>
              <Bot size={32} className="md:h-10 md:w-10 h-8 w-8 text-green-600" />
              {/* Speaking animation - sound waves */}
              {isSpeaking && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-12 h-12 md:w-16 md:h-16 border-2 border-green-400 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute w-10 h-10 md:w-12 md:h-12 border-2 border-green-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
            <h3 className="mt-3 md:mt-4 text-lg md:text-xl font-semibold text-gray-800">
              Arav (AI Assistant)
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">
              {isSpeaking ? 'Speaking...' : isProcessing ? 'Thinking...' : isInCall ? 'Ready' : 'Waiting'}
            </p>
            
            {/* Display last assistant message */}
            {messages.filter(m => m.role === 'assistant').length > 0 && (
              <p className="text-xs md:text-sm text-gray-600 mt-3 md:mt-4 text-center italic px-2 break-words">
                "{messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content}"
              </p>
            )}
          </div>

          {/* User */}
          <div className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8 flex flex-col items-center border border-gray-100">
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-md transition-all relative ${
              isListening && !isProcessing && !isSpeaking
                ? 'bg-green-200 scale-110 ring-4 ring-green-300 ring-opacity-50 animate-pulse' 
                : isProcessing || isSpeaking
                ? 'bg-gray-100 opacity-50'
                : 'bg-gray-100'
            }`}>
              <User size={32} className="md:h-10 md:w-10 h-8 w-8 text-gray-600" />
              {/* Listening animation - microphone waves */}
              {isListening && !isProcessing && !isSpeaking && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-12 h-12 md:w-16 md:h-16 border-2 border-green-400 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute w-10 h-10 md:w-12 md:h-12 border-2 border-green-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
            <h3 className="mt-3 md:mt-4 text-lg md:text-xl font-semibold text-gray-800">You</h3>
            <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">
              {isProcessing || isSpeaking 
                ? 'AI is responding, please wait...' 
                : isListening 
                ? 'Listening...' 
                : isInCall 
                ? 'Ready to speak' 
                : 'Waiting'}
            </p>

            {/* Display current transcript or last user message */}
            {currentTranscript ? (
              <p className="text-xs md:text-sm text-gray-600 mt-3 md:mt-4 text-center italic px-2 break-words">
                "{currentTranscript}"
              </p>
            ) : messages.filter(m => m.role === 'user').length > 0 && (
              <p className="text-xs md:text-sm text-gray-600 mt-3 md:mt-4 text-center italic px-2 break-words">
                "{messages.filter(m => m.role === 'user').slice(-1)[0]?.content}"
              </p>
            )}
          </div>
        </div>

        {/* Conversation History */}
        {messages.length > 0 && (
          <div className="bg-white/60 backdrop-blur-md rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 max-h-48 md:max-h-64 overflow-y-auto">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Conversation</h3>
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-gray-100' : 'bg-green-100'
                  }`}>
                    {msg.role === 'user' ? (
                      <User size={16} className="text-gray-600" />
                    ) : (
                      <Bot size={16} className="text-green-600" />
                    )}
                  </div>
                  <div className={`flex-1 rounded-lg p-3 ${
                    msg.role === 'user' 
                      ? 'bg-blue-50 text-blue-900' 
                      : 'bg-green-50 text-green-900'
                  }`}>
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

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Call Controls */}
        <div className="flex justify-center gap-4 md:gap-8 mt-4">
          {!isInCall ? (
            <button
              onClick={startCall}
              className="p-4 md:p-5 rounded-full bg-green-500 hover:bg-green-600 transition shadow-lg text-white"
              title="Start Call"
            >
              <Mic size={24} className="md:w-7 md:h-7" />
            </button>
          ) : (
            <>
              <button
                onClick={toggleMute}
                className={`p-4 md:p-5 rounded-full transition shadow-md ${
                  isSpeaking
                    ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-600'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title={isSpeaking ? 'Mute AI' : 'AI Muted'}
              >
                {isSpeaking ? <Volume2 size={24} className="md:w-7 md:h-7" /> : <VolumeX size={24} className="md:w-7 md:h-7" />}
              </button>
              <button
                onClick={endCall}
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
};

export default VoiceAssistant;