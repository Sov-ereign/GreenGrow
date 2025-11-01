import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
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
import VoiceAssistant from "./pages/VoiceAssistant";
import Register from "./pages/Register";
import LocationDialog from "./pages/LocationDialog";
import Login from "./pages/Login";
import VapiWidget from "./components/voice/VapiWidget";
import FarmForm from "./pages/FarmForm";

function AppContent() {
  const location = useLocation();

  // ✅ Corrected condition
  const hideLayout =
    location.pathname === "/register" || location.pathname === "/login";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 font-['Inter',sans-serif]">
      {!hideLayout && <LocationDialog />}
      {hideLayout ? (
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/crops" element={<Crops />} />
            <Route path="/market" element={<Market />} />
            <Route path="/schemes" element={<Schemes />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/chat" element={<Chat />} />
            {/* <Route path="/voice" element={<VoiceAssistant />} /> */}
            <Route path="/voice" element={<VapiWidget />} />
            <Route path="/FarmForm" element={<FarmForm />} />

            <Route path="/help" element={<Help />} />
            <Route path="/community" element={<Community />} />
            <Route path="/support" element={<Support />} />
          </Routes>
        </Layout>
      )}
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
