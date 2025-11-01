import React, { useState, useRef } from "react";
import { Bot, Send, Image as ImageIcon, X } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hi there! I'm GreenGrow AI — your smart farming assistant. Ask about crops, weather, or upload a plant image for instant analysis!",
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = async () => {
    const hasText = newMessage.trim();
    const hasImage = selectedImage !== null;
    if ((!hasText && !hasImage) || loading) return;

    const userMsg = {
      id: messages.length + 1,
      text: hasText ? newMessage : "📷 Uploading plant image...",
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
        const formData = new FormData();
        formData.append("image", selectedImage);
        const res = await fetch(`${API_BASE_URL}/api/chat/image-analysis`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        const aiText =
          data.response || "I couldn’t analyze the image. Please try again.";

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
        removeImage();
      } else if (hasText) {
        const res = await fetch(`${API_BASE_URL}/api/chat/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageText }),
        });
        const data = await res.json();
        const aiText =
          data.response || "Sorry, I couldn’t process your question.";
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
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "⚠️ Error: Couldn’t connect to server. Please make sure it’s running.",
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
    <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-3xl shadow-xl p-6 h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-green-100 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <Bot className="h-6 w-6 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-800">GreenGrow AI</h2>
        </div>
        <span className="text-sm text-gray-500">Online</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-green-200 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-2xl p-3 max-w-[80%] shadow-sm ${
                msg.sender === "user"
                  ? "bg-green-600 text-white rounded-br-none"
                  : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.imageUrl && (
                <img
                  src={msg.imageUrl}
                  alt="Uploaded"
                  className="rounded-lg mb-2 max-h-40 object-cover"
                />
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <p
                className={`text-[10px] mt-1 text-right ${
                  msg.sender === "user" ? "text-green-100" : "text-gray-400"
                }`}
              >
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl p-3 max-w-[80%] bg-white border border-gray-100 text-gray-800 shadow-sm">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="my-3 flex items-center space-x-2">
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
          <p className="text-xs text-gray-500">Image ready to send</p>
        </div>
      )}

      {/* Input Section */}
      <div className="flex items-center space-x-2 mt-2">
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
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer transition"
        >
          <ImageIcon className="h-5 w-5 text-gray-600" />
        </label>

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about crops, weather, or farming tips..."
          className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
          disabled={loading}
        />

        <button
          onClick={sendMessage}
          className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition disabled:opacity-50"
          disabled={loading || (!newMessage.trim() && !selectedImage)}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
