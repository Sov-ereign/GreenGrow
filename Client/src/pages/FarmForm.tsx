import React, { useState } from "react";
import { Save, BarChart3, IndianRupee, Wheat, Calendar } from "lucide-react";

const FarmForm = () => {
  const [formData, setFormData] = useState({
    totalYield: "2450",
    revenue: "123000",
    farmSize: "5.2",
    daysToHarvest: "45",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <BarChart3 className="text-green-600 w-6 h-6" />
        Farm Performance Details
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Total Yield */}
        <div>
          <label className="block text-gray-600 font-medium mb-2">
            Total Yield (kg)
          </label>
          <div className="relative">
            <Wheat className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="number"
              name="totalYield"
              value={formData.totalYield}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              placeholder="Enter total yield in kg"
            />
          </div>
        </div>

        {/* Revenue */}
        <div>
          <label className="block text-gray-600 font-medium mb-2">
            Revenue (₹)
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="number"
              name="revenue"
              value={formData.revenue}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              placeholder="Enter revenue in INR"
            />
          </div>
        </div>

        {/* Farm Size */}
        <div>
          <label className="block text-gray-600 font-medium mb-2">
            Farm Size (acres)
          </label>
          <div className="relative">
            <BarChart3 className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="number"
              name="farmSize"
              value={formData.farmSize}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              placeholder="Enter farm size in acres"
              step="0.1"
            />
          </div>
        </div>

        {/* Days to Harvest */}
        <div>
          <label className="block text-gray-600 font-medium mb-2">
            Days to Harvest
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="number"
              name="daysToHarvest"
              value={formData.daysToHarvest}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              placeholder="Enter number of days"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
        >
          <Save className="w-5 h-5" />
          Save Details
        </button>
      </form>
    </div>
  );
};

export default FarmForm;
