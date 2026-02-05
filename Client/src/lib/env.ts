// Groq API Configuration
export const GROQ_API_KEY = "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";

// API Base URL Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper function to construct API URLs
export const apiUrl = (path: string): string => {
    return `${API_BASE_URL}${path}`;
};
