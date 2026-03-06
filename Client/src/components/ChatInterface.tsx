import { useState, useEffect, useRef } from 'react';
import { Volume2, Settings, Sparkles, LayoutGrid, ArrowLeft } from 'lucide-react';
import { GROQ_API_KEY, ELEVENLABS_API_KEY } from "@/lib/env";
import { ChatMessage } from './chat/ChatMessage';
import { ChatInput } from './chat/ChatInput';
import { TypingIndicator } from './chat/TypingIndicator';
import { DiseaseResultCard } from './chat/DiseaseResultCard';
import { motion, AnimatePresence } from 'framer-motion';

// Web Speech API type definitions
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  start(): void;
  stop(): void;
  abort(): void;
  onaudioend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechGrammarList {
  readonly length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromURI(src: string, weight?: number): void;
  addFromString(string: string, weight?: number): void;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new(): SpeechRecognition;
    };
  }
}

// Define message types
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  image?: string;
  isResult?: boolean;
}

// Define suggestion types
interface Suggestion {
  id: string;
  text: string;
}

const farmingSuggestions: Record<string, Suggestion[]> = {
  en: [
    { id: '1', text: 'Weather forecast for my crops' },
    { id: '2', text: 'Best practices for organic farming' },
    { id: '3', text: 'How to identify plant diseases' },
    { id: '4', text: 'Soil testing recommendations' },
  ],
  bn: [
    { id: '1', text: 'আমার ফসলের জন্য আবহাওয়ার পূর্বাভাস' },
    { id: '2', text: 'জৈব চাষের সেরা পদ্ধতি' },
  ],
  hi: [
    { id: '1', text: 'मेरी फसलों के लिए मौसम पूर्वानुमान' },
    { id: '2', text: 'जैविक खेती के लिए सर्वोत्तम अभ्यास' },
  ],
  ta: [
    { id: '1', text: 'எனது பயிர்களுக்கான வானிலை முன்னறிவிப்பு' },
    { id: '2', text: 'கரிம விவசாயத்திற்கான சிறந்த நடைமுறைகள்' },
  ],
  te: [
    { id: '1', text: 'నా పంటల కోసం వాతావరణ సూచన' },
    { id: '2', text: 'సేంద్రీయ వ్యవసాయం కోసం ఉత్తమ పద్ధతులు' },
  ],
  mr: [
    { id: '1', text: 'माझ्या पिकांसाठी हवामान अंदाज' },
    { id: '2', text: 'सेंद्रिय शेतीसाठी सर्वोत्तम पद्धती' },
  ],
};

const placeholders: Record<string, string> = {
  en: 'Ask KrishiBot about crops, weather...',
  bn: 'ফসল, আবহাওয়া সম্পর্কে জিজ্ঞাসা করুন...',
  hi: 'फसल, मौसम के बारे में पूछें...',
  ta: 'பயிர்கள், வானிலை பற்றி கேளுங்கள்...',
  te: 'పంటలు, వాతావరణం గురించి అడగండి...',
  mr: 'पिके, हवामान बद्दल विचारा...',
};

const welcomeMessages: Record<string, string> = {
  en: "Hello, I'm **KrishiBot**, your AI agriculture assistant. Upload a leaf photo for disease detection or ask me anything about farming!",
  bn: "হ্যালো, আমি **কৃষিবট**। রোগ শনাক্তকরণের জন্য একটি পাতার ছবি আপলোড করুন বা চাষাবাদ সম্পর্কে আমাকে জিজ্ঞাসা করুন!",
  hi: "नमस्ते, मैं **कृषिबॉट** हूँ। रोग की पहचान के लिए पत्ती का फोटो अपलोड करें या मुझसे खेती के बारे में कुछ भी पूछें!",
  ta: "வணக்கம், நான் **கிரிஷிபோட்**, உங்கள் விவசாய உதவியாளர். இன்று உங்கள் விவசாயத் தேவைகளுக்கு எவ்வாறு உதவ முடியும்?",
  te: "హాయ్, నేను **కృషిబాట్**, మీ వ్యవసాయ సహాయకుడు. ఈ రోజు మీ వ్యవసాయ అవసరాలకు ఎలా సహాయం చేయగలను?",
  mr: "नमस्कार, मी **कृषिबॉट**, तुमचा शेती सहाय्यक आहे. आज तुमच्या शेतीच्या गरजांसाठी मी कशी मदत करू शकतो?",
};

const speechLanguageCodes: Record<string, string> = {
  en: 'en-IN', hi: 'hi-IN', bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN', mr: 'mr-IN',
};

const elevenLabsVoices: Record<string, string> = {
  en: '9BWtsMINqrJLrRacOk9x', hi: 'pNInz6obpgDQGcFmaJgB', bn: 'EXAVITQu4vr4xnSDxMaL',
};

export default function AgriSmartAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: welcomeMessages['en'],
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [useElevenLabs, setUseElevenLabs] = useState(!!ELEVENLABS_API_KEY);
  const [showSettings, setShowSettings] = useState(false);

  // Disease Prediction State
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<{
    disease: string;
    confidence: number;
    description: string;
    treatment: string[];
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionClass = window.webkitSpeechRecognition || window.SpeechRecognition;
      if (SpeechRecognitionClass) {
        recognitionRef.current = new SpeechRecognitionClass();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          handleSendMessage(event.results[0][0].transcript);
          setIsListening(false);
        };
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = speechLanguageCodes[language] || 'en-IN';
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const speakText = async (text: string) => {
    if (!voiceEnabled || !text) return;
    const cleanText = text.replace(/[*_`#]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    if (useElevenLabs && ELEVENLABS_API_KEY) {
      try {
        setIsSpeaking(true);
        const voiceId = elevenLabsVoices[language] || elevenLabsVoices['en'];
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanText, model_id: 'eleven_multilingual_v2' }),
        });
        if (response.ok) {
          const audio = new Audio(URL.createObjectURL(await response.blob()));
          audio.onended = () => setIsSpeaking(false);
          await audio.play();
          return;
        }
      } catch (e) { console.error("ElevenLabs error", e); }
    }

    // Fallback Browser TTS
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = speechLanguageCodes[language] || 'en-IN';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleAnalyzeImage = async (file: File) => {
    setAnalyzingImage(true);
    setIsTyping(true);

    // Show image in chat immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Analyzing this plant image...",
        sender: 'user',
        timestamp: new Date(),
        image: e.target?.result as string
      }]);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('https://render-begins-musharraf.onrender.com/predict', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Prediction API failed");
      const data = await res.json();
      const disease = data.prediction || 'Unknown Disease';

      // Fetch Treatment from Groq
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: `Provide a concise description and 3 bullet point treatments for plant disease: ${disease}. Format: Description: [desc] Treatments: - [1] - [2] - [3]` }],
        }),
      });

      const groqData = await groqRes.json();
      const text = groqData.choices[0].message.content;
      const descMatch = text.match(/Description: (.*?)\nTreatments:/s);
      const treatMatch = text.match(/- (.*?)(?:\n- (.*?))?(?:\n- (.*?))?$/s);

      const result = {
        disease,
        confidence: data.confidence || 90,
        description: descMatch ? descMatch[1].trim() : "Analysis complete.",
        treatment: treatMatch ? [treatMatch[1], treatMatch[2], treatMatch[3]].filter(Boolean) : ["Consult an expert."]
      };

      setActiveAnalysis(result);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: `I've analyzed the image. The results indicate **${disease}**.`,
        sender: 'assistant',
        timestamp: new Date(),
        isResult: true
      }]);

      speakText(`Analysis complete. I found ${disease} with high confidence.`);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't analyze the image. Please try again with a clearer photo.",
        sender: 'assistant',
        timestamp: new Date()
      }]);
    } finally {
      setAnalyzingImage(false);
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), text: text.trim(), sender: 'user', timestamp: new Date() }]);
    setIsTyping(true);

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "system", content: "You are KrishiBot, an expert agricultural assistant. Use simple, helpful language." }, { role: "user", content: text }],
          model: "llama-3.3-70b-versatile",
          temperature: 0.7
        })
      });

      const data = await res.json();
      const responseText = data.choices[0]?.message?.content || "I'm not sure how to respond to that.";

      setMessages(prev => [...prev, { id: Date.now().toString(), text: responseText, sender: 'assistant', timestamp: new Date() }]);
      speakText(responseText);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: "I'm having trouble connecting. Please try again.", sender: 'assistant', timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Premium Header */}
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 tracking-tight leading-none text-lg">KrishiBot AI</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${analyzingImage ? 'bg-amber-400' : 'bg-green-500'}`} />
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {analyzingImage ? 'Analyzing...' : isSpeaking ? 'Speaking...' : 'Smart Assistant'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-xl transition-all ${showSettings ? 'bg-green-50 text-green-600' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <Settings size={20} />
          </button>
          <div className="h-6 w-px bg-slate-200 mx-1" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-50 text-slate-600 border-none rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-green-500/20 cursor-pointer outline-none"
          >
            <option value="en">ENGLISH</option>
            <option value="bn">বাংলা</option>
            <option value="hi">हिन्दी</option>
            <option value="ta">தமிழ்</option>
            <option value="te">తెలుగు</option>
            <option value="mr">मराठी</option>
          </select>
        </div>
      </header>

      {/* Messages Window */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-4 scroll-smooth">
        <div className="max-w-4xl mx-auto w-full">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {activeAnalysis && (
              <div className="flex justify-center w-full py-4">
                <DiseaseResultCard
                  result={activeAnalysis}
                  onReset={() => setActiveAnalysis(null)}
                />
              </div>
            )}

            {isTyping && <TypingIndicator key="typing" />}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-0 bottom-32 mx-auto max-w-sm bg-white border border-slate-200 p-5 rounded-3xl shadow-2xl z-30"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">KrishiBot Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
                <ArrowLeft size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Volume2 size={20} className="text-green-600" />
                  <span className="text-sm font-medium text-slate-700">Premium Audio</span>
                </div>
                <input
                  type="checkbox"
                  checked={useElevenLabs}
                  onChange={(e) => setUseElevenLabs(e.target.checked)}
                  className="w-5 h-5 accent-green-600 rounded-lg"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <LayoutGrid size={20} className="text-blue-500" />
                  <span className="text-sm font-medium text-slate-700">Voice Output</span>
                </div>
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`w-12 h-6 rounded-full transition-all relative ${voiceEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${voiceEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Section */}
      <footer className="flex-shrink-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {farmingSuggestions[language]?.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSendMessage(s.text)}
                className="bg-white/50 backdrop-blur-sm border border-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-white hover:border-green-300 transition-all shadow-sm active:scale-95"
              >
                {s.text}
              </button>
            ))}
          </div>
        </div>
        <ChatInput
          onSendMessage={handleSendMessage}
          onImageSelect={handleAnalyzeImage}
          isListening={isListening}
          onStartListening={() => recognitionRef.current?.start()}
          onStopListening={() => recognitionRef.current?.stop()}
          placeholder={placeholders[language] || placeholders['en']}
        />
      </footer>
    </div>
  );
}
