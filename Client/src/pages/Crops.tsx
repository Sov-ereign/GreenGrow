import React, { useState } from "react";

const Crops: React.FC = () => {
  const [crops, setCrops] = useState([
    {
      id: 1,
      name: "Wheat",
      area: "3.2 acres",
      stage: "Flowering",
      health: "Good",
      daysToHarvest: 45,
      expectedYield: "1,800 kg",
      image:
        "https://images.pexels.com/photos/326082/pexels-photo-326082.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 2,
      name: "Rice",
      area: "2.0 acres",
      stage: "Vegetative",
      health: "Excellent",
      daysToHarvest: 85,
      expectedYield: "2,200 kg",
      image:
        "https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      id: 3,
      name: "Corn",
      area: "1.5 acres",
      stage: "Maturity",
      health: "Fair",
      daysToHarvest: 15,
      expectedYield: "900 kg",
      image:
        "https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newCrop, setNewCrop] = useState({
    name: "",
    area: "",
    stage: "",
    health: "Good",
    daysToHarvest: "",
    expectedYield: "",
    image: "",
  });

  // Predefined image options
  const imageOptions = [
    {
      label: "Wheat",
      url: "https://images.pexels.com/photos/326082/pexels-photo-326082.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      label: "Rice",
      url: "https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      label: "Corn",
      url: "https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      label: "Other (Dummy)",
      url: "http://www.listercarterhomes.com/staff-member/natalie-naples/attachment/dummy-image-square/",
    },
  ];

  const handleAddCrop = (e: React.FormEvent) => {
    e.preventDefault();
    const cropToAdd = {
      ...newCrop,
      id: crops.length + 1,
      daysToHarvest: Number(newCrop.daysToHarvest),
    };
    setCrops([...crops, cropToAdd]);
    setNewCrop({
      name: "",
      area: "",
      stage: "",
      health: "Good",
      daysToHarvest: "",
      expectedYield: "",
      image: "",
    });
    setShowForm(false);
  };

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
      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Crop Management</h1>
          <p className="text-sm md:text-base text-gray-600">Monitor and manage your crops for optimal yield</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition text-sm md:text-base whitespace-nowrap"
        >
          + Add Crop
        </button>
      </div>

      {/* Crop Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
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
              
              <button className="w-full mt-4 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm md:text-base">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Crop Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Add New Crop</h2>
            <form onSubmit={handleAddCrop} className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={newCrop.name}
                onChange={(e) =>
                  setNewCrop({ ...newCrop, name: e.target.value })
                }
                className="w-full border rounded p-2 text-sm md:text-base"
                required
              />
              <input
                type="text"
                placeholder="Area"
                value={newCrop.area}
                onChange={(e) =>
                  setNewCrop({ ...newCrop, area: e.target.value })
                }
                className="w-full border rounded p-2 text-sm md:text-base"
              />
              <input
                type="text"
                placeholder="Stage"
                value={newCrop.stage}
                onChange={(e) =>
                  setNewCrop({ ...newCrop, stage: e.target.value })
                }
                className="w-full border rounded p-2 text-sm md:text-base"
              />
              <select
                value={newCrop.health}
                onChange={(e) =>
                  setNewCrop({ ...newCrop, health: e.target.value })
                }
                className="w-full border rounded p-2 text-sm md:text-base"
              >
                <option>Excellent</option>
                <option>Good</option>
                <option>Fair</option>
              </select>
              <input
                type="number"
                placeholder="Days to Harvest"
                value={newCrop.daysToHarvest}
                onChange={(e) =>
                  setNewCrop({ ...newCrop, daysToHarvest: e.target.value })
                }
                className="w-full border rounded p-2 text-sm md:text-base"
              />
              <input
                type="text"
                placeholder="Expected Yield"
                value={newCrop.expectedYield}
                onChange={(e) =>
                  setNewCrop({ ...newCrop, expectedYield: e.target.value })
                }
                className="w-full border rounded p-2 text-sm md:text-base"
              />

              {/* Image Dropdown */}
              <select
                value={newCrop.image}
                onChange={(e) =>
                  setNewCrop({ ...newCrop, image: e.target.value })
                }
                className="w-full border rounded p-2 text-sm md:text-base"
              >
                <option value="">Select Image</option>
                {imageOptions.map((opt) => (
                  <option key={opt.url} value={opt.url}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Preview */}
              {newCrop.image && (
                <img
                  src={newCrop.image}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded mt-2"
                />
              )}

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm md:text-base"
              >
                Add Crop
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Crops;
