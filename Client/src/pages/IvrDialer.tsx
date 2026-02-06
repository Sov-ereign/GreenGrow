import React, { useEffect, useMemo, useRef, useState } from "react";
import { Device } from "@twilio/voice-sdk";
import { PhoneCall, PhoneOff, ShieldAlert } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type DialerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "connecting"
  | "in-call"
  | "error";

const IvrDialer: React.FC = () => {
  const [status, setStatus] = useState<DialerStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<string>("Not connected");
  const deviceRef = useRef<Device | null>(null);

  const statusLabel = useMemo(() => {
    switch (status) {
      case "loading":
        return "Preparing secure call session...";
      case "ready":
        return "Ready to start IVR call";
      case "connecting":
        return "Connecting to GreenGrow IVR...";
      case "in-call":
        return "Call active";
      case "error":
        return "Setup failed";
      default:
        return "Idle";
    }
  }, [status]);

  const setupDevice = async () => {
    setStatus("loading");
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ivr/token`);
      if (!response.ok) {
        throw new Error("Failed to fetch IVR token");
      }
      const data = await response.json();
      if (!data?.token) {
        throw new Error("Token missing from server response");
      }

      const device = new Device(data.token, {
        logLevel: "error",
      });

      device.on("registered", () => {
        setStatus("ready");
        setLastEvent("Device registered");
      });

      device.on("error", (twilioError) => {
        setStatus("error");
        setError(twilioError.message || "Twilio device error");
        setLastEvent("Device error");
      });

      device.on("disconnect", () => {
        setStatus("ready");
        setLastEvent("Call ended");
      });

      deviceRef.current = device;
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Unable to initialize dialer");
    }
  };

  const startCall = async () => {
    if (!deviceRef.current) {
      await setupDevice();
    }
    const device = deviceRef.current;
    if (!device) {
      return;
    }

    try {
      setStatus("connecting");
      setLastEvent("Dialing...");
      const connection = await device.connect();
      if (connection) {
        setStatus("in-call");
        setLastEvent("Connected to IVR");
      }
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Failed to connect call");
    }
  };

  const endCall = () => {
    if (deviceRef.current) {
      deviceRef.current.disconnectAll();
      setStatus("ready");
      setLastEvent("Call ended");
    }
  };

  useEffect(() => {
    return () => {
      if (deviceRef.current) {
        deviceRef.current.destroy();
        deviceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-cyan-500 rounded-2xl shadow-lg p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold">IVR Call Center</h1>
        <p className="text-sm md:text-base text-green-50 mt-1">
          Connect to GreenGrow IVR directly from your browser.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Browser Dialer
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Use this for hackathon demos when PSTN calling is expensive.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Status
            </p>
            <p className="text-sm font-semibold text-gray-800">{statusLabel}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs uppercase text-gray-400">Session</p>
            <p className="text-sm font-medium text-gray-800 mt-1">
              {lastEvent}
            </p>
            {error && (
              <div className="mt-3 flex items-start gap-2 text-sm text-red-600">
                <ShieldAlert className="h-4 w-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-xs uppercase text-gray-400">Actions</p>
            <div className="mt-3 flex flex-col gap-3">
              <button
                onClick={startCall}
                disabled={status === "loading" || status === "connecting"}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 text-white py-2.5 font-semibold shadow-md hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <PhoneCall className="h-5 w-5" />
                Start IVR Call
              </button>
              <button
                onClick={endCall}
                disabled={status !== "in-call" && status !== "connecting"}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <PhoneOff className="h-5 w-5" />
                End Call
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
          Tip: Allow microphone access when prompted. The IVR supports English,
          Hindi, and Bengali.
        </div>
      </div>
    </div>
  );
};

export default IvrDialer;
