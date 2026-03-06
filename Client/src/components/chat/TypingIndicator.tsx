import React from 'react';
import { motion } from 'framer-motion';

export const TypingIndicator: React.FC = () => {
    return (
        <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm w-fit mb-6">
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                className="w-1.5 h-1.5 bg-green-500 rounded-full"
            />
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                className="w-1.5 h-1.5 bg-green-400 rounded-full"
            />
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                className="w-1.5 h-1.5 bg-green-300 rounded-full"
            />
        </div>
    );
};
