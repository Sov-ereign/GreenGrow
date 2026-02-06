import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface VoiceCommand {
  action: string;
  target?: string;
  query?: string;
  data?: any;
}

interface VoiceAssistantProps {
  onNavigate?: (path: string) => void;
  onAction?: (action: string, data?: any) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onNavigate, onAction }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Keep listening
      recognitionRef.current.interimResults = true; // Get interim results to detect speech start
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        // Stop speaking when user starts talking
        if (synthRef.current && synthRef.current.speaking) {
          synthRef.current.cancel();
        }

        // Process all results to get the full transcript
        let fullTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
          if (i < event.results.length - 1) {
            fullTranscript += ' ';
          }
        }

        setTranscript(fullTranscript);

        // Check if we have any final results
        let hasFinalResult = false;
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            hasFinalResult = true;
            // Collect all final results
            for (let j = 0; j <= i; j++) {
              if (event.results[j].isFinal) {
                finalTranscript += event.results[j][0].transcript;
                if (j < i) finalTranscript += ' ';
              }
            }
            break;
          }
        }

        // If we have a final result, process it and stop
        if (hasFinalResult && finalTranscript.trim()) {
          recognitionRef.current.stop(); // Stop listening after final result
          handleVoiceCommand(finalTranscript.trim());
        }
      };

      // Detect when user starts speaking
      recognitionRef.current.onspeechstart = () => {
        // Cancel any ongoing speech when user starts talking
        if (synthRef.current && synthRef.current.speaking) {
          synthRef.current.cancel();
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);

        // Don't show error for 'no-speech' if we're just waiting
        if (event.error !== 'no-speech') {
          setError(`Speech recognition error: ${event.error}`);
        }

        // Only stop if it's a critical error
        if (event.error === 'aborted' || event.error === 'not-allowed') {
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('Speech recognition not supported in this browser');
    }

    // Initialize Speech Synthesis
    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [onNavigate, onAction]);

  const speak = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Stop speaking if user starts talking
      utterance.onstart = () => {
        // This will be handled by onspeechstart
      };

      synthRef.current.speak(utterance);
    }
  };

  const handleVoiceCommand = async (command: string) => {
    if (!command.trim()) return;

    setIsProcessing(true);
    setError(null);
    setResponse('');

    let data: any = null;
    try {
      // Send command to Groq API for interpretation
      const res = await fetch(`${API_BASE_URL}/api/chat/voice-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });

      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error(`Server error: ${res.status} - Failed to parse response`);
      }

      if (!res.ok) {
        // Server returned an error, but we might have a response message
        const errorMsg = data?.response || data?.error || `Server error: ${res.status}`;
        setError(errorMsg);
        speak(errorMsg);
        // Still try to execute command if provided
        if (data?.command) {
          executeCommand(data.command);
        }
        return;
      }

      const voiceCommand: VoiceCommand = data.command || {};
      const aiResponse = data.response || 'I understood your command.';

      setResponse(aiResponse);
      speak(aiResponse);

      // Execute the command
      if (voiceCommand.action) {
        executeCommand(voiceCommand);
      }

    } catch (err: any) {
      console.error('Voice command error:', err);
      const errorMsg = data?.response || `Sorry, I couldn't process that command. ${err.message || ''}`;
      setError(errorMsg);
      speak(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeCommand = (command: VoiceCommand) => {
    // Note: We don't speak here because the AI response already includes speech
    switch (command.action) {
      case 'navigate':
        if (command.target && onNavigate) {
          onNavigate(command.target);
        }
        break;

      case 'search':
        if (command.query && onAction) {
          onAction('search', { query: command.query });
        }
        break;

      case 'weather':
        if (onNavigate) {
          onNavigate('/weather');
        }
        break;

      case 'market':
        if (onNavigate) {
          onNavigate('/market');
        }
        break;

      case 'crops':
        if (onNavigate) {
          onNavigate('/crops');
        }
        break;

      case 'chat':
        if (onNavigate) {
          onNavigate('/chat');
        }
        break;

      case 'home':
        if (onNavigate) {
          onNavigate('/');
        }
        break;

      case 'help':
        if (onAction) {
          onAction('help');
        }
        break;

      default:
        if (onAction) {
          onAction(command.action, command.data);
        }
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setResponse('');
      setError(null);
      setIsVisible(true);
      setIsListening(true);

      // Start recognition first
      try {
        recognitionRef.current.start();
        // Speak the welcome message (it will be interrupted when user starts speaking)
        speak('I am listening. How can I help you?');
      } catch (err: any) {
        // If recognition is already started, stop it first
        if (err.message && err.message.includes('already started')) {
          recognitionRef.current.stop();
          setTimeout(() => {
            recognitionRef.current.start();
            speak('I am listening. How can I help you?');
          }, 100);
        } else {
          console.error('Error starting recognition:', err);
          setError('Failed to start listening');
          setIsListening(false);
        }
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    }
  };

  const toggleAssistant = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isVisible && !isListening && !response && !error) {
    // Show only the toggle button when minimized
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleAssistant}
          className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110 flex items-center justify-center"
          title="Activate Arav Voice Assistant"
        >
          <Mic className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-500 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Arav</h3>
              <p className="text-xs text-green-100">Voice Assistant</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopListening();
              setIsVisible(false);
              setTranscript('');
              setResponse('');
              setError(null);
            }}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-xs text-gray-600">
              {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-64 overflow-y-auto">
          {isProcessing && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-green-500" />
            </div>
          )}

          {transcript && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">You said:</p>
              <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{transcript}</p>
            </div>
          )}

          {response && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Arav:</p>
              <p className="text-sm text-gray-800 bg-green-50 p-2 rounded">{response}</p>
            </div>
          )}

          {error && (
            <div className="mb-3">
              <p className="text-xs text-red-500 mb-1">Error:</p>
              <p className="text-sm text-red-700 bg-red-50 p-2 rounded">{error}</p>
            </div>
          )}

          {!transcript && !response && !error && !isProcessing && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Click the mic to start speaking</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={toggleAssistant}
            disabled={isProcessing}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${isListening
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                <span>Listen</span>
              </>
            )}
          </button>

          {response && (
            <button
              onClick={() => speak(response)}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Repeat response"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;

