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

  // Early return if API key is missing
  if (!API_KEY) {
    return (
      <div className="p-6 text-gray-700">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Weather API Key Missing</h2>
          <p className="text-gray-600 mb-3">
            To enable weather features, create a <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file in the <code className="bg-gray-100 px-2 py-1 rounded">Client</code> directory with:
          </p>
          <code className="block bg-gray-800 text-green-400 p-3 rounded font-mono text-sm">
            VITE_WEATHER_API_KEY=your_openweather_api_key
          </code>
          <p className="text-sm text-gray-500 mt-3">
            Get your free API key from{" "}
            <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              openweathermap.org
            </a>
            . Then restart your dev server.
          </p>
        </div>
      </div>
    );
  }

  // Fetch weather by city name (using Geocoding API + Daily Forecast API)
  const fetchWeatherByCity = async (city: string) => {
    try {
      // First get coordinates from city name using Geocoding API
      const geoRes = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
      );
      if (!geoRes.data || geoRes.data.length === 0) {
        alert("City not found. Please try another name.");
        return;
      }
      const { lat, lon, name } = geoRes.data[0];
      setLocation(name);
      // Fetch weather using coordinates
      await fetchWeatherByCoords(lat, lon);
    } catch (err: any) {
      console.error("Error fetching weather:", err);
      if (err?.response?.status === 401) {
        alert("API key issue. Please check your OpenWeather Student Plan access.");
      } else {
        alert("City not found. Please try another name.");
      }
    }
  };


  // Fetch city name suggestions
  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      setSuggestions(res.data);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  // Fetch weather by coordinates using Current Weather + Daily Forecast (Student Plan compatible)
  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      // Get accurate location name first using reverse geocoding
      let nextLocation: string | null = null;
      try {
        const reverseGeo = await axios.get(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
        );
        if (reverseGeo.data?.[0]) {
          const geo = reverseGeo.data[0];
          // Format: City, State, Country (if available)
          const parts = [];
          if (geo.name) parts.push(geo.name);
          if (geo.state && geo.state !== geo.name) parts.push(geo.state);
          if (geo.country) parts.push(geo.country);
          nextLocation = parts.length > 0 ? parts.join(", ") : geo.name || null;
        }
      } catch (reverseErr) {
        console.warn("Reverse geocoding failed, will try other methods:", reverseErr);
      }

      // Get current weather (using current weather API which should be free tier)
      let weatherData;
      let cityName = "";
      
      try {
        const currentRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        weatherData = currentRes.data;
        cityName = currentRes.data.name || "";
        // Use location from weather API only if reverse geocoding didn't work
        if (!nextLocation && cityName) {
          nextLocation = cityName;
        }
      } catch (currentErr: any) {
        // If current weather fails, try to get data from forecast endpoint
        console.warn("Current weather API failed, using forecast data:", currentErr?.response?.status);
      }
      
      // Get 8-day forecast (today + 7 future days) - this endpoint works with Student Plan
      // We'll skip today to show next 7 days
      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=8&units=metric&appid=${API_KEY}`
      );
      
      // If we don't have current weather data, use first day of forecast as current
      if (!weatherData && forecastRes.data.list && forecastRes.data.list.length > 0) {
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
            speed: (firstDay.speed || 0) * 3.6, // Convert m/s to km/h
          },
          visibility: 10000,
          coord: { lat, lon },
        };
      }

      // Use location from forecast only if reverse geocoding and weather API didn't work
      if (!nextLocation && forecastRes.data.city?.name) {
        nextLocation = forecastRes.data.city.name;
      }
      if (!nextLocation && cityName) {
        nextLocation = cityName;
      }
      
      if (weatherData) {
        setData(weatherData);
      }

      // Final fallback if no location found
      if (!nextLocation) {
        nextLocation = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      }
      setLocation(nextLocation);
      
      // Set forecast (skip today, take next 7 days from the list)
      // The API returns 8 days (we requested cnt=8), first one is today, so we take the remaining 7
      if (forecastRes.data.list && forecastRes.data.list.length > 1) {
        setForecast(forecastRes.data.list.slice(1)); // Skip today, take remaining days
      } else if (forecastRes.data.list && forecastRes.data.list.length > 0) {
        // If only one day returned, use it (edge case)
        setForecast(forecastRes.data.list);
      }
      
    } catch (err: any) {
      console.error("Error fetching weather:", err);
      if (err?.response?.status === 401) {
        setLocation("API Key Issue");
        alert("OpenWeather API key issue. Please verify your Student Plan access.");
      } else {
        setLocation("Error loading weather");
        console.error("Weather fetch error details:", err.response?.data || err.message);
      }
    }
  };

  // Detect user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Use high accuracy coordinates
          fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation error:", error);
          // Try fallback to default location
          fetchWeatherByCoords(22.5726, 88.3639); // Default: Kolkata
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // Cache for 5 minutes
        }
      );
    } else {
      fetchWeatherByCoords(22.5726, 88.3639);
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
          <h1 className="text-3xl font-bold text-gray-800">Weather Forecast</h1>
          <span className="flex items-center text-gray-500 ml-2 text-sm">
            <MapPin className="h-4 w-4 text-red-500 mr-1" /> {location}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <div className="flex items-center bg-white rounded-full shadow-md px-3 py-2">
            <Search className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search city..."
              className="w-full focus:outline-none text-gray-700"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                fetchSuggestions(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim())
                  fetchWeatherByCity(query.trim());
              }}
            />
          </div>

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-200 rounded-lg mt-2 w-full shadow-lg">
              {suggestions.map((s, index) => (
                <li
                  key={index}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-700"
                  onClick={() => {
                    fetchWeatherByCity(s.name);
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
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
              <div className="text-sm font-medium text-gray-600">Wind Speed</div>
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
              <div className="text-sm font-medium text-gray-600">Visibility</div>
              <div className="text-2xl font-bold text-yellow-600">
                {(data.visibility / 1000).toFixed(1)} km
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          7-Day Forecast
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {forecast.map((day, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors"
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