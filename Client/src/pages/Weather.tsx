import React from 'react';
import { Cloud, Droplets, Wind, Sun, CloudRain, Thermometer } from 'lucide-react';

const Weather: React.FC = () => {
  const weeklyForecast = [
    { day: 'Today', temp: '28°C', condition: 'Partly Cloudy', icon: Cloud, humidity: '65%', wind: '12 km/h' },
    { day: 'Tomorrow', temp: '29°C', condition: 'Sunny', icon: Sun, humidity: '58%', wind: '8 km/h' },
    { day: 'Wednesday', temp: '27°C', condition: 'Light Rain', icon: CloudRain, humidity: '78%', wind: '15 km/h' },
    { day: 'Thursday', temp: '25°C', condition: 'Rainy', icon: CloudRain, humidity: '85%', wind: '18 km/h' },
    { day: 'Friday', temp: '26°C', condition: 'Partly Cloudy', icon: Cloud, humidity: '70%', wind: '10 km/h' },
    { day: 'Saturday', temp: '28°C', condition: 'Sunny', icon: Sun, humidity: '55%', wind: '6 km/h' },
    { day: 'Sunday', temp: '30°C', condition: 'Sunny', icon: Sun, humidity: '50%', wind: '5 km/h' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Weather Forecast</h1>
        <p className="text-gray-600">Detailed weather information for your farming decisions</p>
      </div>

      {/* Current Weather */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cloud className="h-12 w-12 text-blue-500" />
            </div>
            <div className="text-5xl font-bold text-gray-800 mb-2">28°C</div>
            <div className="text-xl text-gray-600 mb-4">Partly Cloudy</div>
            <div className="text-sm text-gray-500">Feels like 31°C</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Droplets className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-600">Humidity</div>
              <div className="text-2xl font-bold text-blue-600">65%</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Wind className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-600">Wind Speed</div>
              <div className="text-2xl font-bold text-green-600">12 km/h</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Thermometer className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-600">Pressure</div>
              <div className="text-2xl font-bold text-red-600">1013 hPa</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Sun className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-600">UV Index</div>
              <div className="text-2xl font-bold text-yellow-600">6</div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">7-Day Forecast</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          {weeklyForecast.map((day, index) => {
            const Icon = day.icon;
            return (
              <div key={index} className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
                <div className="font-medium text-gray-800 mb-2">{day.day}</div>
                <Icon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-800 mb-1">{day.temp}</div>
                <div className="text-sm text-gray-600 mb-3">{day.condition}</div>
                <div className="space-y-1 text-xs text-gray-500">
                  <div>💧 {day.humidity}</div>
                  <div>💨 {day.wind}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Weather;