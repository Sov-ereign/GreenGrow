import React, { useState } from "react";
import { useUserLocation } from "../hooks/useUserLocation";

export default function LocationDialog() {
  const [open, setOpen] = useState(!localStorage.getItem("userLocation"));
  const { location, error, getUserLocation } = useUserLocation();

  const handleAllow = async () => {
    await getUserLocation();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center max-w-sm w-full mx-4">
        <h2 className="text-lg md:text-xl font-bold mb-2">📍 Allow Location Access</h2>
        <p className="text-sm md:text-base text-gray-600 mb-4">
          We'll use your location to show regional crops, weather, and markets.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
          <button
            onClick={handleAllow}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm md:text-base w-full sm:w-auto"
          >
            Allow
          </button>
          <button
            onClick={() => setOpen(false)}
            className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md text-sm md:text-base w-full sm:w-auto"
          >
            Deny
          </button>
        </div>

        {error && <p className="text-red-500 mt-3 text-xs md:text-sm">{error}</p>}
      </div>
    </div>
  );
}
