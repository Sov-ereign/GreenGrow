import React from 'react';
import { Wheat, Sprout, Bug, Droplets, Calendar, TrendingUp } from 'lucide-react';

const Crops: React.FC = () => {
  const crops = [
    {
      id: 1,
      name: 'Wheat',
      area: '3.2 acres',
      stage: 'Flowering',
      health: 'Good',
      daysToHarvest: 45,
      expectedYield: '1,800 kg',
      image: 'https://images.pexels.com/photos/326082/pexels-photo-326082.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      name: 'Rice',
      area: '2.0 acres',
      stage: 'Vegetative',
      health: 'Excellent',
      daysToHarvest: 85,
      expectedYield: '2,200 kg',
      image: 'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      name: 'Corn',
      area: '1.5 acres',
      stage: 'Maturity',
      health: 'Fair',
      daysToHarvest: 15,
      expectedYield: '900 kg',
      image: 'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Excellent': return 'text-green-600 bg-green-50';
      case 'Good': return 'text-blue-600 bg-blue-50';
      case 'Fair': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Crop Management</h1>
        <p className="text-gray-600">Monitor and manage your crops for optimal yield</p>
      </div>

      {/* Crop Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {crops.map((crop) => (
          <div key={crop.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${crop.image})` }}>
              <div className="h-full bg-black bg-opacity-30 flex items-end p-4">
                <h3 className="text-xl font-bold text-white">{crop.name}</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500">Area</div>
                  <div className="font-semibold text-gray-800">{crop.area}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Stage</div>
                  <div className="font-semibold text-gray-800">{crop.stage}</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">Health Status</div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(crop.health)}`}>
                  {crop.health}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Days to Harvest</div>
                  <div className="font-semibold text-gray-800">{crop.daysToHarvest} days</div>
                </div>
                <div>
                  <div className="text-gray-500">Expected Yield</div>
                  <div className="font-semibold text-gray-800">{crop.expectedYield}</div>
                </div>
              </div>
              
              <button className="w-full mt-4 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Droplets className="h-6 w-6 text-blue-500" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Irrigation Schedule</h3>
          <p className="text-sm text-gray-600">Manage watering times</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bug className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Pest Control</h3>
          <p className="text-sm text-gray-600">Monitor pest activity</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sprout className="h-6 w-6 text-green-500" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Fertilizer Plan</h3>
          <p className="text-sm text-gray-600">Nutrient management</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-6 w-6 text-purple-500" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Harvest Calendar</h3>
          <p className="text-sm text-gray-600">Plan harvest dates</p>
        </div>
      </div>
    </div>
  );
};

export default Crops;