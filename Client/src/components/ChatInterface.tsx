import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, Volume1, Bot, User, Leaf, Sprout, Send, ImageIcon, ChevronDown, Scan, X as XIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GROQ_API_KEY, ELEVENLABS_API_KEY, apiUrl } from "@/lib/env";
import { useAuth } from "../context/AuthContext";

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
  type?: 'text' | 'image';
  imagePreviewUrl?: string | null;
  diseaseDetection?: any | null;
  plantId?: string | null;
}

// Define suggestion types
interface Suggestion {
  id: string;
  text: string;
}

// Language-specific suggestions
const farmingSuggestions: Record<string, Suggestion[]> = {
  en: [
    { id: '1', text: 'Weather forecast for my crops' },
    { id: '2', text: 'Best practices for organic farming' },
    { id: '3', text: 'How to identify plant diseases' },
    { id: '4', text: 'Soil testing recommendations' },
    { id: '5', text: 'Water conservation techniques' },
  ],
  bn: [
    { id: '1', text: 'আমার ফসলের জন্য আবহাওয়ার পূর্বাভাস' },
    { id: '2', text: 'জৈব চাষের সেরা পদ্ধতি' },
    { id: '3', text: 'উদ্ভিদের রোগ কীভাবে চিহ্নিত করব' },
    { id: '4', text: 'মাটি পরীক্ষার পরামর্শ' },
    { id: '5', text: 'জল সংরক্ষণের কৌশল' },
  ],
  hi: [
    { id: '1', text: 'मेरी फसलों के लिए मौसम पूर्वानुमान' },
    { id: '2', text: 'जैविक खेती के लिए सर्वोत्तम अभ्यास' },
    { id: '3', text: 'पौधों की बीमारियों की पहचान कैसे करें' },
    { id: '4', text: 'मिट्टी परीक्षण की सिफारिशें' },
    { id: '5', text: 'जल संरक्षण तकनीक' },
  ],
  ta: [
    { id: '1', text: 'எனது பயிர்களுக்கான வானிலை முன்னறிவிப்பு' },
    { id: '2', text: 'கரிம விவசாயத்திற்கான சிறந்த நடைமுறைகள்' },
    { id: '3', text: 'தாவர நோய்களை எவ்வாறு அடையாளம் காண்பது' },
    { id: '4', text: 'மண் பரிசோதனை பரிந்துரைகள்' },
    { id: '5', text: 'நீர் பாதுகா்ப்பு நுட்பங்கள்' },
  ],
  te: [
    { id: '1', text: 'నా పంటల కోసం వాతావరణ సూచన' },
    { id: '2', text: 'సేంద్రీయ వ్యవసాయం కోసం ఉత్తమ పద్ధతులు' },
    { id: '3', text: 'మొక్కల వ్యాధులను ఎలా గుర్తించాలి' },
    { id: '4', text: 'మట్టి పరీక్ష సిఫార్సులు' },
    { id: '5', text: 'నీటి సంరక్షణ టెక్నిక్‌లు' },
  ],
  mr: [
    { id: '1', text: 'माझ्या पिकांसाठी हवामान अंदाज' },
    { id: '2', text: 'सेंद्रिय शेतीसाठी सर्वोत्तम पद्धती' },
    { id: '3', text: 'वनस्पतींचे रोग कसे ओळखावे' },
    { id: '4', text: 'माती चाचणी शिफारसी' },
    { id: '5', text: 'पाणी संवर्धन तंत्र' },
  ],
};

// Language-specific placeholders
const placeholders: Record<string, string> = {
  en: 'Ask about crops, weather, or farming techniques...',
  bn: 'ফসল, আবহাওয়া, বা চাষের কৌশল সম্পর্কে জিজ্ঞাসা করুন...',
  hi: 'फसल, मौसम, या खेती की तकनीकों के बारे में पूछें...',
  ta: 'பயிர்கள், வானிலை, அல்லது விவசாய நுட்பங்கள் பற்றி கேளுங்கள்...',
  te: 'పంటలు, వాతావరణం, లేదా వ్యవసాయ టెక్నిక్‌ల గురించి అడగండి...',
  mr: 'पिके, हवामान, किंवा शेती तंत्रांबद्दल विचारा...',
};

// Language-specific welcome messages
const welcomeMessages: Record<string, string> = {
  en: "Hello, I'm **KrishiBot**, your agriculture assistant. How can I help with your farming needs today?",
  bn: "হ্যালো, আমি **কৃষিবট**, আপনার কৃষি সহায়ক। আজ আপনার চাষের প্রয়োজনে কীভাবে সাহায্য করতে পারি?",
  hi: "नमस्ते, मैं **कृषिबॉट** हूँ, आपका कृषि सहायक। आज मैं आपकी खेती की जरूरतों में कैसे मदद कर सकता हूँ?",
  ta: "வணக்கம், நான் **கிரிஷிபோட்**, உங்கள் விவசாய உதவியாளர். இன்று உங்கள் விவசாயத் தேவைகளுக்கு எவ்வாறு உதவ முடியும்?",
  te: "హాయ్, నేను **కృషిబాట్**, మీ వ్యవసాయ సహాయకుడు. ఈ రోజు మీ వ్యవసాయ అవసరాలకు ఎలా సహాయం చేయగలను?",
  mr: "नमस्कार, मी **कृषिबॉट**, तुमचा शेती सहाय्यक आहे. आज तुमच्या शेतीच्या गरजांसाठी मी कशी मदत करू शकतो?",
};

// Speech recognition language codes
const speechLanguageCodes: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
};

// ElevenLabs voice pools per language (ordered fallbacks)
// Use only confirmed public voices to avoid 404s when a voice ID is missing from the account.
const elevenLabsVoicePool: Record<string, string[]> = {
  en: ['21m00Tcm4TlvDq8ikWAM', 'EXAVITQu4vr4xnSDxMaL'], // Rachel, Bella
  hi: ['pNInz6obpgDQGcFmaJgB', '21m00Tcm4TlvDq8ikWAM'], // Adam (multilingual), Rachel
  bn: ['21m00Tcm4TlvDq8ikWAM', 'pNInz6obpgDQGcFmaJgB'], // Rachel, Adam
};
const ELEVENLABS_DISABLED_KEY = 'greengrow_elevenlabs_disabled';
const elevenLabsVoiceCache: { list?: string[] } = {};

  const getInitialElevenLabsEnabled = () => {
    if (!ELEVENLABS_API_KEY) return false;
    if (typeof window === 'undefined') return false;
    return true;
  };

interface ChatInterfaceProps {
  initialSessionId?: string | null;
  initialPlantId?: string | null;
  onSessionChange?: (sessionId: string | null) => void;
}

export default function AgriSmartAssistant({
  initialSessionId = null,
  initialPlantId = null,
  onSessionChange,
}: ChatInterfaceProps) {

  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: welcomeMessages['en'],
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [useElevenLabs, setUseElevenLabs] = useState(getInitialElevenLabsEnabled);
  const [showSettings, setShowSettings] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const skipNextAutoScrollRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imageObjectUrlsRef = useRef<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [isImageAnalyzing, setIsImageAnalyzing] = useState(false);
  const [activePlantId, setActivePlantId] = useState<string | null>(initialPlantId);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialSessionId);

  useEffect(() => {
    return () => {
      imageObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      imageObjectUrlsRef.current = [];
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionClass = window.webkitSpeechRecognition || window.SpeechRecognition;
      if (SpeechRecognitionClass) {
        recognitionRef.current = new SpeechRecognitionClass();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          console.log('Voice input received:', transcript);
          setInputValue(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  // Sync chat language with user preferred language from Settings
  useEffect(() => {
    if (!user || !user.language) return;
    const userLang = user.language.toLowerCase();
    let langCode: string = 'en';
    if (userLang.includes('bengali')) langCode = 'bn';
    else if (userLang.includes('hindi')) langCode = 'hi';
    else if (userLang.includes('marathi')) langCode = 'mr';
    else if (userLang.includes('tamil')) langCode = 'ta';
    else if (userLang.includes('telugu')) langCode = 'te';
    else langCode = 'en';
    setLanguage(langCode);
  }, [user]);

  // Update welcome message when language changes (only for new chats)
  useEffect(() => {
    if (activeSessionId) return;
    setMessages([
      {
        id: '1',
        text: welcomeMessages[language] || welcomeMessages['en'],
        sender: 'assistant',
        timestamp: new Date(),
      },
    ]);
  }, [language, activeSessionId]);

  // Helper to translate the current messages to the selected language for display
  const translateMessagesForLanguage = async (msgs: Message[], targetLanguage: string) => {
    if (!msgs.length) return;
    setIsTranslating(true);
    try {
      const res = await fetch(apiUrl('/api/chat/translate'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs, language: targetLanguage }),
      });
      if (!res.ok) throw new Error('Failed to translate chat');
      const data = await res.json();
      const translated: Message[] = (data.messages || []).map((m: any) => {
        const rawText = m?.text;
        const text =
          typeof rawText === 'string'
            ? rawText
            : rawText && typeof rawText === 'object' && 'text' in rawText
              ? String((rawText as any).text ?? '')
              : String(rawText ?? '');
        return {
          ...m,
          text,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        };
      });
      if (translated.length) {
        setMessages(translated);
      }
    } catch (err) {
      console.warn('Translation skipped:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Load session messages when a session is selected
  useEffect(() => {
    const loadSession = async (sessionId: string) => {
      try {
        const response = await fetch(apiUrl(`/api/chat/sessions/${sessionId}`), {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to load session');
        }
        const data = await response.json();
        const loadedMessages: Message[] = (data.messages || []).map((msg: any) => ({
          id: msg.id || crypto.randomUUID(),
          text: msg.message || '',
          sender: msg.sender,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          type: msg.imageUrl ? 'image' : 'text',
          imagePreviewUrl: msg.imageUrl || null,
        }));
        skipNextAutoScrollRef.current = true;
        const baseMessages = loadedMessages.length ? loadedMessages : [
          {
            id: '1',
            text: welcomeMessages[language] || welcomeMessages['en'],
            sender: 'assistant',
            timestamp: new Date(),
          },
        ];
        setMessages(baseMessages);
        if (language && baseMessages.length && language !== 'en') {
          translateMessagesForLanguage(baseMessages, language);
        }
        setActiveSessionId(sessionId);
      } catch (error) {
        console.error('Failed to load session:', error);
      }
    };

    if (initialSessionId) {
      loadSession(initialSessionId);
    } else {
      setActiveSessionId(null);
      skipNextAutoScrollRef.current = true;
      setMessages([
        {
          id: '1',
          text: welcomeMessages[language] || welcomeMessages['en'],
          sender: 'assistant',
          timestamp: new Date(),
        },
      ]);
    }
  }, [initialSessionId, language]);

  // When language changes, translate currently visible messages to keep the view consistent
  useEffect(() => {
    if (!messages.length) return;
    translateMessagesForLanguage(messages, language);
  }, [language]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (skipNextAutoScrollRef.current) {
      skipNextAutoScrollRef.current = false;
      return;
    }
    scrollToBottom();
  }, [messages]);

  // Update speech recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = speechLanguageCodes[language] || 'en-IN';
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to speak text using ElevenLabs API
  const speakWithElevenLabs = async (text: string) => {
    // If user disabled ElevenLabs, skip.
    if (!useElevenLabs) {
      speakWithBrowserTTS(text);
      return;
    }
    if (!ELEVENLABS_API_KEY) {
      console.error('ElevenLabs API key not provided');
      speakWithBrowserTTS(text);
      return;
    }

    const playVoice = async (voiceId: string) => {
      const endpoints = [`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`];
      for (const url of endpoints) {
        const response = await fetch(url, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: { stability: 0.5, similarity_boost: 0.5 },
          }),
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setIsSpeaking(false);
            console.warn('ElevenLabs auth/quota issue (401/403). Check VITE_ELEVENLABS_API_KEY.');
            speakWithBrowserTTS(text);
            return true; // stop further attempts
          }
          // try next endpoint or voice
          continue;
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
        return true;
      }
      return false;
    };

    try {
      const voices = elevenLabsVoicePool[language] || elevenLabsVoicePool['en'] || [];
      const dynamicVoices = elevenLabsVoiceCache.list || [];
      const voiceCandidates = [...voices, ...dynamicVoices];
      let played = false;
      for (const voiceId of voiceCandidates) {
        try {
          setIsSpeaking(true);
          const ok = await playVoice(voiceId);
          if (ok) {
            played = true;
            break;
          }
        } catch (innerErr) {
          console.warn('ElevenLabs voice failed, trying next:', innerErr);
          setIsSpeaking(false);
        }
      }

      // If still not played and no dynamic voices tried, fetch voice list and retry once
      if (!played && !dynamicVoices.length) {
        try {
              const res = await fetch('https://api.elevenlabs.io/v1/voices', {
                headers: {
                  'xi-api-key': ELEVENLABS_API_KEY,
                },
              });
          if (res.ok) {
            const data = await res.json();
            const ids = (data?.voices || []).map((v: any) => v.voice_id).filter(Boolean);
            elevenLabsVoiceCache.list = ids;
            if (ids.length) {
              const retryVoices = ids.slice(0, 3); // try first few
              for (const vid of retryVoices) {
                try {
                  setIsSpeaking(true);
                  const r2 = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}/stream`, {
                    method: 'POST',
                    headers: {
                      'Accept': 'audio/mpeg',
                      'Content-Type': 'application/json',
                      'xi-api-key': ELEVENLABS_API_KEY,
                    },
                    body: JSON.stringify({
                      text,
                      model_id: 'eleven_multilingual_v2',
                      voice_settings: { stability: 0.5, similarity_boost: 0.5 },
                    }),
                  });
                  if (!r2.ok) continue;
                  const blob = await r2.blob();
                  const url = URL.createObjectURL(blob);
                  const audio = new Audio(url);
                  audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
                  audio.onerror = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
                  await audio.play();
                  played = true;
                  break;
                } catch (inner) {
                  console.warn('Dynamic ElevenLabs voice failed', inner);
                  setIsSpeaking(false);
                }
              }
            }
          }
        } catch (err) {
          console.warn('Failed to fetch ElevenLabs voices', err);
        }
      }

      if (!played) {
        setIsSpeaking(false);
        speakWithBrowserTTS(text);
      }
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      setIsSpeaking(false);
      // Fallback to browser TTS
      speakWithBrowserTTS(text);
    }
  };

  // Function to speak text using Web Speech API with enhanced language support
  const speakWithBrowserTTS = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Enhanced language mapping for better voice selection
    const voiceLangMap: Record<string, string[]> = {
      en: ['en-IN', 'en-US', 'en-GB'],
      hi: ['hi-IN', 'hi'],
      bn: ['bn-IN', 'bn-BD', 'bn'],
      ta: ['ta-IN', 'ta'],
      te: ['te-IN', 'te'],
      mr: ['mr-IN', 'mr'],
    };

    // Wait for voices to load
    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferredLangs = voiceLangMap[language] || ['en-IN'];

      let selectedVoice = null;

      // Try to find the best voice for the current language
      for (const lang of preferredLangs) {
        selectedVoice = voices.find(voice => voice.lang === lang);
        if (selectedVoice) break;

        // Try partial matches
        selectedVoice = voices.find(voice => voice.lang.startsWith(lang.split('-')[0]));
        if (selectedVoice) break;
      }

      // Fallback to any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Selected voice:', selectedVoice.name, selectedVoice.lang);
      }

      // Adjust speech parameters based on language
      utterance.rate = language === 'hi' || language === 'bn' ? 0.8 : 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        console.log('Speech synthesis started');
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        console.log('Speech synthesis ended');
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        if (event.error === 'interrupted') {
          // Ignore interruption errors as they are expected when cancelling speech
          return;
        }
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    // Handle voice loading
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoiceAndSpeak();
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      setVoiceAndSpeak();
    }
  };

  // Function to speak text
  const speakText = (text: string) => {
    if (!voiceEnabled) return;

    // Remove markdown formatting for speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
      .replace(/_(.*?)_/g, '$1')       // Remove underscore italic
      .replace(/`(.*?)`/g, '$1')       // Remove code markdown
      .replace(/#+\s*/g, '')           // Remove headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links

    if (useElevenLabs && ELEVENLABS_API_KEY) {
      speakWithElevenLabs(cleanText);
    } else {
      speakWithBrowserTTS(cleanText);
    }
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);

    const objectUrl = URL.createObjectURL(file);
    imageObjectUrlsRef.current.push(objectUrl);
    setImagePreviewUrl(objectUrl);
  };

  const resetImageSelection = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  // Function to start voice input
  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    try {
      setIsListening(true);
      recognitionRef.current.start();
      console.log('Speech recognition started');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  };

  // Function to stop voice input
  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Function to toggle voice output
  const toggleVoiceOutput = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  // Function to check if query is agriculture-related
  const isAgricultureRelated = (input: string): boolean => {
    const keywords = [
      // English
      'crop', 'farm', 'agriculture', 'soil', 'pest', 'disease', 'irrigation', 'weather', 'organic',
      'livestock', 'cultivation', 'fertilizer', 'equipment', 'government scheme', 'farming', 'plant',
      'harvest', 'drought', 'compost', 'tractor', 'seeds', 'sowing', 'plowing', 'manure', 'cattle', 'poultry',
      // Bengali
      'ফসল', 'চাষ', 'কৃষি', 'মাটি', 'পোকা', 'রোগ', 'সেচ', 'আবহাওয়া', 'জৈব', 'গবাদি পশু', 'চাষাবাদ',
      'সার', 'সরঞ্জাম', 'সরকারি প্রকল্প', 'উদ্ভিদ', 'ফসল কাটা', 'খরা', 'কম্পোস্ট', 'ট্রাক্টর', 'বীজ', 'বপন',
      'চাষ', 'গোবর', 'গবাদি', 'মুরগি',
      // Hindi
      'फसल', 'खेती', 'कृषि', 'मिट्टी', 'कीट', 'रोग', 'सिंचाई', 'मौसम', 'जैविक', 'पशुधन', 'खेतीबाड़ी',
      'उर्वरक', 'उपकरण', 'सरकारी योजना', 'पौधा', 'कटाई', 'सूखा', 'खाद', 'ट्रैक्टर', 'बीज', 'बुवाई',
      'जुताई', 'गोबर', 'मवेशी', 'मुर्गी',
      // Tamil
      'பயிர்', 'விவசாயம்', 'மண்', 'பூச்சி', 'நோய்', 'பாசனம்', 'வானிலை', 'கரிம', 'கால்நடை', 'பயிரிடுதல்',
      'உரம்', 'உபகரணங்கள்', 'அரசு திட்டம்', 'தாவரம்', 'அறுவடை', 'வறட்சி', 'உரம்', 'டிராக்டர்', 'விதைகள்',
      'விதைப்பு', 'உழவு', 'எரு', 'கால்நடைகள்', 'கோழி',
      // Telugu
      'పంట', 'వ్యవసాయం', 'మట్టి', 'పురుగు', 'వ్యాధి', 'నీటిపారుదల', 'వాతావరణం', 'సేంద్రీయ', 'పశుసంపద',
      'సాగు', 'ఎరువు', 'సామగ్రి', 'ప్రభుత్వ పథకం', 'మొక్క', 'కోత', 'కరువు', 'కంపోస్ట్', 'ట్రాక్టర్', 'విత్తనాలు',
      'విత్తనం', 'దున్నడం', 'ఎరువు', 'పశువులు', 'కోళ్లు',
      // Marathi
      'पीक', 'शेती', 'कृषी', 'माती', 'कीटक', 'रोग', 'सिंचन', 'हवामान', 'सेंद्रिय', 'पशुधन', 'शेतीपद्धती',
      'खत', 'साधने', 'सरकारी योजना', 'वनस्पती', 'कापणी', 'दुष्काळ', 'कंपोस्ट', 'ट्रॅक्टर', 'बियाणे', 'पेरणी',
      'नांगरणी', 'शेण', 'गुरे', 'कुकुटपालन',
    ];
    return keywords.some((keyword) => input.toLowerCase().includes(keyword));
  };

  // Function to generate response using Groq API
  const generateResponse = async (input: string): Promise<string> => {

    const languageMap: Record<string, string> = {
      en: 'English',
      bn: 'Bengali',
      hi: 'Hindi',
      ta: 'Tamil',
      te: 'Telugu',
      mr: 'Marathi',
    };

    const languageName = languageMap[language] || 'English';

    const customPrompt = `You are KrishiBot, a smart, multilingual farming assistant integrated into the AgriSmart.Ai platform.  
Your purpose is to help Indian farmers—especially small and marginal ones—by providing real-time, useful, and easy-to-understand agricultural guidance.

You are trained to respond accurately to all farming-related questions. You must **always answer** questions related to:

- **Crops and growing conditions**
- **Soil fertility and moisture**
- **Fertilizers, irrigation, and pest control**
- **Weather-aware farming**
- **Livestock and equipment**
- **Government schemes and seasonal advice**

You must reply in **${languageName}**, using **simple, farmer-friendly language**.

============================================================
🌱 You MUST Answer All Crop-Related Questions, Even Informal:
============================================================

You must NEVER reject valid crop-related questions, even if the word "crop" or "plant" is missing.

For example, all of the following are valid and must be answered:

- "What is the ideal condition to grow potato?"
- "How much water does banana need?"
- "Fertilizer for chickpea?"
- "Best soil for mungbean?"

You must recognize crop names directly (e.g., "potato", "rice", "grapes", "banana")  
— even if used without the words "crop" or "plant".


====================================================================
🌾 These are priority crops. You must answer ALL questions about them:
====================================================================

- **rice**
- **maize**
- **chickpea**
- **kidney beans**
- **pigeon peas**
- **moth beans**
- **mung bean**
- **black gram**
- **lentil**
- **pomegranate**
- **banana**
- **mango**
- **grapes**
- **watermelon**
- **muskmelon**
- **apple**
- **orange**
- **papaya**
- **coconut**
- **cotton**
- **jute**
- **coffee**

For each of these crops, you must know and respond with:

- **Ideal soil moisture** (from the provided dataset)
- **Soil type, pH, and fertility needs**
- **Temperature and rainfall required**
- **Sowing and harvesting time**
- **Pest and disease risks**
- **Fertilizer type and irrigation method**

====================================================================
🎯 Core Capabilities (ALWAYS Respond to These):
====================================================================

- **Ideal growing conditions for any crop above**
- **Moisture requirements** for crops using internal lookup (e.g., rice: 30%)
- **Soil fertility improvement** with organic and inorganic practices
- **Fertilizer recommendations**: quantity, schedule, and method
- **Irrigation timing and automation support**
- **Weather-based tips** for harvest, spraying, or disease prevention
- **AI-based disease detection** (when image is uploaded)
- **Subsidy and scheme information** relevant to crops or regions
- **Livestock care** and feeding schedules
- **Farm machinery tips** for irrigation, spraying, etc.
- **Voice/text interaction** in local languages

====================================================================
⛔ Do NOT Reject the Following:
====================================================================

You must NEVER reject questions about any of the above 23 crops. For example:

- "What is the ideal moisture level for banana?"
- "How much water does cotton need?"
- "Best soil for growing chickpeas?"
- "When should I plant papaya?"
- "Fertilizer for lentil?"

These are valid and must be answered in full.

Only reject unrelated topics (politics, entertainment, finance, etc.).  
In those cases, say:

"আমি কেবলমাত্র কৃষি এবং খামার সম্পর্কিত তথ্য দিতে পারি। দয়া করে কৃষি সংক্রান্ত প্রশ্ন করুন।"

====================================================================
📝 Response Formatting Rules:
====================================================================

- Use **bold** for important terms and actionable advice
- Use *italics* for additional suggestions or notes
- Use bullet points for lists
- Use numbers for farming procedures
- Always answer in **${languageName}** using **village-friendly, simple language**
User query: ${input}`;

    if (!GROQ_API_KEY) {
      console.error("Groq API Key is missing");
      const errorMessages: Record<string, string> = {
        en: 'Error: API configuration missing. Please provide a Groq API key.',
        bn: 'ত্রুটি: API কনফিগারেশন অনুপস্থিত। অনুগ্রহ করে একটি Groq API কী প্রদান করুন।',
      };
      return errorMessages[language] || "Error: API configuration missing.";
    }

    console.log("Groq API Key status:", GROQ_API_KEY ? "Present" : "Missing", GROQ_API_KEY ? `(${GROQ_API_KEY.slice(0, 4)}...)` : "");

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are a helpful agricultural assistant." },
            { role: "user", content: customPrompt }
          ],
          model: "llama-3.3-70b-versatile", // Changed to standard stable model
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Groq API Error Details:", response.status, errorText);
        throw new Error(`Groq API error: ${response.status}`);
      }
      const data = await response.json();
      return data.choices[0]?.message?.content || "Error generating response.";
    } catch (error) {
      console.error("Groq API Error:", error);
      const errorMessages: Record<string, string> = {
        en: 'Sorry, there was an issue connecting to the server. Please try again later.',
        bn: 'দুঃখিত, সার্ভারের সাথে সংযোগে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।',
        hi: 'क्षमा करें, सर्वर से कनेक्ट करने में समस्या हुई। कृपया बाद में पुनः प्रयास करें।',
        ta: 'மன்னிக்கவும், சேவையகத்துடன் இணைப்பதில் சிக்கல் ஏற்பட்டது. பின்னர் மீண்டும் முயற்சிக்கவும்.',
        te: 'క్షమించండి, సర్వర్‌కు కనెక్ట్ చేయడంలో సమస్య ఉంది. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి.',
        mr: 'क्षमस्व, सर्व्हरशी कनेक्ट करण्यात अडचण आली. कृपया नंतर पुन्हा प्रयत्न करा.',
      };
      return errorMessages[language] || errorMessages['en'];
    }
  };

  // Function to handle sending messages (text or image+prompt)
  const handleSendMessage = async (text: string = inputValue) => {
    const trimmed = text.trim();
    if (!trimmed && !selectedImage) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: trimmed || (selectedImage
        ? (language === 'bn'
          ? 'আমি একটি গাছের ছবি বিশ্লেষণের জন্য পাঠাচ্ছি।'
          : language === 'hi'
            ? 'मैं पौधे की एक तस्वीर विश्लेषण के लिए भेज रहा हूँ।'
            : 'Sent an image for analysis.')
        : ''),
      sender: 'user',
      timestamp: new Date(),
      type: selectedImage ? 'image' : 'text',
      imagePreviewUrl: selectedImage ? imagePreviewUrl || null : null,
      plantId: activePlantId,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // If an image is selected, use backend image-analysis flow (persisted in DB)
    if (selectedImage) {
      setIsTyping(true);
      setIsImageAnalyzing(true);
      try {
        const formData = new FormData();
        formData.append('image', selectedImage);
        if (trimmed) {
          formData.append('prompt', trimmed);
        }
        formData.append('language', language);
        if (activePlantId) {
          formData.append('plantId', activePlantId);
        }
        if (activeSessionId) {
          formData.append('sessionId', activeSessionId);
        }

        const response = await fetch(apiUrl('/api/chat/image-analysis'), {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Image analysis failed');
        }

        const data = await response.json();

        if (data.plantId) {
          setActivePlantId(data.plantId);
        }
        if (data.sessionId) {
          setActiveSessionId(data.sessionId);
          onSessionChange?.(data.sessionId);
        }

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          text: data.response || '',
          sender: 'assistant',
          timestamp: new Date(),
          type: 'image',
          diseaseDetection: data.diseaseDetection || null,
          plantId: data.plantId || activePlantId,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
        setIsImageAnalyzing(false);
        resetImageSelection();

        if (voiceEnabled && assistantMessage.text) {
          speakText(assistantMessage.text);
        }
      } catch (error) {
        console.error('Image analysis error:', error);
        const errorMessages: Record<string, string> = {
          en: 'Sorry, there was an issue analyzing the image. Please try again.',
          bn: 'Sorry, there was an issue analyzing the image. Please try again.',
          hi: 'Sorry, there was an issue analyzing the image. Please try again.',
        };
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          text: errorMessages[language] || errorMessages['en'],
          sender: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
        setIsImageAnalyzing(false);
        resetImageSelection();
      }

      return;
    }

    // Text-only message (existing behavior)
    setIsTyping(true);

    try {
      const payload: any = {
        message: trimmed,
        language,
      };
      if (activePlantId) payload.plantId = activePlantId;
      if (activeSessionId) payload.sessionId = activeSessionId;

      const response = await fetch(apiUrl("/api/chat/message"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to send message");
      }

      const data = await response.json();

      if (data.plantId) {
        setActivePlantId(data.plantId);
      }
        if (data.sessionId) {
          setActiveSessionId(data.sessionId);
          onSessionChange?.(data.sessionId);
        }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        text: data.response,
        sender: "assistant",
        timestamp: new Date(),
        plantId: data.plantId || activePlantId,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);

      if (voiceEnabled && data.response) {
        speakText(data.response);
      }
    } catch (error) {
      console.error("Error sending chat message:", error);
      setIsTyping(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (text: string) => {
    handleSendMessage(text);
  };

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Handle language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLang = e.target.value;
    setLanguage(nextLang);
    const notice: Record<string, string> = {
      en: "Language changed to English.",
      bn: "ভাষা বাংলা-তে পরিবর্তিত হয়েছে।",
      hi: "भाषा हिंदी में बदल दी गई है।",
      ta: "மொழி தமிழ் ஆக மாற்றப்பட்டது.",
      te: "భాష తెలుగుకు మార్చబడింది.",
      mr: "भाषा मराठीमध्ये बदलली आहे.",
    };
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: notice[nextLang] || "Language updated.",
        sender: "assistant",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full min-h-0" style={{background: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)"}}>

      {/* ============================================================ */}
      {/* HEADER                                                        */}
      {/* ============================================================ */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-5 py-3 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          {/* Bot avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md shadow-green-200">
              <Leaf size={20} className="text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">KrishiBot</h2>
              <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">AI</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-tight">
              {isSpeaking
                ? "🔊 Speaking..."
                : isTyping
                  ? "✦ Generating response..."
                  : isListening
                    ? "🎙 Listening..."
                    : "Online · Agriculture Expert"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Plant context chip */}
          {activePlantId && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full font-medium">
              <Sprout size={12} />
              Plant monitoring active
            </span>
          )}

          {/* Voice output toggle */}
          <button
            onClick={toggleVoiceOutput}
            title={voiceEnabled ? "Mute voice" : "Enable voice"}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              voiceEnabled
                ? "bg-purple-50 text-purple-600 hover:bg-purple-100"
                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
            }`}
          >
            {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Settings button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              showSettings ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <Settings size={15} />
          </button>

          {/* Language selector */}
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-gray-50 text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-green-400/50 cursor-pointer"
          >
            <option value="en">EN</option>
            <option value="bn">BN</option>
            <option value="hi">HI</option>
            <option value="ta">TA</option>
            <option value="te">TE</option>
            <option value="mr">MR</option>
          </select>
        </div>
      </header>

      {/* ============================================================ */}
      {/* SETTINGS PANEL (slide-down)                                   */}
      {/* ============================================================ */}
      {showSettings && (
        <div className="bg-white border-b border-gray-100 px-5 py-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Voice Settings</p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={toggleVoiceOutput}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                voiceEnabled
                  ? "bg-green-500 text-white hover:bg-green-600 shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              {voiceEnabled ? "Voice on" : "Voice off"}
            </button>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="useElevenLabs"
                checked={useElevenLabs}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setUseElevenLabs(enabled);
                }}
                className="rounded border-gray-300 text-green-500 focus:ring-green-400"
              />
              <span className="text-xs text-gray-600">ElevenLabs premium voice</span>
            </label>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MESSAGES AREA                                                  */}
      {/* ============================================================ */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-2">

          {/* Empty state / welcome */}
          {messages.length <= 1 && (
            <div className="text-center py-8 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-200/60">
                <Leaf size={30} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Ask KrishiBot anything</h3>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">
                Get expert advice on crops, diseases, weather, and more — in your language.
              </p>

              {/* Suggestion chips grid */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-w-sm mx-auto">
                {(farmingSuggestions[language] || farmingSuggestions["en"]).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSuggestionClick(s.text)}
                    className="group flex items-start gap-2.5 px-3.5 py-3 bg-white rounded-xl border border-gray-100 hover:border-green-300 hover:shadow-md hover:shadow-green-100/50 transition-all duration-200 text-left"
                  >
                    <span className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-green-100 transition-colors">
                      <Sprout size={13} className="text-green-600" />
                    </span>
                    <span className="text-xs text-gray-600 group-hover:text-gray-800 font-medium leading-snug transition-colors">
                      {s.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, idx) => {
            const isAI = message.sender === "assistant";
            const prevMsg = messages[idx - 1];
            const showAvatar = !prevMsg || prevMsg.sender !== message.sender;

            return (
              <div
                key={message.id}
                className={`flex items-end gap-2.5 ${isAI ? "justify-start" : "justify-end"}`}
              >
                {/* AI avatar (left) */}
                {isAI && (
                  <div className={`flex-shrink-0 mb-1 ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md shadow-green-200/40">
                      <Bot size={15} className="text-white" />
                    </div>
                  </div>
                )}

                {/* Bubble */}
                <div className={`group max-w-[78%] ${isAI ? "" : "ml-10"}`}>
                  {/* Sender label */}
                  {showAvatar && (
                    <p className={`text-[10px] font-semibold mb-1 px-1 ${isAI ? "text-gray-400" : "text-right text-gray-400"}`}>
                      {isAI ? "KrishiBot" : "You"}
                    </p>
                  )}

                  <div
                    className={`relative px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      isAI
                        ? "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm shadow-gray-200/60"
                        : "bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl rounded-tr-sm shadow-green-200/50"
                    }`}
                  >
                    {/* Image preview in message */}
                    {message.type === "image" && message.imagePreviewUrl && (
                      <div className="mb-3 -mx-1">
                        <img
                          src={message.imagePreviewUrl}
                          alt="Uploaded plant"
                          className="max-h-52 w-full max-w-xs rounded-xl border border-white/20 object-contain bg-black/5"
                        />
                      </div>
                    )}

                    {/* Message text */}
                    {isAI ? (
                      <div className="prose prose-sm max-w-none prose-p:mb-2 prose-p:last:mb-0 prose-strong:text-green-800 prose-em:text-green-700 prose-ul:pl-4 prose-ol:pl-4 prose-li:mb-0.5">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-bold text-green-800">{children}</strong>,
                            em: ({ children }) => <em className="italic text-green-700">{children}</em>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                            li: ({ children }) => <li className="text-gray-700">{children}</li>,
                            h3: ({ children }) => <h3 className="font-bold text-gray-800 mt-3 mb-1.5 text-sm">{children}</h3>,
                            h4: ({ children }) => <h4 className="font-semibold text-gray-700 mt-2 mb-1 text-xs uppercase tracking-wide">{children}</h4>,
                            code: ({ children }) => <code className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                          }}
                        >
                          {message.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p>{message.text}</p>
                    )}

                    {/* Disease detection structured card */}
                    {isAI && message.diseaseDetection && (
                      <div className="mt-3 -mx-1 rounded-xl overflow-hidden border border-green-200/60">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-2 flex items-center gap-2">
                          <Scan size={13} className="text-white opacity-90" />
                          <span className="text-xs font-bold text-white">Plant Health Report</span>
                          {message.diseaseDetection.confidence && (
                            <span className="ml-auto text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                              {Math.round(message.diseaseDetection.confidence)}% confidence
                            </span>
                          )}
                        </div>
                        <div className="bg-white p-3 space-y-2">
                          {message.diseaseDetection.disease && (
                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Detected</p>
                              <p className="text-sm font-bold text-gray-800">{message.diseaseDetection.disease}</p>
                            </div>
                          )}
                          {message.diseaseDetection.description && (
                            <p className="text-xs text-gray-600 leading-relaxed border-t border-gray-50 pt-2">{message.diseaseDetection.description}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timestamp + listen */}
                  <div className={`flex items-center gap-2 mt-1 px-1 ${isAI ? "justify-start" : "justify-end"}`}>
                    <span className="text-[10px] text-gray-400">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {isAI && (
                      <button
                        onClick={() => speakText(message.text)}
                        disabled={!voiceEnabled}
                        className={`text-[10px] flex items-center gap-1 font-medium transition-colors ${
                          voiceEnabled ? "text-gray-400 hover:text-green-600" : "text-gray-300 cursor-not-allowed"
                        }`}
                        title={voiceEnabled ? "Listen" : "Voice muted"}
                      >
                        <Volume1 size={10} />
                        {language === "hi" ? "सुनें" : language === "bn" ? "শুনুন" : "Listen"}
                      </button>
                    )}
                  </div>
                </div>

                {/* User avatar (right) */}
                {!isAI && (
                  <div className={`flex-shrink-0 mb-1 ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                      <User size={15} className="text-slate-600" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing / loading indicator */}
          {isTyping && (
            <div className="flex items-end gap-2.5 justify-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md shadow-green-200/40">
                  <Bot size={15} className="text-white" />
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {isImageAnalyzing
                    ? language === "hi"
                      ? "छवि विश्लेषण हो रहा है…"
                      : language === "bn"
                        ? "ছবি বিশ্লেষণ হচ্ছে…"
                        : "Analyzing plant image…"
                    : language === "hi"
                      ? "जवाब तैयार हो रहा है…"
                      : language === "bn"
                        ? "উত্তর তৈরি হচ্ছে…"
                        : "KrishiBot is thinking…"}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ============================================================ */}
      {/* COMPOSER                                                       */}
      {/* ============================================================ */}
      <div className="px-4 pb-4 pt-2 bg-gradient-to-t from-white/90 to-transparent">
        <div className="max-w-2xl mx-auto">

          {/* Status banners */}
          {(isListening || isSpeaking || isImageAnalyzing) && (
            <div className="flex justify-center mb-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                isListening
                  ? "bg-red-500 text-white"
                  : isSpeaking
                    ? "bg-purple-500 text-white"
                    : "bg-green-500 text-white"
              }`}>
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                {isListening
                  ? language === "hi" ? "सुन रहा हूं…" : language === "bn" ? "শুনছি…" : "Listening…"
                  : isSpeaking
                    ? language === "hi" ? "बोल रहा हूं…" : language === "bn" ? "বলছি…" : "Speaking…"
                    : language === "hi" ? "छवि विश्लेषण…" : language === "bn" ? "ছবি বিশ্লেষণ…" : "Analyzing image…"
                }
              </div>
            </div>
          )}

          {/* Image preview */}
          {selectedImage && imagePreviewUrl && (
            <div className="mb-2 flex items-center gap-3 bg-white rounded-xl px-3 py-2 border border-gray-100 shadow-sm">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-50">
                <img
                  src={imagePreviewUrl}
                  alt={selectedImage.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={resetImageSelection}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-800 text-white flex items-center justify-center shadow"
                  title="Remove"
                >
                  <XIcon size={9} />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-700 truncate">{selectedImage.name}</p>
                <p className="text-[10px] text-gray-400">{Math.round(selectedImage.size / 1024)} KB · Ready to analyze</p>
              </div>
            </div>
          )}

          {/* Main input row */}
          <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-100/80 px-2 py-2 focus-within:border-green-400/70 focus-within:shadow-green-100/50 transition-all">

            {/* Image upload */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              title={language === "hi" ? "छवि अपलोड करें" : language === "bn" ? "ছবি আপলোড করুন" : "Upload plant image"}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                selectedImage
                  ? "bg-green-100 text-green-600"
                  : "text-gray-400 hover:text-green-600 hover:bg-green-50"
              }`}
            >
              <ImageIcon size={18} />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            {/* Text input */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholders[language] || placeholders["en"]}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-700 placeholder:text-gray-400 py-1 min-w-0"
            />

            {/* Mic button */}
            <button
              onClick={isListening ? stopVoiceInput : startVoiceInput}
              title={isListening ? "Stop" : "Voice input"}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "text-gray-400 hover:text-green-600 hover:bg-green-50"
              }`}
            >
              {isListening ? <MicOff size={17} /> : <Mic size={17} />}
            </button>

            {/* Send button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() && !selectedImage}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                inputValue.trim() || selectedImage
                  ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md shadow-green-200 hover:shadow-green-300 hover:-translate-y-px active:translate-y-0"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              }`}
            >
              <Send size={16} className={inputValue.trim() || selectedImage ? "translate-x-px -translate-y-px" : ""} />
            </button>
          </div>

          <p className="mt-2 text-[10px] text-center text-gray-400 font-medium tracking-wider uppercase">
            Powered by GreenGrow AI · KrishiBot v2
          </p>
        </div>
      </div>
    </div>
  );
}
