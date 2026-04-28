import { useEffect, useState } from "react";
import axios from "axios";
import { generateWeatherAdvice, type WeatherAdvice } from "./weatherAdvice";
import { syncBus } from "./syncBus";

export interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeedKmh: number;
  location: string;
}

interface UseWeatherReturn {
  weather: WeatherData | null;
  advice: WeatherAdvice | null;
  loading: boolean;
}

let _cache: { weather: WeatherData; advice: WeatherAdvice; ts: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000;

export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(_cache?.weather ?? null);
  const [advice, setAdvice] = useState<WeatherAdvice | null>(_cache?.advice ?? null);
  const [loading, setLoading] = useState(!_cache);
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const [wRes, gRes] = await Promise.allSettled([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
        axios.get(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`),
      ]);
      if (wRes.status === "fulfilled") {
        const d = wRes.value.data;
        const geo = gRes.status === "fulfilled" ? gRes.value.data[0] : null;
        const w: WeatherData = {
          temp:         Math.round(d.main.temp),
          feelsLike:    Math.round(d.main.feels_like),
          description:  d.weather[0].description,
          icon:         d.weather[0].icon,
          humidity:     d.main.humidity,
          windSpeedKmh: Math.round(d.wind.speed * 3.6),
          location:     geo?.name || d.name || "Your Farm",
        };
        const adv = generateWeatherAdvice({ temp: w.temp, humidity: w.humidity, windSpeedKmh: w.windSpeedKmh, description: w.description });
        _cache = { weather: w, advice: adv, ts: Date.now() };
        setWeather(w);
        setAdvice(adv);
      }
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const doFetch = () => {
    if (!API_KEY) { setLoading(false); return; }
    navigator.geolocation
      ? navigator.geolocation.getCurrentPosition(
          p => fetchWeather(p.coords.latitude, p.coords.longitude),
          () => fetchWeather(22.5726, 88.3639)
        )
      : fetchWeather(22.5726, 88.3639);
  };

  useEffect(() => {
    // Skip if cache is fresh
    if (_cache && Date.now() - _cache.ts < CACHE_TTL) {
      setWeather(_cache.weather);
      setAdvice(_cache.advice);
      setLoading(false);
      return;
    }
    doFetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_KEY]);

  // Listen for sync events — bust cache and re-fetch
  useEffect(() => {
    const handler = () => {
      _cache = null; // bust cache
      doFetch();
    };
    syncBus.on(handler);
    return () => syncBus.off(handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_KEY]);

  return { weather, advice, loading };
}
