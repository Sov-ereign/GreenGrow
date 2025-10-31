import React from "react";
import { Bot, User, PhoneOff, Mic, Volume2 } from "lucide-react";

const VoiceAssistant: React.FC = () => {
  return (
    <div className="flex items-center justify-center ">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center text-gray-800 tracking-tight">
          Voice Assistant Call
        </h2>

        {/* Two Large Dialogue Boxes */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* AI Agent */}
          <div className="flex-1 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 flex flex-col items-center border border-green-100">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center shadow-md">
              <Bot size={40} className="text-green-600" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              AI Assistant
            </h3>
            <p className="text-sm text-gray-500">Speaking...</p>

            {/* Waveform Placeholder */}
          </div>

          {/* User */}
          <div className="flex-1 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 flex flex-col items-center border border-gray-100">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center shadow-md">
              <User size={40} className="text-gray-600" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-800">You</h3>
            <p className="text-sm text-gray-500">Listening...</p>
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex justify-center gap-8 mt-4">
          <button className="p-5 rounded-full bg-green-100 hover:bg-green-200 transition shadow-md">
            <Mic className="text-green-600" size={28} />
          </button>
          <button className="p-5 rounded-full bg-green-100 hover:bg-green-200 transition shadow-md">
            <Volume2 className="text-green-600" size={28} />
          </button>
          <button className="p-5 rounded-full bg-red-500 hover:bg-red-600 transition shadow-lg">
            <PhoneOff className="text-white" size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
