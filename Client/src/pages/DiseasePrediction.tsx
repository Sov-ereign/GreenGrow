import { useState, useRef } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GROQ_API_KEY } from "@/lib/env";
import { ImageUploader } from '@/components/disease/ImageUploader';
import { PredictionResult } from '@/components/disease/PredictionResult';
import { ConfidenceIndicator } from '@/components/disease/ConfidenceIndicator';
import { RecommendationPanel } from '@/components/disease/RecommendationPanel';
import { InfoPanel } from '@/components/disease/InfoPanel';

export default function DiseasePredictionPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [result, setResult] = useState<{
        disease: string;
        confidence: number;
        description: string;
        causativeFactors?: string;
        impactOnYield?: string;
        biologicalProgression?: string;
        optimalEnvironment?: string;
        immediateActions?: string[];
        treatment: string[];
    } | null>(null);

    const resultSectionRef = useRef<HTMLDivElement>(null);

    const handleImageSelect = (file: File) => {
        setSelectedFile(file);
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        fileReader.readAsDataURL(file);
        setResult(null);
    };

    const fetchGroqAnalysis = async (disease: string) => {
        const apiKey = GROQ_API_KEY;
        const prompt = `Analyze the plant disease "${disease}" and provide a structured JSON response for an agricultural dashboard.
JSON should include:
{
  "description": "2-3 sentences max",
  "causativeFactors": "Briefly list environmental/pathogenic causes",
  "impactOnYield": "Estimated percentage and type of impact",
  "biologicalProgression": "How the disease spreads on the plant",
  "optimalEnvironment": "Conditions that favor the disease",
  "immediateActions": ["Action 1", "Action 2", "Action 3"],
  "treatments": ["Treatment 1", "Treatment 2", "Treatment 3"]
}
Ensure the response is ONLY the JSON object.`;

        try {
            if (!apiKey) throw new Error("Groq API key is missing");
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 1024,
                    response_format: { type: "json_object" }
                }),
            });

            if (!response.ok) throw new Error(`Groq API request failed`);
            const data = await response.json();
            const analysis = JSON.parse(data.choices?.[0]?.message?.content || '{}');

            return {
                description: analysis.description || 'No description available.',
                causativeFactors: analysis.causativeFactors,
                impactOnYield: analysis.impactOnYield,
                biologicalProgression: analysis.biologicalProgression,
                optimalEnvironment: analysis.optimalEnvironment,
                immediateActions: analysis.immediateActions || [],
                treatments: analysis.treatments || []
            };
        } catch (error) {
            console.error('Error fetching Groq analysis:', error);
            return {
                description: 'Unable to fetch detailed analysis. Please check your internet connection and try again.',
                causativeFactors: 'Data unavailable',
                impactOnYield: 'Data unavailable',
                biologicalProgression: 'Data unavailable',
                optimalEnvironment: 'Data unavailable',
                immediateActions: ['Check plant isolation', 'Monitor environmental conditions'],
                treatments: ['Consult a local agricultural expert for treatment options.']
            };
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;
        setIsAnalyzing(true);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const predictionResponse = await fetch('https://render-begins-musharraf.onrender.com/predict', {
                method: 'POST',
                body: formData,
            });

            if (!predictionResponse.ok) throw new Error(`API request failed`);
            const predictionData = await predictionResponse.json();
            const disease = predictionData.prediction || 'Unknown Disease';
            const analysis = await fetchGroqAnalysis(disease);

            setResult({
                disease,
                confidence: predictionData.confidence || 90,
                description: analysis.description,
                causativeFactors: analysis.causativeFactors,
                impactOnYield: analysis.impactOnYield,
                biologicalProgression: analysis.biologicalProgression,
                optimalEnvironment: analysis.optimalEnvironment,
                immediateActions: analysis.immediateActions,
                treatment: analysis.treatments
            });

            // Scroll to results
            setTimeout(() => {
                resultSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

        } catch (error) {
            console.error('Error during analysis:', error);
            setResult({
                disease: 'Analysis Failed',
                confidence: 0,
                description: 'Unable to analyze the image.',
                treatment: ['Please try again or contact support.']
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetForm = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setResult(null);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header / Hero Section */}
            <div className="relative bg-slate-900 overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/20 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center"
                    >
                        <div className="flex items-center gap-4 mb-8 bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md">
                            <Sparkles className="text-amber-400 w-5 h-5" />
                            <span className="text-white/80 text-sm font-bold uppercase tracking-[0.2em]">AI Powered Plant Diagnostic</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                            Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Plant Care</span>
                        </h1>

                        <p className="max-w-2xl text-xl text-slate-400 font-medium leading-relaxed mx-auto">
                            Identify crop diseases with high-precision AI. Upload a photo and receive instant treatment protocols.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative -mt-16 pb-24 px-6">
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Uploader Section */}
                    <div className="relative z-20">
                        <ImageUploader
                            onImageSelect={handleImageSelect}
                            previewUrl={previewUrl}
                            onClear={resetForm}
                        />

                        {/* Action Button */}
                        <AnimatePresence>
                            {selectedFile && !result && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex justify-center mt-8"
                                >
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing}
                                        className="relative group bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl overflow-hidden active:scale-95 transition-all"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative flex items-center gap-3">
                                            {isAnalyzing ? (
                                                <RefreshCw className="animate-spin" size={24} />
                                            ) : (
                                                <Sparkles size={24} className="text-amber-400" />
                                            )}
                                            {isAnalyzing ? 'Processing Specimen...' : 'Start AI Analysis'}
                                        </div>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Analysis Result Container */}
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                ref={resultSectionRef}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-12 pt-12 border-t border-slate-100"
                            >
                                {/* Top Layout: Result + Confidence */}
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                    <div className="lg:col-span-3">
                                        <PredictionResult
                                            disease={result.disease}
                                            confidence={result.confidence}
                                        />
                                    </div>
                                    <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center">
                                        <ConfidenceIndicator confidence={result.confidence} />
                                    </div>
                                </div>

                                {/* Knowledge Section */}
                                <div className="bg-slate-50/50 rounded-[48px] p-4 border border-slate-100">
                                    <div className="bg-white rounded-[40px] p-12 shadow-2xl shadow-slate-200/20">
                                        <InfoPanel
                                            description={result.description}
                                            causativeFactors={result.causativeFactors}
                                            impactOnYield={result.impactOnYield}
                                            biologicalProgression={result.biologicalProgression}
                                            optimalEnvironment={result.optimalEnvironment}
                                        />
                                    </div>
                                </div>

                                {/* Advisory Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 px-4">
                                        <div className="w-1.5 h-8 bg-green-500 rounded-full" />
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Agricultural Advisory</h2>
                                    </div>
                                    <RecommendationPanel
                                        treatments={result.treatment}
                                        immediateActions={result.immediateActions}
                                    />
                                </div>

                                {/* Reset Action */}
                                <div className="flex justify-center pt-8">
                                    <button
                                        onClick={resetForm}
                                        className="flex items-center gap-3 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all"
                                    >
                                        <RefreshCw size={20} />
                                        Analyze Another Sample
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Decorative Element */}
            <div className="h-24 bg-gradient-to-b from-white to-slate-50" />
        </div>
    );
}
