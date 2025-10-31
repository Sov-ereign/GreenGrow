import React, { useState, useRef } from "react";
import { MessageCircle, Send, Bot, Image as ImageIcon, X } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm GreenGrow AI, your farming advisor. Ask me about crops, weather, or upload a plant image for disease detection!",
      sender: "ai",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      imageUrl: null as string | null,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size should be less than 10MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async () => {
    const hasText = newMessage.trim();
    const hasImage = selectedImage !== null;

    if ((!hasText && !hasImage) || loading) return;

    // Add user message
    const userMsg = {
      id: messages.length + 1,
      text: hasText ? newMessage : "📷 Analyzing plant image...",
      sender: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      imageUrl: imagePreview,
    };

    setMessages((prev) => [...prev, userMsg]);
    const messageText = newMessage;
    setNewMessage("");
    setLoading(true);

    try {
      if (hasImage && selectedImage) {
        // Send image for analysis
        const formData = new FormData();
        formData.append("image", selectedImage);

        const res = await fetch(`${API_BASE_URL}/api/chat/image-analysis`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();
        let aiText = data.response || "I couldn't analyze the image. Please try again.";

        // Add disease detection info if available
        if (data.diseaseDetection) {
          const detection = data.diseaseDetection;
          aiText = `🔍 **Disease Detection Results:**\n${detection.disease || detection.predicted_class || "Unknown"} (${detection.confidence || 0}% confidence)\n\n${aiText}`;
        }

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
            imageUrl: null,
          },
        ]);

        // Clear image after sending
        removeImage();
      } else if (hasText) {
        // Send text message
        const res = await fetch(`${API_BASE_URL}/api/chat/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageText }),
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();
        const aiText = data.response || "Sorry, I couldn't process your question.";

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
            imageUrl: null,
          },
        ]);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: `Error: ${err.message || "Failed to get response. Please check if the server is running."}`,
          sender: "ai",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          imageUrl: null,
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <MessageCircle className="h-5 w-5 text-green-500 mr-2" />
        GreenGrow AI
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
              {message.imageUrl && (
                <div className="mb-2 rounded-lg overflow-hidden">
                  <img
                    src={message.imageUrl}
                    alt="Uploaded plant"
                    className="w-full h-auto max-h-32 object-contain"
                  />
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
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

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-16 w-16 object-cover rounded-lg border-2 border-green-500"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          title="Upload plant image"
        >
          <ImageIcon className="h-4 w-4" />
        </label>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={selectedImage ? "Add a message (optional)..." : "Ask about crops, weather, or farming advice..."}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          disabled={loading || (!newMessage.trim() && !selectedImage)}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
