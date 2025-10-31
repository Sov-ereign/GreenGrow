import React from 'react';
import { Cloud, Droplets, Thermometer, Wind } from 'lucide-react';

const WeatherWidget: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Cloud className="h-5 w-5 text-blue-500 mr-2" />
        Weather Today
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800">28°C</div>
          <div className="text-sm text-gray-500">Partly Cloudy</div>
        </div>
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Cloud className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center bg-gray-50 rounded-xl p-3">
          <Droplets className="h-5 w-5 text-blue-500 mx-auto mb-2" />
          <div className="text-sm font-medium text-gray-800">Humidity</div>
          <div className="text-lg font-semibold text-blue-600">65%</div>
        </div>
        <div className="text-center bg-gray-50 rounded-xl p-3">
          <Wind className="h-5 w-5 text-green-500 mx-auto mb-2" />
          <div className="text-sm font-medium text-gray-800">Wind Speed</div>
          <div className="text-lg font-semibold text-green-600">12 km/h</div>
        </div>
        <div className="text-center bg-gray-50 rounded-xl p-3">
          <Thermometer className="h-5 w-5 text-red-500 mx-auto mb-2" />
          <div className="text-sm font-medium text-gray-800">Feels Like</div>
          <div className="text-lg font-semibold text-red-600">31°C</div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-3">7-Day Forecast</h4>
        <div className="flex justify-between text-sm">
          <div className="text-center">
            <div className="text-gray-500">Mon</div>
            <div className="text-gray-800 font-medium">29°</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Tue</div>
            <div className="text-gray-800 font-medium">27°</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Wed</div>
            <div className="text-gray-800 font-medium">25°</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Thu</div>
            <div className="text-gray-800 font-medium">26°</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Fri</div>
            <div className="text-gray-800 font-medium">28°</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;