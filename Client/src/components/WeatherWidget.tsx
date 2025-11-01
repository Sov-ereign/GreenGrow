import React, { useEffect, useState } from "react";
import axios from "axios";
import { Cloud, Droplets, Wind, MapPin } from "lucide-react";
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

      // Try current weather API first
      let weatherData;
      try {
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        weatherData = res.data;
        // Use location from weather API only if reverse geocoding didn't work
        if (!nextLocation && res.data.name) {
          nextLocation = res.data.name;
        }
      } catch (currentErr: any) {
        // If current weather fails, use first day from forecast
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
            // Use location from forecast only if reverse geocoding didn't work
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
      
      // Final fallback if no location found
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
  }, [API_KEY]);

  if (!API_KEY) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
        <div className="text-sm">Weather API key missing</div>
        <div className="text-xs mt-1">Add VITE_WEATHER_API_KEY to Client/.env</div>
      </div>
    );
  }

  if (!data)
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
        Loading weather...
      </div>
    );

  return (
    <div
      className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl md:rounded-2xl shadow-md p-4 md:p-6 cursor-pointer hover:shadow-lg transition-all"
      onClick={() => navigate("/weather")}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base md:text-lg font-semibold text-gray-800 flex items-center truncate flex-1 min-w-0">
          <MapPin className="h-4 w-4 text-red-500 mr-1 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </h2>
        <img
          src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
          alt="Weather"
          className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0 ml-2"
        />
      </div>

      <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-1">
        {Math.round(data.main.temp)}°C
      </div>
      <div className="text-xs md:text-sm text-gray-600 capitalize mb-3">
        {data.weather[0].description}
      </div>

      <div className="flex justify-between text-xs md:text-sm text-gray-700">
        <div className="flex items-center">
          <Droplets className="h-4 w-4 text-blue-500 mr-1" />
          {data.main.humidity}%
        </div>
        <div className="flex items-center">
          <Wind className="h-4 w-4 text-green-500 mr-1" />
          {data.wind.speed} km/h
        </div>
        <div className="flex items-center">
          <Cloud className="h-4 w-4 text-yellow-500 mr-1" />
          {(data.visibility / 1000).toFixed(1)} km
        </div>
      </div>

      <div className="text-xs text-gray-400 text-right mt-3">
        Click for detailed forecast →
      </div>
    </div>
  );
};

export default WeatherWidget;

