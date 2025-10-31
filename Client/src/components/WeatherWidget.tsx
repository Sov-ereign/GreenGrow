import React, { useEffect, useState } from "react";
import axios from "axios";
import { Cloud, Droplets, Wind, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WeatherWidget: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [location, setLocation] = useState<string>("Detecting...");
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  const navigate = useNavigate();

  // Fetch weather by coordinates
  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      const reverseGeo = await axios.get(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
      );
      const city = reverseGeo.data[0]?.name || "Unknown";
      setLocation(city);

      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      setData(res.data);
    } catch (err) {
      console.error("Error fetching weather:", err);
      setLocation("Kolkata");
    }
  };

  // Detect user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeatherByCoords(22.5726, 88.3639) // Default: Kolkata
      );
    } else {
      fetchWeatherByCoords(22.5726, 88.3639);
    }
  }, []);

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
