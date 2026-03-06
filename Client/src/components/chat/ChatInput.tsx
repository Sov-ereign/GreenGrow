import React, { useRef, useState } from 'react';
import { Send, Image, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    onImageSelect: (file: File) => void;
    isListening: boolean;
    onStartListening: () => void;
    onStopListening: () => void;
    placeholder: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage,
    onImageSelect,
    isListening,
    onStartListening,
    onStopListening,
    placeholder,
}) => {
    const [text, setText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (text.trim()) {
            onSendMessage(text);
            setText('');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImageSelect(file);
        }
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto px-4 pb-6 pt-2 bg-gradient-to-t from-slate-50 to-transparent">
            <div className="relative group bg-white rounded-2xl shadow-lg border border-slate-200 transition-all focus-within:shadow-xl focus-within:border-green-500/50">
                <div className="flex items-center gap-2 p-2">
                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 pl-1">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                            title="Upload Image"
                        >
                            <Image size={20} />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    {/* Text Input */}
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 text-sm py-2 px-1"
                    />

                    {/* Interactive Controls */}
                    <div className="flex items-center gap-1 pr-1">
                        <button
                            onClick={isListening ? onStopListening : onStartListening}
                            className={`p-2 rounded-xl transition-all ${isListening
                                ? 'bg-red-50 text-red-500 animate-pulse'
                                : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                                }`}
                        >
                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>

                        <button
                            onClick={handleSend}
                            disabled={!text.trim()}
                            className={`p-2 rounded-xl transition-all ${text.trim()
                                ? 'bg-green-600 text-white shadow-md shadow-green-200 hover:bg-green-700'
                                : 'text-slate-300 cursor-not-allowed'
                                }`}
                        >
                            <Send size={18} className={text.trim() ? 'translate-x-[1px] -translate-y-[1px]' : ''} />
                        </button>
                    </div>
                </div>

                {/* Floating Indicator for Voice */}
                <AnimatePresence>
                    {isListening && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900 text-white text-[11px] font-medium rounded-full flex items-center gap-2 shadow-xl whitespace-nowrap"
                        >
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                            KrishiBot is listening...
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <p className="mt-3 text-[10px] text-center text-slate-400 font-medium uppercase tracking-[0.1em] pointer-events-none">
                Powered by GreenGrow AI
            </p>
        </div>
    );
};
