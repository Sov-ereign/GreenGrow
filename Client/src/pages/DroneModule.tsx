import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Droplets, 
  MapPin, 
  Activity, 
  Wifi, 
  Battery, 
  Play, 
  Pause, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap 
} from 'lucide-react';

const DroneAgriculturalDashboard = () => {
  const [activeTab, setActiveTab] = useState('monitoring');
  const [healthMapData, setHealthMapData] = useState([]);
  const [detectedDiseases, setDetectedDiseases] = useState([]);
  const [precisionInputs, setPrecisionInputs] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSpraying, setIsSpraying] = useState(false);

  // Simulated drone data
  const drones = [
    {
      id: 1,
      name: "AgriDrone Alpha",
      status: "active",
      battery: 85,
      signal: 98,
      location: { lat: 40.7128, lng: -74.0060 },
      type: "Multispectral",
      capabilities: ["AI Detection", "NDVI Mapping", "Spraying"]
    },
    {
      id: 2,
      name: "AgriDrone Beta",
      status: "charging",
      battery: 23,
      signal: 85,
      location: { lat: 40.7589, lng: -73.9851 },
      type: "Precision Sprayer",
      capabilities: ["Fertilizer Application", "Pesticide Spraying"]
    }
  ];

  // Crop monitoring data
  const cropStats = {
    totalPlants: 12847,
    healthyPlants: 11203,
    affectedPlants: 1644,
    avgNDVI: 0.75,
    canopyCoverage: 82,
    lastUpdate: "15 minutes ago"
  };

  // AI Disease Detection based on heatmap analysis
  const analyzeHealthMapForDiseases = (healthData) => {
    const diseases = [];
    const inputs = [];
    
    const criticalAreas = healthData.filter(cell => cell.health < 0.4);
    
    if (criticalAreas.length > 0) {
      // Disease cluster 1
      const diseaseCluster1 = criticalAreas.filter(cell => 
        cell.row >= 8 && cell.row <= 12 && cell.col >= 15 && cell.col <= 19
      );
      
      if (diseaseCluster1.length > 8) {
        const diseaseId1 = 'disease_1';
        diseases.push({
          id: diseaseId1,
          type: "Fusarium Head Blight",
          severity: "High",
          location: "Grid Sector C-4 to C-5",
          coordinates: { startRow: 8, endRow: 12, startCol: 15, endCol: 19 },
          confidence: 92,
          area: diseaseCluster1.length * 0.19,
          symptoms: ["Premature bleaching", "Pink/orange fungal growth", "Reduced grain fill"],
          timestamp: "Detected via AI analysis",
          affectedCells: diseaseCluster1
        });
        
        inputs.push({
          id: 'input_1',
          diseaseId: diseaseId1,
          type: "Fungicide Application",
          product: "Prothioconazole + Tebuconazole",
          rate: "1.2 L/ha",
          method: "Precision Drone Spraying",
          urgency: "High",
          estimatedCost: "$145/ha",
          applicationWindow: "Next 24-48 hours"
        });
      }
      
      // Water stress area
      const waterStressArea = criticalAreas.filter(cell => 
        cell.row >= 18 && cell.row <= 22 && cell.col >= 5 && cell.col <= 10
      );
      
      if (waterStressArea.length > 6) {
        const diseaseId2 = 'disease_2';
        diseases.push({
          id: diseaseId2,
          type: "Water Stress / Drought",
          severity: "Medium",
          location: "Grid Sector A-6 to B-6",
          coordinates: { startRow: 18, endRow: 22, startCol: 5, endCol: 10 },
          confidence: 87,
          area: waterStressArea.length * 0.19,
          symptoms: ["Leaf wilting", "Reduced NDVI", "Stunted growth"],
          timestamp: "Detected via AI analysis",
          affectedCells: waterStressArea
        });
        
        inputs.push({
          id: 'input_2',
          diseaseId: diseaseId2,
          type: "Irrigation + Foliar Nutrition",
          product: "Liquid Fertilizer (20-20-20 + Micronutrients)",
          rate: "2.5 L/ha",
          method: "Precision Drone Application",
          urgency: "Medium",
          estimatedCost: "$85/ha",
          applicationWindow: "Within 72 hours"
        });
      }
      
      // Nutrient deficiency
      const nutrientDefArea = criticalAreas.filter(cell => 
        cell.row < 5 && cell.col > 18
      );
      
      if (nutrientDefArea.length > 4) {
        const diseaseId3 = 'disease_3';
        diseases.push({
          id: diseaseId3,
          type: "Nitrogen Deficiency",
          severity: "Medium",
          location: "Grid Sector E-1",
          coordinates: { startRow: 0, endRow: 5, startCol: 18, endCol: 25 },
          confidence: 79,
          area: nutrientDefArea.length * 0.19,
          symptoms: ["Yellowing leaves", "Reduced vigor", "Lower NDVI values"],
          timestamp: "Detected via AI analysis",
          affectedCells: nutrientDefArea
        });
        
        inputs.push({
          id: 'input_3',
          diseaseId: diseaseId3,
          type: "Nitrogen Application",
          product: "Urea (46-0-0)",
          rate: "50 kg/ha",
          method: "Variable Rate Application",
          urgency: "Low",
          estimatedCost: "$42/ha",
          applicationWindow: "Within 1 week"
        });
      }
    }
    
    return { diseases, inputs };
  };

  // Generate field heat map and analyze
  useEffect(() => {
    const generateFieldHeatMap = () => {
      const data = [];
      const gridSize = 25;
      
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          let health = 0.7;
          
          if ((row > 8 && row < 12) && (col > 15 && col < 19)) {
            health = 0.2 + Math.random() * 0.3;
          }
          else if ((row > 18 && row < 22) && (col > 5 && col < 10)) {
            health = 0.4 + Math.random() * 0.2;
          }
          else if (row < 5 && col > 18) {
            health = 0.3 + Math.random() * 0.3;
          }
          else {
            health = 0.65 + Math.random() * 0.3;
          }
          
          data.push({
            row,
            col,
            x: (col / gridSize) * 100,
            y: (row / gridSize) * 100,
            health: Math.min(1, health),
            ndvi: 0.3 + (health * 0.5)
          });
        }
      }
      
      setHealthMapData(data);
      
      const analysis = analyzeHealthMapForDiseases(data);
      setDetectedDiseases(analysis.diseases);
      setPrecisionInputs(analysis.inputs);
    };
    
    generateFieldHeatMap();
  }, []);

  const getHealthColor = (health) => {
    if (health > 0.8) return '#22c55e';
    if (health > 0.6) return '#eab308';
    if (health > 0.4) return '#f97316';
    return '#ef4444';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartSpraying = () => {
    setIsSpraying(true);
    setTimeout(() => setIsSpraying(false), 8000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Drone Agriculture Hub
              </h1>
              <p className="text-gray-600 mt-2">AI-Powered Precision Agriculture Solutions</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">Live Monitoring</span>
              </div>
              <button className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl mb-6 border border-white/20">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'monitoring', label: 'Smart Monitoring', icon: Activity },
              { id: 'detection', label: 'AI Disease Detection', icon: Camera },
              { id: 'spraying', label: 'Precision Application', icon: Droplets },
              { id: 'drones', label: 'Drone Management', icon: Zap }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 transition-all ${
                  activeTab === id 
                    ? 'border-b-2 border-emerald-500 bg-emerald-50 text-emerald-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Smart Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Crop Health Map */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Drone-Captured Field Health Map</h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Healthy</span>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full ml-3"></div>
                  <span className="text-sm text-gray-600">Caution</span>
                  <div className="w-3 h-3 bg-red-500 rounded-full ml-3"></div>
                  <span className="text-sm text-gray-600">Critical</span>
                </div>
              </div>
              <div className="relative bg-gradient-to-b from-green-100 to-green-200 rounded-xl overflow-hidden" style={{ height: '400px' }}>
                <div className="absolute inset-2 border-2 border-green-700 border-dashed rounded-lg"></div>
                
                <svg width="100%" height="100%" className="absolute inset-0">
                  {healthMapData.map((cell, index) => {
                    const isSelectedArea = selectedArea && 
                      cell.row >= selectedArea.startRow && cell.row <= selectedArea.endRow &&
                      cell.col >= selectedArea.startCol && cell.col <= selectedArea.endCol;
                    
                    return (
                      <rect
                        key={index}
                        x={`${cell.x}%`}
                        y={`${cell.y}%`}
                        width="4%"
                        height="4%"
                        fill={getHealthColor(cell.health)}
                        opacity={isSelectedArea ? "1.0" : "0.85"}
                        stroke={isSelectedArea ? "#fff" : "none"}
                        strokeWidth={isSelectedArea ? "1" : "0"}
                        className="transition-all duration-300 hover:opacity-100 cursor-pointer"
                        onClick={() => {
                          const affectedDisease = detectedDiseases.find(disease => 
                            disease.affectedCells && disease.affectedCells.some(affectedCell => 
                              affectedCell.row === cell.row && affectedCell.col === cell.col
                            )
                          );
                          if (affectedDisease) {
                            setSelectedArea(affectedDisease.coordinates);
                          }
                        }}
                      >
                        <title>{`Health: ${(cell.health * 100).toFixed(1)}% | NDVI: ${cell.ndvi.toFixed(2)}`}</title>
                      </rect>
                    );
                  })}
                  
                  {[...Array(6)].map((_, i) => (
                    <line
                      key={`row-${i}`}
                      x1="5%"
                      y1={`${15 + i * 12}%`}
                      x2="95%"
                      y2={`${15 + i * 12}%`}
                      stroke="#22c55e"
                      strokeWidth="0.5"
                      opacity="0.3"
                      strokeDasharray="2,2"
                    />
                  ))}
                </svg>
                
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <div className="text-xs font-bold text-gray-800 mb-2">Field A-1 Overview</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Area: 47.3 hectares</div>
                    <div>Crop: Winter Wheat</div>
                    <div>Flight Alt: 120m</div>
                  </div>
                </div>
                
                <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div className="absolute bottom-1/4 left-1/4 w-6 h-6 bg-yellow-500 rounded-full border-2 border-white shadow-lg animate-pulse flex items-center justify-center">
                  <span className="text-white text-xs font-bold">⚠</span>
                </div>
                
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <div className="text-xs font-bold text-gray-800 mb-2">Health Index</div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-gray-600">0.8-1.0 Excellent</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span className="text-gray-600">0.5-0.8 Moderate</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-gray-600">0.0-0.5 Critical</span>
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-xs text-gray-600">Last Scan: {new Date().toLocaleTimeString()}</div>
                  <div className="text-xs text-green-600 font-medium">Resolution: 2.5cm/pixel</div>
                </div>
              </div>
            </div>

            {/* Crop Statistics */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Plant Count & Health Analytics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-700">{cropStats.totalPlants.toLocaleString()}</div>
                    <div className="text-sm text-green-600">Total Plants Detected</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-blue-700">{cropStats.healthyPlants.toLocaleString()}</div>
                    <div className="text-sm text-blue-600">Healthy Plants</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-orange-700">{cropStats.affectedPlants.toLocaleString()}</div>
                    <div className="text-sm text-orange-600">Affected Plants</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-purple-700">{cropStats.avgNDVI}</div>
                    <div className="text-sm text-purple-600">Average NDVI</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Canopy Analysis</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Canopy Coverage</span>
                    <span className="font-bold text-emerald-600">{cropStats.canopyCoverage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-1000" 
                         style={{ width: `${cropStats.canopyCoverage}%` }}></div>
                  </div>
                  <div className="text-sm text-gray-500">Last updated: {cropStats.lastUpdate}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Disease Detection Tab */}
        {activeTab === 'detection' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">AI-Detected Diseases from Heatmap Analysis</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600">Auto-Analysis Active</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {detectedDiseases.map((disease) => (
                    <div 
                      key={disease.id} 
                      className={`bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer border-2 ${
                        selectedArea && 
                        selectedArea.startRow === disease.coordinates.startRow && 
                        selectedArea.endRow === disease.coordinates.endRow
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-transparent'
                      }`}
                      onClick={() => setSelectedArea(disease.coordinates)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">{disease.type}</h4>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{disease.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(disease.severity)}`}>
                            {disease.severity}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{disease.confidence}% confidence</div>
                          <div className="text-xs text-gray-400">Area: {disease.area?.toFixed(1)} ha</div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 mb-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Identified Symptoms:</h5>
                        <div className="flex flex-wrap gap-1">
                          {disease.symptoms?.map((symptom, index) => (
                            <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {precisionInputs.find(input => input.diseaseId === disease.id) && (
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200">
                          <h5 className="text-sm font-medium text-blue-800 mb-2">🎯 AI Recommended Treatment:</h5>
                          {(() => {
                            const input = precisionInputs.find(input => input.diseaseId === disease.id);
                            return (
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-blue-600">Treatment:</span>
                                  <div className="font-medium">{input?.type}</div>
                                </div>
                                <div>
                                  <span className="text-blue-600">Product:</span>
                                  <div className="font-medium">{input?.product}</div>
                                </div>
                                <div>
                                  <span className="text-blue-600">Rate:</span>
                                  <div className="font-medium">{input?.rate}</div>
                                </div>
                                <div>
                                  <span className="text-blue-600">Cost:</span>
                                  <div className="font-medium">{input?.estimatedCost}</div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {detectedDiseases.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>AI analysis complete. No diseases detected in current heatmap.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Heatmap Analysis Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Grid Cells</span>
                    <span className="font-bold">625</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Diseases Auto-Detected</span>
                    <span className="font-bold text-red-600">{detectedDiseases.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Critical Areas</span>
                    <span className="font-bold text-orange-600">
                      {healthMapData.filter(cell => cell.health < 0.4).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Treatment Plans</span>
                    <span className="font-bold text-blue-600">{precisionInputs.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Analysis Method</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Multispectral Imaging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">NDVI Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Pattern Recognition AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Precision Spraying Tab */}
        {activeTab === 'spraying' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">AI-Recommended Precision Treatments</h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-600">Smart Targeting Active</span>
                </div>
              </div>

              <div className="space-y-4">
                {precisionInputs.map((input) => {
                  const relatedDisease = detectedDiseases.find(d => d.id === input.diseaseId);
                  return (
                    <div key={input.id} className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-blue-800">{input.type}</h4>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          input.urgency === 'High' ? 'bg-red-100 text-red-800' :
                          input.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {input.urgency} Priority
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-blue-600">Target Disease:</span>
                          <div className="font-medium">{relatedDisease?.type}</div>
                        </div>
                        <div>
                          <span className="text-blue-600">Product:</span>
                          <div className="font-medium">{input.product}</div>
                        </div>
                        <div>
                          <span className="text-blue-600">Application Rate:</span>
                          <div className="font-medium">{input.rate}</div>
                        </div>
                        <div>
                          <span className="text-blue-600">Method:</span>
                          <div className="font-medium">{input.method}</div>
                        </div>
                        <div>
                          <span className="text-blue-600">Target Area:</span>
                          <div className="font-medium">{relatedDisease?.area?.toFixed(1)} ha</div>
                        </div>
                        <div>
                          <span className="text-blue-600">Est. Cost:</span>
                          <div className="font-medium">{input.estimatedCost}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                        <span className="text-sm text-blue-600">Window: {input.applicationWindow}</span>
                        <button 
                          onClick={handleStartSpraying}
                          disabled={isSpraying}
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 text-sm"
                        >
                          {isSpraying ? (
                            <>
                              <Pause className="w-4 h-4" />
                              Applying
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Start Treatment
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {precisionInputs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Droplets className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No precision treatments recommended at this time.</p>
                    <p className="text-sm">AI will generate recommendations when diseases are detected.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Smart Application Summary</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Total Target Area</span>
                      <span className="font-bold">
                        {precisionInputs.reduce((total, input) => {
                          const disease = detectedDiseases.find(d => d.id === input.diseaseId);
                          return total + (disease?.area || 0);
                        }, 0).toFixed(1)} ha
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="text-red-600">High Priority</div>
                      <div className="font-bold text-lg text-red-800">
                        {precisionInputs.filter(i => i.urgency === 'High').length}
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-yellow-600">Medium Priority</div>
                      <div className="font-bold text-lg text-yellow-800">
                        {precisionInputs.filter(i => i.urgency === 'Medium').length}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Estimated total cost: ${precisionInputs.reduce((total, input) => {
                      const cost = parseFloat(input.estimatedCost.replace('$', '').split('/')[0]);
                      const disease = detectedDiseases.find(d => d.id === input.diseaseId);
                      return total + (cost * (disease?.area || 0));
                    }, 0).toFixed(0)}
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Environmental Conditions</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wind Speed</span>
                    <span className="font-medium">8 km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temperature</span>
                    <span className="font-medium">24°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Humidity</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Spray Conditions</span>
                    <span className="text-green-600 font-medium">Optimal</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Weather Suitable for Application</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Current conditions are ideal for precision spraying operations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Drone Management Tab */}
        {activeTab === 'drones' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {drones.map((drone) => (
              <div key={drone.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{drone.name}</h3>
                      <p className="text-gray-600">{drone.type}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    drone.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {drone.status}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Battery className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Battery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${drone.battery > 50 ? 'bg-green-500' : drone.battery > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${drone.battery}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{drone.battery}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Signal</span>
                    </div>
                    <span className="font-medium">{drone.signal}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Location</span>
                    </div>
                    <span className="font-medium text-sm">{drone.location.lat.toFixed(4)}, {drone.location.lng.toFixed(4)}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Capabilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {drone.capabilities.map((capability, capIndex) => (
                        <span key={capIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all">
                      Deploy Mission
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DroneAgriculturalDashboard;