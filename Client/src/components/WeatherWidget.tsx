import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Cloud,
  Droplets,
  Wind,
  MapPin,
  ThermometerSun,
  Gauge,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const WeatherWidget: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [location, setLocation] = useState<string>("Detecting...");
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  const navigate = useNavigate();

  // Fetch weather by coordinates using Current Weather API (Student Plan compatible)
  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    if (!API_KEY) {
      setLocation("API Key Missing");
      return;
    }
    try {
      // Get accurate location name first using reverse geocoding
      let nextLocation: string | null = null;
      try {
        const reverseGeo = await axios.get(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
        );
        if (reverseGeo.data?.[0]) {
          const geo = reverseGeo.data[0];
          const parts = [];
          if (geo.name) parts.push(geo.name);
          if (geo.state && geo.state !== geo.name) parts.push(geo.state);
          if (geo.country) parts.push(geo.country);
          nextLocation = parts.length > 0 ? parts.join(", ") : geo.name || null;
        }
      } catch (reverseErr) {
        console.warn("Reverse geocoding failed, will try other methods:", reverseErr);
      }

      // Try current weather API first
      let weatherData;
      try {
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        weatherData = res.data;
        if (!nextLocation && res.data.name) {
          nextLocation = res.data.name;
        }
      } catch (currentErr: any) {
        try {
          const forecastRes = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=1&units=metric&appid=${API_KEY}`
          );
          if (forecastRes.data.list && forecastRes.data.list.length > 0) {
            const firstDay = forecastRes.data.list[0];
            weatherData = {
              main: {
                temp: firstDay.temp.day,
                feels_like: firstDay.feels_like.day,
                humidity: firstDay.humidity,
                pressure: firstDay.pressure,
              },
              weather: firstDay.weather,
              wind: {
                speed: (firstDay.speed || 0) * 3.6,
              },
              visibility: 10000,
            };
            if (!nextLocation && forecastRes.data.city?.name) {
              nextLocation = forecastRes.data.city.name;
            }
          }
        } catch (forecastErr) {
          throw currentErr; // Throw original error
        }
      }

      if (weatherData) {
        setData(weatherData);
      }

      if (!nextLocation) {
        nextLocation = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      }
      setLocation(nextLocation);
    } catch (err: any) {
      console.error("Error fetching weather:", err);
      if (err?.response?.status === 401) {
        setLocation("Invalid API Key");
      } else {
        setLocation("Error loading weather");
      }
    }
  };

  // Detect user location
  useEffect(() => {
    if (!API_KEY) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation error:", error);
          fetchWeatherByCoords(22.5726, 88.3639); // Default: Kolkata
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    } else {
      fetchWeatherByCoords(22.5726, 88.3639);
    }
  }, [API_KEY]);

  if (!API_KEY) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-gray-500">
        <div className="text-sm">Weather API key missing</div>
        <div className="text-xs mt-1">Add VITE_WEATHER_API_KEY to Client/.env</div>
      </div>
    );
  }

  if (!data)
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-gray-500">
        Loading weather...
      </div>
    );

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 cursor-pointer hover:shadow-md transition-all space-y-4"
      onClick={() => navigate("/weather")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.15em] text-emerald-600 font-semibold">
            Local conditions
          </p>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span className="truncate">{location}</span>
          </h2>
        </div>
        <div className="rounded-xl bg-emerald-50 p-2 border border-emerald-100">
          <img
            src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
            alt="Weather"
            className="h-12 w-12"
          />
        </div>
      </div>

      <div className="flex items-baseline gap-3">
        <div className="text-4xl font-bold text-slate-900">
          {Math.round(data.main.temp)}°C
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <ThermometerSun className="h-4 w-4 text-amber-500" />
          Feels like {Math.round(data.main.feels_like || data.main.temp)}°C
        </div>
      </div>
      <p className="text-sm text-slate-600 capitalize">
        {data.weather[0].description}
      </p>

      <div className="grid grid-cols-3 gap-3 text-xs md:text-sm text-slate-700">
        <InfoChip
          icon={Droplets}
          label="Humidity"
          value={`${data.main.humidity}%`}
          tone="sky"
        />
        <InfoChip icon={Wind} label="Wind" value={`${data.wind.speed} km/h`} tone="emerald" />
        <InfoChip
          icon={Cloud}
          label="Visibility"
          value={`${(data.visibility / 1000).toFixed(1)} km`}
          tone="amber"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Gauge className="h-4 w-4" />
          Tap for full forecast
        </div>
        <span className="text-emerald-700 font-semibold">Open weather</span>
      </div>
    </div>
  );
};

export default WeatherWidget;

const InfoChip = ({
  icon: Icon,
  label,
  value,
  tone = "slate",
}: {
  icon: any;
  label: string;
  value: string;
  tone?: "emerald" | "amber" | "sky" | "slate";
}) => {
  const tones = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700" },
    amber: { bg: "bg-amber-50", text: "text-amber-700" },
    sky: { bg: "bg-sky-50", text: "text-sky-700" },
    slate: { bg: "bg-slate-50", text: "text-slate-700" },
  };
  const t = (tones as any)[tone] || tones.slate;
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-3 flex flex-col gap-1">
      <div className={`inline-flex items-center gap-1 text-[11px] font-semibold ${t.text}`}>
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
};
