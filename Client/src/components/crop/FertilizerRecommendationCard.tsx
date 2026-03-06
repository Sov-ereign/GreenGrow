import React from 'react';
import { motion } from 'framer-motion';
import {
    Sprout,
    AlertTriangle,
    Drill,
    MapPin,
    Scale,
    Clock,
    TrendingUp,
    ShieldAlert,
    ChevronRight
} from 'lucide-react';

export interface FertilizerAdvice {
    cropName: string;
    detectedIssue: string;
    recommendedFertilizer: string;
    applicationMethod: string;
    recommendedQuantity: string;
    applicationTiming: string;
    expectedBenefits: string;
    precautions: string;
}

interface FertilizerRecommendationCardProps {
    advice: FertilizerAdvice | null;
}

export const FertilizerRecommendationCard: React.FC<FertilizerRecommendationCardProps> = ({ advice }) => {
    if (!advice) return null;

    const sections = [
        {
            title: "Crop Name",
            value: advice.cropName,
            icon: <Sprout className="w-5 h-5 text-green-600" />,
            type: "normal"
        },
        {
            title: "Detected Issue / Soil Condition",
            value: advice.detectedIssue,
            icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
            type: "normal"
        },
        {
            title: "Recommended Fertilizer",
            value: advice.recommendedFertilizer,
            icon: <Drill className="w-5 h-5 text-blue-600" />,
            type: "highlight",
            highlightColor: "text-blue-700 bg-blue-50 border-blue-100"
        },
        {
            title: "Application Method",
            value: advice.applicationMethod,
            icon: <MapPin className="w-5 h-5 text-purple-600" />,
            type: "normal"
        },
        {
            title: "Recommended Quantity",
            value: advice.recommendedQuantity,
            icon: <Scale className="w-5 h-5 text-teal-600" />,
            type: "highlight",
            highlightColor: "text-teal-700 bg-teal-50 border-teal-100"
        },
        {
            title: "Application Timing",
            value: advice.applicationTiming,
            icon: <Clock className="w-5 h-5 text-indigo-600" />,
            type: "normal"
        },
        {
            title: "Expected Benefits",
            value: advice.expectedBenefits,
            icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
            type: "list"
        },
        {
            title: "Precautions",
            value: advice.precautions,
            icon: <ShieldAlert className="w-5 h-5 text-red-600" />,
            type: "list"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm"
        >
            {/* Refined Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-8 py-6">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
                    <div className="w-2 h-8 bg-green-600 rounded-full" />
                    Fertilizer Recommendation Report
                </h2>
                <p className="text-gray-500 text-sm mt-1 ml-5">Comprehensive AI-powered analysis for soil optimization</p>
            </div>

            <div className="p-8 space-y-8">
                {sections.map((section, index) => (
                    <div key={index} className="flex flex-col space-y-3">
                        {/* Section Heading - Simplified */}
                        <div className="flex items-center gap-2 text-gray-800">
                            <span className="p-1 bg-gray-50 rounded">
                                {section.icon}
                            </span>
                            <h3 className="text-lg font-medium text-gray-900">
                                {section.title}
                            </h3>
                        </div>

                        {/* Section Content */}
                        <div className="pl-9">
                            {section.type === "highlight" ? (
                                <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${section.highlightColor} text-base font-semibold transition-colors`}>
                                    {section.value}
                                </div>
                            ) : section.type === "list" ? (
                                <div className="space-y-3">
                                    {section.value.split('.').filter(s => s.trim().length > 0).map((sentence, i) => (
                                        <div key={i} className="flex items-start gap-3 text-gray-600">
                                            <ChevronRight className="w-4 h-4 text-green-400 mt-1.5 flex-shrink-0" />
                                            <p className="text-base leading-relaxed">
                                                {sentence.trim()}.
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-base text-gray-600 leading-relaxed max-w-4xl">
                                    {section.value}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Simplified Safety Notice */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <p className="text-sm text-gray-500 leading-relaxed">
                        <span className="font-semibold text-gray-700">Advisory:</span> This recommendation is tailored for your specific soil inputs for {advice.cropName}. Results may vary based on environmental factors. Consult a local expert for large-scale application.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
