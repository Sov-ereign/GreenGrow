import { useState } from "react";

export function useUserLocation() {
  const [location, setLocation] = useState<string | null>(
    localStorage.getItem("userLocation")
  );
  const [error, setError] = useState<string | null>(null);

  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      setError("Your browser doesn’t support location access.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const region =
            data.address.state || data.address.county || "Unknown region";

          setLocation(region);
          localStorage.setItem("userLocation", region);
        } catch (err) {
          setError("Unable to fetch location info.");
        }
      },
      () => setError("Location permission denied.")
    );
  };

  return { location, error, getUserLocation };
}
