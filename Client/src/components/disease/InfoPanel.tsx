import React from 'react';
import { motion } from 'framer-motion';
import { Info, HelpCircle, Activity } from 'lucide-react';

interface InfoPanelProps {
    description: string;
    causativeFactors?: string;
    impactOnYield?: string;
    biologicalProgression?: string;
    optimalEnvironment?: string;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
    description,
    causativeFactors,
    impactOnYield,
    biologicalProgression,
    optimalEnvironment
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
            >
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <Info size={22} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">What is this?</h3>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/20 leading-relaxed text-slate-600">
                        {description || "Analyzing the biological markers of the specimen to provide a detailed diagnostic report..."}
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Activity size={22} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Impact & Causes</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <h4 className="font-bold text-slate-800 text-sm mb-1">Causative Factors</h4>
                            <p className="text-xs text-slate-500 leading-normal">
                                {causativeFactors || "Environmental humidity, localized pathogens, and soil nutrient imbalance."}
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <h4 className="font-bold text-slate-800 text-sm mb-1">Impact on Yield</h4>
                            <p className="text-xs text-slate-500 leading-normal">
                                {impactOnYield || "Can lead to 20-30% reduction in photosynthetic efficiency if left untreated."}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-50 rounded-[40px] p-8 relative overflow-hidden flex flex-col justify-center border border-slate-100"
            >
                <div className="absolute top-0 right-0 p-6 opacity-10">
                    <HelpCircle size={120} />
                </div>

                <div className="relative z-10 space-y-8">
                    <div className="space-y-2">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                            Detailed <br /><span className="text-blue-600 underline decoration-blue-200 decoration-8 underline-offset-4">Analysis Explanation</span>
                        </h3>
                        <p className="text-slate-500 font-medium">
                            Understanding the pathology behind the detection.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-1 h-12 bg-blue-500 rounded-full flex-shrink-0" />
                            <div>
                                <h4 className="font-black text-slate-800 text-sm italic underline decoration-blue-100">Biological Progression</h4>
                                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                    {biologicalProgression || "The disease typically manifests as chlorotic spots on older leaves, progressing to necrotic lesions."}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-1 h-12 bg-indigo-500 rounded-full flex-shrink-0" />
                            <div>
                                <h4 className="font-black text-slate-800 text-sm italic underline decoration-indigo-100">Optimal Environment</h4>
                                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                    {optimalEnvironment || "High humidity and temperatures between 20°C - 28°C significantly accelerate the spread."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
