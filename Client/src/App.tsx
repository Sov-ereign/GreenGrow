import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Weather from "./pages/Weather";
import Crops from "./pages/Crops";
import Market from "./pages/Market";
import Schemes from "./pages/Schemes";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import Help from "./pages/Help";
import Community from "./pages/Community";
import Support from "./pages/Support";
import Register from "./pages/Register";
import LocationDialog from "./pages/LocationDialog";
import Login from "./pages/Login";
import VapiWidget from "./components/voice/VapiWidget";
import FarmForm from "./pages/FarmForm";
import DiseasePrediction from "./pages/DiseasePrediction";
import DroneModule from "./pages/DroneModule";
import CropPrediction from "./pages/CropPrediction";
import CropProductionPrediction from "./pages/CropProductionPrediction";
import Index from "./components/Index";

const AppLayout = () => {
  return (
    <Layout>
      <LocationDialog />
      <Outlet />
    </Layout>
  );
};

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 font-['Inter',sans-serif]">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/crops" element={<Crops />} />
            <Route path="/market" element={<Market />} />
            <Route path="/schemes" element={<Schemes />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/voice" element={<VapiWidget />} />
            <Route path="/FarmForm" element={<FarmForm />} />
            <Route path="/disease-prediction" element={<DiseasePrediction />} />
            <Route path="/drone-module" element={<DroneModule />} />
            <Route path="/crop-prediction" element={<CropPrediction />} />
            <Route path="/crop-production" element={<CropProductionPrediction />} />
            <Route path="/help" element={<Help />} />
            <Route path="/community" element={<Community />} />
            <Route path="/support" element={<Support />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
