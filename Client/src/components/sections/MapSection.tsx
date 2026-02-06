
import { useState } from "react";
import { motion } from "framer-motion";
import mapImage from "../../Images/green-india-map-DFG1YW.jpg";

// Map of India with states
const states = [
  { id: "AP", name: "Andhra Pradesh", active: true, position: { x: 55, y: 65 } },
  { id: "AR", name: "Arunachal Pradesh", active: false, position: { x: 88, y: 25 } },
  { id: "AS", name: "Assam", active: true, position: { x: 85, y: 32 } },
  { id: "BR", name: "Bihar", active: true, position: { x: 68, y: 42 } },
  { id: "CG", name: "Chhattisgarh", active: true, position: { x: 58, y: 55 } },
  { id: "GA", name: "Goa", active: false, position: { x: 35, y: 68 } },
  { id: "GJ", name: "Gujarat", active: true, position: { x: 32, y: 48 } },
  { id: "HR", name: "Haryana", active: true, position: { x: 45, y: 32 } },
  { id: "HP", name: "Himachal Pradesh", active: false, position: { x: 48, y: 25 } },
  { id: "JH", name: "Jharkhand", active: true, position: { x: 68, y: 48 } },
  { id: "KA", name: "Karnataka", active: true, position: { x: 42, y: 72 } },
  { id: "KL", name: "Kerala", active: true, position: { x: 42, y: 85 } },
  { id: "MP", name: "Madhya Pradesh", active: true, position: { x: 50, y: 50 } },
  { id: "MH", name: "Maharashtra", active: true, position: { x: 42, y: 60 } },
  { id: "MN", name: "Manipur", active: false, position: { x: 88, y: 42 } },
  { id: "ML", name: "Meghalaya", active: false, position: { x: 82, y: 38 } },
  { id: "MZ", name: "Mizoram", active: false, position: { x: 90, y: 45 } },
  { id: "NL", name: "Nagaland", active: false, position: { x: 92, y: 38 } },
  { id: "OD", name: "Odisha", active: true, position: { x: 65, y: 58 } },
  { id: "PB", name: "Punjab", active: true, position: { x: 42, y: 28 } },
  { id: "RJ", name: "Rajasthan", active: true, position: { x: 38, y: 38 } },
  { id: "SK", name: "Sikkim", active: false, position: { x: 78, y: 32 } },
  { id: "TN", name: "Tamil Nadu", active: true, position: { x: 48, y: 80 } },
  { id: "TG", name: "Telangana", active: true, position: { x: 52, y: 62 } },
  { id: "TR", name: "Tripura", active: false, position: { x: 85, y: 45 } },
  { id: "UK", name: "Uttarakhand", active: false, position: { x: 52, y: 28 } },
  { id: "UP", name: "Uttar Pradesh", active: true, position: { x: 58, y: 38 } },
  { id: "WB", name: "West Bengal", active: true, position: { x: 75, y: 48 } }
];



// Helper function to generate random crops based on state
function generateRandomCrops(state: string) {
  const allCrops = [
    "Rice", "Wheat", "Maize", "Barley", "Jowar", "Bajra", "Ragi",
    "Cotton", "Jute", "Sugarcane", "Tea", "Coffee", "Rubber",
    "Coconut", "Cashew", "Mango", "Banana", "Orange", "Pineapple",
    "Potato", "Tomato", "Onion", "Cauliflower", "Cabbage", "Brinjal",
    "Chilli", "Turmeric", "Ginger", "Cardamom", "Black Pepper"
  ];

  // Instead of fully random, have some state-specific crops
  const stateSpecificCrops: Record<string, string[]> = {
    "Punjab": ["Wheat", "Rice", "Barley", "Sugarcane", "Cotton"],
    "Kerala": ["Coconut", "Rubber", "Tea", "Coffee", "Black Pepper"],
    "Tamil Nadu": ["Rice", "Sugarcane", "Banana", "Coconut", "Tea"],
    "Maharashtra": ["Cotton", "Sugarcane", "Onion", "Jowar", "Soybean"],
    "Gujarat": ["Cotton", "Groundnut", "Dates", "Sugarcane", "Bajra"],
    "Uttar Pradesh": ["Wheat", "Rice", "Sugarcane", "Potato", "Mustard"],
    "West Bengal": ["Rice", "Jute", "Tea", "Potato", "Wheat"],
    "Andhra Pradesh": ["Rice", "Chilli", "Cotton", "Sugarcane", "Tobacco"]
  };

  // Return specific crops if available, otherwise random selection
  if (state in stateSpecificCrops) {
    return stateSpecificCrops[state];
  } else {
    // Randomly select 4-5 crops
    const numCrops = 4 + Math.floor(Math.random() * 2);
    const shuffled = [...allCrops].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numCrops);
  }
}

export default function MapSection() {
  const [activeState, setActiveState] = useState<string | null>(null);
  const [stateCounts] = useState({
    farmers: {
      "Andhra Pradesh": 5420,
      "Assam": 3218,
      "Bihar": 4876,
      "Chhattisgarh": 3654,
      "Gujarat": 5982,
      "Haryana": 4321,
      "Jharkhand": 2765,
      "Karnataka": 6124,
      "Kerala": 3421,
      "Madhya Pradesh": 5678,
      "Maharashtra": 7421,
      "Odisha": 4321,
      "Punjab": 6543,
      "Rajasthan": 5432,
      "Tamil Nadu": 5876,
      "Telangana": 4567,
      "Uttar Pradesh": 8765,
      "West Bengal": 5432
    },
    hectares: {
      "Andhra Pradesh": 12450,
      "Assam": 8750,
      "Bihar": 11350,
      "Chhattisgarh": 9870,
      "Gujarat": 14650,
      "Haryana": 12540,
      "Jharkhand": 7650,
      "Karnataka": 15432,
      "Kerala": 8970,
      "Madhya Pradesh": 16540,
      "Maharashtra": 18750,
      "Odisha": 10650,
      "Punjab": 14320,
      "Rajasthan": 15670,
      "Tamil Nadu": 13450,
      "Telangana": 11760,
      "Uttar Pradesh": 21540,
      "West Bengal": 13650
    }
  });

  return (
    <section className="py-24 bg-agri-50/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-agri-600 font-semibold uppercase tracking-wider text-sm">Nationwide Impact</span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-2">
            GreenGrow Across India
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
            Our platform is active across multiple states in India, helping thousands of farmers improve their agricultural practices.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
          {/* Map visualization */}
          <div className="w-full lg:w-1/2 relative bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="relative w-full aspect-[4/5] border border-agri-100 rounded-xl overflow-hidden bg-white/50">
              {/* Background Map Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={mapImage}
                  alt="India Map"
                  className="w-full h-full object-contain opacity-80"
                />
              </div>

              {/* India outline - simplified representation */}
              <div className="absolute inset-0 p-4 z-10">
                {/* Map points for each state */}
                {states.map((state) => (
                  <motion.div
                    key={state.id}
                    className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group`}
                    style={{ left: `${state.position.x}%`, top: `${state.position.y}%` }}
                    whileHover={{ scale: 1.2 }}
                    onMouseEnter={() => state.active && setActiveState(state.name)}
                    onMouseLeave={() => setActiveState(null)}
                  >
                    <div
                      className={`w-4 h-4 rounded-full transition-all duration-300 ${state.active
                        ? "bg-agri-500 shadow-lg shadow-agri-400/50 group-hover:bg-agri-600 ring-2 ring-white"
                        : "bg-gray-200"
                        }`}
                    />
                    {state.active && (
                      <motion.div
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-0.5 h-8 origin-top"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.3, delay: Math.random() * 0.5 }}
                      >
                        <div className="w-full h-full bg-agri-200" />
                      </motion.div>
                    )}
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100 pointer-events-none z-10">
                      {state.name}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-agri-500 shadow-sm shadow-agri-500/50"></div>
                <span className="font-medium">Active States</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                <span>Coming Soon</span>
              </div>
            </div>
          </div>

          {/* State information */}
          <div className="w-full lg:w-1/2 h-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 h-full flex flex-col justify-center min-h-[500px]">
              <h3 className="text-3xl font-bold mb-8 text-gray-900 border-b border-gray-100 pb-4">
                {activeState ? activeState : "Select a State"}
              </h3>

              {activeState && stateCounts.farmers[activeState as keyof typeof stateCounts.farmers] ? (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-agri-50/80 p-6 rounded-xl border border-agri-100 text-center hover:bg-agri-100 transition-colors">
                      <h4 className="text-sm text-agri-700 font-semibold uppercase tracking-wider mb-2">Farmers Connected</h4>
                      <p className="text-4xl font-bold text-agri-600">
                        {stateCounts.farmers[activeState as keyof typeof stateCounts.farmers].toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-leaf-50/80 p-6 rounded-xl border border-leaf-100 text-center hover:bg-leaf-100 transition-colors">
                      <h4 className="text-sm text-leaf-700 font-semibold uppercase tracking-wider mb-2">Hectares Analyzed</h4>
                      <p className="text-4xl font-bold text-leaf-600">
                        {stateCounts.hectares[activeState as keyof typeof stateCounts.hectares].toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <p className="text-gray-700 leading-relaxed italic">
                      "In {activeState}, we're actively helping farmers optimize their agricultural practices
                      through AI-driven soil analysis and localized weather forecasting."
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-4">Primary Crops in Region</h4>
                    <div className="flex flex-wrap gap-2">
                      {generateRandomCrops(activeState).map((crop, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-white rounded-full text-agri-700 font-medium text-sm border border-agri-100 shadow-sm hover:shadow-md transition-shadow cursor-default"
                        >
                          {crop}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🗺️</span>
                  </div>
                  <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                    Hover over the active green dots on the map to see detailed impact statistics and crop information for that specific region.
                  </p>

                  <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-gray-900">18</p>
                      <p className="text-xs text-gray-500 uppercase font-semibold">States Active</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-gray-900">85k+</p>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Farmers</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
