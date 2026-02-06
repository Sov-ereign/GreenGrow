export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
export const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || "";
export const OPENWEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || "";


// API Base URL Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper function to construct API URLs
export const apiUrl = (path: string): string => {
    return `${API_BASE_URL}${path}`;
};


