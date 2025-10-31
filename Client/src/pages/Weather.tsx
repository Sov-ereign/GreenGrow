import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Cloud,
  Droplets,
  Thermometer,
  Wind,
  MapPin,
  Search,
} from "lucide-react";

const Weather: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [location, setLocation] = useState<string>("Detecting...");
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  if (!API_KEY) {
    return (
      <div className="p-6 text-gray-700">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Missing Weather API Key
          </h2>
          <p className="text-gray-600 mb-3">
            Please add your OpenWeather API key in a{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file:
          </p>
          <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono text-sm">
            VITE_WEATHER_API_KEY=your_openweather_api_key
          </code>
        </div>
      </div>
    );
  }

  // 🌿 Fetch weather by state name (India-specific)
  const fetchWeatherByState = async (state: string) => {
    try {
      const geoRes = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${state},IN&limit=1&appid=${API_KEY}`
      );
      if (!geoRes.data || geoRes.data.length === 0) {
        alert("State not found. Please try another name.");
        return;
      }
      const { lat, lon, name } = geoRes.data[0];
      setLocation(name);
      await fetchWeatherByCoords(lat, lon);
    } catch (err: any) {
      console.error("Error fetching weather:", err);
      alert("Error fetching weather for this state. Try again later.");
    }
  };

  // 🌾 Fetch suggestions (Indian states)
  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query},IN&limit=5&appid=${API_KEY}`
      );
      setSuggestions(res.data);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  // 🌤 Fetch weather by coordinates
  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      const currentRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      const weatherData = currentRes.data;

      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=8&units=metric&appid=${API_KEY}`
      );

      setData(weatherData);
      setForecast(forecastRes.data.list.slice(1));
      setLocation(weatherData.name);
    } catch (err) {
      console.error("Error fetching weather:", err);
      setLocation("Error fetching weather");
    }
  };

  // 🌎 Auto-detect location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeatherByState("Maharashtra")
      );
    } else {
      fetchWeatherByState("Maharashtra");
    }
  }, []);

  if (!data) return <div>Loading weather...</div>;

  const getDay = (dt: number) =>
    new Date(dt * 1000).toLocaleDateString("en-US", { weekday: "short" });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between relative">
        <div className="flex items-center mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-green-700">
            GreenGrow Weather
          </h1>
          <span className="flex items-center text-gray-600 ml-2 text-sm">
            <MapPin className="h-4 w-4 text-green-500 mr-1" /> {location}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <div className="flex items-center bg-white rounded-full shadow-md px-3 py-2">
            <Search className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search Indian state..."
              className="w-full focus:outline-none text-gray-700"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                fetchSuggestions(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim())
                  fetchWeatherByState(query.trim());
              }}
            />
          </div>

          {suggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-200 rounded-lg mt-2 w-full shadow-lg">
              {suggestions.map((s, index) => (
                <li
                  key={index}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-700"
                  onClick={() => {
                    fetchWeatherByState(s.name);
                    setSuggestions([]);
                    setQuery("");
                  }}
                >
                  {s.name}, {s.country}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Current Weather */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border-l-4 border-green-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <img
                src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
                alt="Weather"
                className="h-16 w-16"
              />
            </div>
            <div className="text-5xl font-bold text-gray-800 mb-2">
              {Math.round(data.main.temp)}°C
            </div>
            <div className="text-xl text-gray-600 mb-4 capitalize">
              {data.weather[0].description}
            </div>
            <div className="text-sm text-gray-500">
              Feels like {Math.round(data.main.feels_like)}°C
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Droplets className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-600">Humidity</div>
              <div className="text-2xl font-bold text-blue-600">
                {data.main.humidity}%
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Wind className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-600">
                Wind Speed
              </div>
              <div className="text-2xl font-bold text-green-600">
                {data.wind.speed} km/h
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Thermometer className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-600">Pressure</div>
              <div className="text-2xl font-bold text-red-600">
                {data.main.pressure} hPa
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Cloud className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-600">
                Visibility
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {(data.visibility / 1000).toFixed(1)} km
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-400">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          7-Day State Forecast
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {forecast.map((day, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-4 text-center hover:bg-green-50 transition-colors"
            >
              <div className="font-medium text-gray-800 mb-2">
                {getDay(day.dt)}
              </div>
              <img
                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                alt="Weather icon"
                className="mx-auto h-10 w-10 mb-2"
              />
              <div className="text-lg font-bold text-gray-800 mb-1">
                {Math.round(day.temp.day)}°C
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {day.weather[0].main}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Weather;
