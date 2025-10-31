import React from 'react';
import { Building2, FileText, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Schemes: React.FC = () => {
  const schemes = [
    {
      id: 1,
      name: 'PM-KISAN Samman Nidhi',
      description: 'Direct income support of ₹6,000 per year to small and marginal farmers',
      amount: '₹6,000/year',
      status: 'active',
      deadline: '2024-03-31',
      category: 'Income Support',
      eligibility: 'Small & Marginal Farmers'
    },
    {
      id: 2,
      name: 'Pradhan Mantri Fasal Bima Yojana',
      description: 'Crop insurance scheme providing financial support to farmers',
      amount: 'Up to ₹2,00,000',
      status: 'eligible',
      deadline: '2024-04-15',
      category: 'Insurance',
      eligibility: 'All Farmers'
    },
    {
      id: 3,
      name: 'Soil Health Card Scheme',
      description: 'Free soil testing and nutrient management recommendations',
      amount: 'Free Service',
      status: 'applied',
      deadline: '2024-05-30',
      category: 'Soil Health',
      eligibility: 'All Farmers'
    },
    {
      id: 4,
      name: 'Kisan Credit Card',
      description: 'Easy access to credit for agricultural and allied activities',
      amount: 'Up to ₹3,00,000',
      status: 'eligible',
      deadline: '2024-12-31',
      category: 'Credit',
      eligibility: 'All Farmers'
    },
    {
      id: 5,
      name: 'National Agriculture Market (e-NAM)',
      description: 'Online trading platform for agricultural commodities',
      amount: 'Better Prices',
      status: 'active',
      deadline: 'Ongoing',
      category: 'Marketing',
      eligibility: 'All Farmers'
    },
    {
      id: 6,
      name: 'Paramparagat Krishi Vikas Yojana',
      description: 'Promotion of organic farming practices',
      amount: '₹50,000/hectare',
      status: 'eligible',
      deadline: '2024-06-30',
      category: 'Organic Farming',
      eligibility: 'Organic Farmers'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'eligible': return 'bg-blue-100 text-blue-700';
      case 'applied': return 'bg-yellow-100 text-yellow-700';
      case 'expired': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'eligible': return <AlertCircle className="h-4 w-4" />;
      case 'applied': return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Government Schemes</h1>
        <p className="text-gray-600">Explore and apply for agricultural schemes and subsidies</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Active Schemes</h3>
          <p className="text-2xl font-bold text-gray-800">2</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Eligible For</h3>
          <p className="text-2xl font-bold text-gray-800">4</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Applied</h3>
          <p className="text-2xl font-bold text-gray-800">1</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Building2 className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Benefits</h3>
          <p className="text-2xl font-bold text-gray-800">₹8,000</p>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schemes.map((scheme) => (
          <div key={scheme.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-500" />
              </div>
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(scheme.status)}`}>
                {getStatusIcon(scheme.status)}
                <span className="capitalize">{scheme.status}</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">{scheme.name}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{scheme.description}</p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Benefit Amount</span>
                <span className="font-semibold text-green-600">{scheme.amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Category</span>
                <span className="text-sm font-medium text-gray-800">{scheme.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Eligibility</span>
                <span className="text-sm font-medium text-gray-800">{scheme.eligibility}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Deadline</span>
                <span className="text-sm font-medium text-red-600">{scheme.deadline}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
                {scheme.status === 'eligible' ? 'Apply Now' : 'View Details'}
              </button>
              <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schemes;