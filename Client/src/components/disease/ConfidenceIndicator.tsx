import React from 'react';
import { motion } from 'framer-motion';

interface ConfidenceIndicatorProps {
    confidence: number;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ confidence }) => {
    const getStatusColor = (score: number) => {
        if (score >= 90) return 'text-green-500 bg-green-500/10';
        if (score >= 70) return 'text-amber-500 bg-amber-500/10';
        return 'text-rose-500 bg-rose-500/10';
    };

    const getBarColor = (score: number) => {
        if (score >= 90) return 'bg-green-500';
        if (score >= 70) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    return (
        <div className="space-y-4 w-full">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Analysis Confidence</span>
                <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(confidence)}`}
                >
                    {confidence >= 80 ? 'HIGH ACCURACY' : confidence >= 60 ? 'RELIABLE' : 'UNSTABLE'}
                </motion.span>
            </div>

            <div className="relative">
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${confidence}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full relative ${getBarColor(confidence)}`}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </motion.div>
                </div>

                {/* Confidence Value Floating */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-2 flex justify-between items-center"
                >
                    <span className="text-3xl font-black text-slate-800 tracking-tight">
                        {confidence}<span className="text-xl text-slate-400">%</span>
                    </span>
                    <p className="text-xs text-slate-400 font-medium max-w-[140px] text-right leading-tight">
                        Based on millions of agricultural diagnostic patterns
                    </p>
                </motion.div>
            </div>
        </div>
    );
};
