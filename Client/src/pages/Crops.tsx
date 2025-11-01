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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Crop Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          + Add Crop
        </button>
      </div>

      {/* Crop Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {crops.map((crop) => (
          <div
            key={crop.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
          >
            <img src={crop.image} alt={crop.name} className="h-48 w-full object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-bold">{crop.name}</h3>
              <p className="text-sm text-gray-600">{crop.area}</p>
              <p className="text-sm text-gray-600">Stage: {crop.stage}</p>
              <p className="text-sm text-gray-600">Health: {crop.health}</p>
              <p className="text-sm text-gray-600">
                Harvest in {crop.daysToHarvest} days
              </p>
              <p className="text-sm text-gray-600">
                Yield: {crop.expectedYield}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-96 p-6 relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
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
                className="w-full border rounded p-2"
                required
              />
              <input
                type="text"
                placeholder="Area"
                value={newCrop.area}
                onChange={(e) =>
                  setNewCrop({ ...newCrop, area: e.target.value })
                }
                className="w-full border rounded p-2"
              />
              <input
                type="text"
                placeholder="Stage"
                value={newCrop.stage}
                onChange={(e) =>
                  setNewCrop({ ...newCrop, stage: e.target.value })
                }
                className="w-full border rounded p-2"
              />
              <select
                value={newCrop.health}
                onChange={(e) =>
                  setNewCrop({ ...newCrop, health: e.target.value })
                }
                className="w-full border rounded p-2"
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
                className="w-full border rounded p-2"
              />
              <input
                type="text"
                placeholder="Expected Yield"
                value={newCrop.expectedYield}
                onChange={(e) =>
                  setNewCrop({ ...newCrop, expectedYield: e.target.value })
                }
                className="w-full border rounded p-2"
              />

              {/* Image Dropdown */}
              <select
                value={newCrop.image}
                onChange={(e) =>
                  setNewCrop({ ...newCrop, image: e.target.value })
                }
                className="w-full border rounded p-2"
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
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
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
