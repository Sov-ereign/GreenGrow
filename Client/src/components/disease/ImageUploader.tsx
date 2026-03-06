import React, { useState } from 'react';
import { Upload, Image as ImageIcon, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploaderProps {
    onImageSelect: (file: File) => void;
    previewUrl: string | null;
    onClear: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, previewUrl, onClear }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onImageSelect(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImageSelect(file);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
            >
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !previewUrl && document.getElementById('file-upload')?.click()}
                    className={`
            relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-500 cursor-pointer
            ${previewUrl
                            ? 'border-green-500/50 bg-green-50/30'
                            : isDragging
                                ? 'border-green-500 bg-green-50/50 scale-[1.01] shadow-xl ring-4 ring-green-500/10'
                                : 'border-slate-200 hover:border-green-400 bg-white hover:bg-slate-50 shadow-lg hover:shadow-xl'
                        }
            min-h-[400px] flex flex-col items-center justify-center p-8
          `}
                >
                    <AnimatePresence mode="wait">
                        {previewUrl ? (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="relative w-full aspect-video max-w-4xl"
                            >
                                <img
                                    src={previewUrl}
                                    alt="Plant preview"
                                    className="w-full h-full object-contain rounded-2xl shadow-2xl"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClear();
                                    }}
                                    className="absolute -top-4 -right-4 bg-white text-slate-900 p-2.5 rounded-full shadow-xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100 group/btn"
                                >
                                    <X size={20} className="group-hover/btn:rotate-90 transition-transform duration-300" />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center"
                            >
                                <div className="relative mb-6">
                                    <motion.div
                                        animate={{
                                            y: isDragging ? -10 : 0,
                                            scale: isDragging ? 1.1 : 1
                                        }}
                                        className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-500/5 group-hover:ring-green-500/10 transition-all duration-500"
                                    >
                                        <Upload className="w-10 h-10 text-green-600" />
                                    </motion.div>
                                    <motion.div
                                        animate={{
                                            scale: isDragging ? 1.2 : 1,
                                            opacity: isDragging ? 1 : 0
                                        }}
                                        className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full"
                                    />
                                </div>

                                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                                    Drop your plant photo here
                                </h3>
                                <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                                    Upload a clear image of the affected leaf or plant part for instant AI analysis
                                </p>

                                <div className="flex flex-wrap items-center justify-center gap-4">
                                    <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-2xl font-semibold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all hover:-translate-y-0.5 active:translate-y-0">
                                        <ImageIcon size={20} />
                                        Select from Gallery
                                    </button>
                                    <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-semibold hover:bg-slate-50 transition-all hover:-translate-y-0.5 active:translate-y-0">
                                        <Camera size={20} />
                                        Take a Photo
                                    </button>
                                </div>

                                <div className="mt-8 flex items-center justify-center gap-6 text-xs font-medium text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                                        JPEG
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                                        PNG
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                                        WEBP
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                />
            </motion.div>
        </div>
    );
};
