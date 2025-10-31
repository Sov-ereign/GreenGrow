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
      // Try current weather API first
      let weatherData;
      try {
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        weatherData = res.data;
        if (res.data.name) {
          setLocation(res.data.name);
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
            if (forecastRes.data.city?.name) {
              setLocation(forecastRes.data.city.name);
            }
          }
        } catch (forecastErr) {
          throw currentErr; // Throw original error
        }
      }
      
      if (weatherData) {
        setData(weatherData);
      }
      
      // If location still not set, try reverse geocoding or use coordinates
      if (location === "Detecting...") {
        try {
          const reverseGeo = await axios.get(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
          );
          if (reverseGeo.data?.[0]?.name) {
            setLocation(reverseGeo.data[0].name);
          } else {
            setLocation(`${lat.toFixed(2)}, ${lon.toFixed(2)}`);
          }
        } catch (geoErr) {
          setLocation(`${lat.toFixed(2)}, ${lon.toFixed(2)}`);
        }
      }
    } catch (err: any) {
      console.error("Error fetching weather:", err);
      if (err?.response?.status === 401) {
        setLocation("Invalid API Key");
      } else {
        setLocation("Error");
      }
    }
  };

  // Detect user location
  useEffect(() => {
    if (!API_KEY) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeatherByCoords(22.5726, 88.3639) // Default: Kolkata
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
      className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all"
      onClick={() => navigate("/weather")}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <MapPin className="h-4 w-4 text-red-500 mr-1" />
          {location}
        </h2>
        <img
          src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
          alt="Weather"
          className="h-12 w-12"
        />
      </div>

      <div className="text-4xl font-bold text-gray-800 mb-1">
        {Math.round(data.main.temp)}°C
      </div>
      <div className="text-sm text-gray-600 capitalize mb-3">
        {data.weather[0].description}
      </div>

      <div className="flex justify-between text-sm text-gray-700">
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
