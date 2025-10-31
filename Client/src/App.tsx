import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
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
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 font-['Inter',sans-serif]">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/weather" element={<Weather />} />
                      <Route path="/crops" element={<Crops />} />
                      <Route path="/market" element={<Market />} />
                      <Route path="/schemes" element={<Schemes />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/voice" element={<VoiceAssistant />} />
                      <Route path="/help" element={<Help />} />
                      <Route path="/community" element={<Community />} />
                      <Route path="/support" element={<Support />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
