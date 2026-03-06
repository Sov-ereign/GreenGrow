import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface PredictionResultProps {
    disease: string;
    confidence: number;
}

export const PredictionResult: React.FC<PredictionResultProps> = ({ disease }) => {
    const isHealthy = disease.toLowerCase().includes('healthy');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
        >
            {/* Decorative Background Icon */}
            <div className="absolute -right-6 -top-6 text-slate-50 opacity-[0.03]">
                {isHealthy ? <ShieldCheck size={200} /> : <AlertCircle size={200} />}
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isHealthy ? 'text-green-600 bg-green-50' : 'text-rose-600 bg-rose-50'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full animate-ping ${isHealthy ? 'bg-green-500' : 'bg-rose-500'}`} />
                            {isHealthy ? 'System Verified' : 'Detection Alert'}
                        </span>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        {disease}
                    </h2>
                    <p className="text-slate-500 font-medium">
                        AI has detected {isHealthy ? 'a healthy state' : `signs of ${disease}`} in the uploaded specimen.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                    <div className={`p-3 rounded-xl ${isHealthy ? 'bg-green-500 text-white' : 'bg-rose-500 text-white shadow-lg shadow-rose-200'}`}>
                        {isHealthy ? <ShieldCheck size={28} /> : <AlertCircle size={28} />}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Status</p>
                        <p className={`text-xl font-black ${isHealthy ? 'text-green-600' : 'text-rose-600'}`}>
                            {isHealthy ? 'Healthy Plant' : 'Infected Leaf'}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
