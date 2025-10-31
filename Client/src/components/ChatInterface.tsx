import React, { useState } from "react";
import { MessageCircle, Send, Bot } from "lucide-react";

// Gemini API endpoint and key (replace with your actual values)
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
const GEMINI_API_KEY = "AIzaSyCiEAC9PJb7qRA10j8qAudF_jXIDh4QbzM";

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI farming advisor. How can I help you today?",
      sender: "ai",
      time: "10:30 AM",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!newMessage.trim() || loading) return;

    const userMsg = {
      id: messages.length + 1,
      text: newMessage,
      sender: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, userMsg]);
    setNewMessage("");
    setLoading(true);

    // Prepare Gemini API request
    try {
      const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: newMessage }],
            },
          ],
        }),
      });
      const data = await res.json();
      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't understand your question.";

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: aiText,
          sender: "ai",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Error connecting to Gemini API.",
          sender: "ai",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <MessageCircle className="h-5 w-5 text-green-500 mr-2" />
        AI Farming Advisor
      </h3>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender === "user"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.sender === "ai" && (
                <div className="flex items-center mb-1">
                  <Bot className="h-3 w-3 mr-1" />
                  <span className="text-xs text-gray-500">AI Advisor</span>
                </div>
              )}
              <p className="text-sm">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === "user" ? "text-green-100" : "text-gray-400"
                }`}
              >
                {message.time}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gray-100 text-gray-800">
              <div className="flex items-center mb-1">
                <Bot className="h-3 w-3 mr-1" />
                <span className="text-xs text-gray-500">AI Advisor</span>
              </div>
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about crops, weather, or farming advice..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
          disabled={loading}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
