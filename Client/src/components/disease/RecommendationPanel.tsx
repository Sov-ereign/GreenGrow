import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Syringe, ShieldCheck, ArrowRight, Lightbulb } from 'lucide-react';

interface RecommendationPanelProps {
    treatments: string[];
    immediateActions?: string[];
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ treatments, immediateActions }) => {
    const defaultActions = ['Isolate infected specimens', 'Sanitize tools used', 'Adjust irrigation levels'];
    const displayActions = immediateActions && immediateActions.length > 0 ? immediateActions : defaultActions;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Immediate Actions */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900 text-white rounded-3xl p-8 lg:col-span-1 shadow-2xl relative overflow-hidden group"
            >
                <div className="absolute right-0 bottom-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Zap size={140} />
                </div>

                <div className="relative z-10">
                    <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-amber-400/20">
                        <Zap size={24} className="text-slate-900" />
                    </div>
                    <h3 className="text-2xl font-black mb-4 tracking-tight">Immediate Actions</h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        Critical steps to take within the next 24-48 hours to halt disease progression.
                    </p>

                    <ul className="space-y-4">
                        {displayActions.map((action, i) => (
                            <li key={i} className="flex items-start gap-3 group/item">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 group-hover/item:scale-150 transition-transform" />
                                <span className="text-slate-300 text-sm font-medium">{action}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-8 pt-6 border-t border-slate-800">
                        <button className="flex items-center gap-2 text-amber-400 font-bold hover:gap-3 transition-all text-sm uppercase tracking-widest">
                            View Protocol <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Suggested Treatments */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 lg:col-span-2 border border-slate-100 shadow-xl shadow-slate-200/30"
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                            <Syringe size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Treatment Protocol</h3>
                            <p className="text-slate-400 text-sm font-medium mt-1">AI-recommended agricultural remedies</p>
                        </div>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        Verified Solution
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {treatments.map((treatment, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-5 bg-slate-50 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-green-500 transition-colors shadow-sm">
                                    <ShieldCheck size={18} />
                                </div>
                                <p className="text-[15px] font-bold text-slate-700 leading-tight">
                                    {treatment}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                    {treatments.length === 0 && (
                        <div className="col-span-2 py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                <Lightbulb size={24} className="text-slate-300" />
                            </div>
                            <p className="text-slate-400 text-sm font-medium">Analyzing specific botanical remedies...</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0 animate-bounce">
                        <Lightbulb size={28} className="text-amber-500" />
                    </div>
                    <div className="text-center sm:text-left">
                        <h4 className="font-black text-amber-900 tracking-tight">Pro Tip for Farmers</h4>
                        <p className="text-amber-800/70 text-sm leading-relaxed mt-1">
                            Apply treatments during early morning or late evening hours to maximize absorption and prevent evaporation under direct sunlight.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
