import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Leaf, ShieldCheck, Microscope } from 'lucide-react';

interface DiseaseResultCardProps {
    result: {
        disease: string;
        confidence: number;
        description: string;
        treatment: string[];
    };
    onReset: () => void;
}

export const DiseaseResultCard: React.FC<DiseaseResultCardProps> = ({ result, onReset }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-green-100/50 border border-green-100 overflow-hidden my-4"
        >
            {/* Header with Confidence */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <Microscope size={20} className="opacity-90" />
                    <h3 className="font-bold tracking-tight">AI Analysis Result</h3>
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    <CheckCircle size={14} />
                    <span className="text-xs font-bold">{Math.round(result.confidence)}% Confidence</span>
                </div>
            </div>

            <div className="p-6">
                {/* Disease Name */}
                <div className="mb-5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Detected Condition</div>
                    <div className="text-2xl font-black text-slate-800 flex items-center gap-2 leading-tight">
                        {result.disease}
                        <Leaf size={24} className="text-green-500" />
                    </div>
                </div>

                {/* Description */}
                <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100">
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                            "{result.description}"
                        </p>
                    </div>
                </div>

                {/* Treatment List */}
                <div className="space-y-3 mb-6">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Recommended Treatment</div>
                    <div className="space-y-2">
                        {result.treatment.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-green-200 transition-colors shadow-sm"
                            >
                                <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 shadow-sm">
                                    {index + 1}
                                </div>
                                <span className="text-sm text-slate-700 font-medium leading-tight">{step}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={onReset}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <ShieldCheck size={18} />
                    Confirm & Save Record
                </button>
            </div>
        </motion.div>
    );
};
