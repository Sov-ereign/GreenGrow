import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ChatMessageProps {
    message: {
        id: string;
        text: string;
        sender: 'user' | 'assistant';
        timestamp: Date;
        image?: string;
    };
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isAssistant = message.sender === 'assistant';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`flex w-full mb-6 ${isAssistant ? 'justify-start' : 'justify-end'}`}
        >
            <div className={`flex max-w-[85%] md:max-w-[75%] ${isAssistant ? 'flex-row' : 'flex-row-reverse'} gap-3`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm 
          ${isAssistant
                        ? 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                        : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600'}`}
                >
                    {isAssistant ? <Bot size={20} /> : <User size={20} />}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
                    <div className={`relative px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed
            ${isAssistant
                            ? 'bg-white text-slate-800 rounded-tl-sm border border-slate-100'
                            : 'bg-green-600 text-white rounded-tr-sm shadow-green-200'}`}
                    >
                        {message.image && (
                            <div className="mb-3 overflow-hidden rounded-lg">
                                <img
                                    src={message.image}
                                    alt="Uploaded preview"
                                    className="max-w-full h-auto object-cover rounded-lg"
                                />
                            </div>
                        )}
                        <div className={`prose prose-sm max-w-none ${isAssistant ? 'prose-slate' : 'prose-invert'}`}>
                            <ReactMarkdown>{message.text}</ReactMarkdown>
                        </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 mt-1.5 px-1 opacity-50 group">
                        <Clock size={10} className="text-slate-400" />
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                            {format(message.timestamp, 'p')}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
