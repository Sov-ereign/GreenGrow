import React, { useState, useRef } from 'react';
import { Send, Image, Paperclip, MoreHorizontal, Bot, User, Mic, Camera, FileText, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm GreenGrow AI, your farming advisor. Ask me about crops, weather, pests, or upload a plant image for disease detection!",
      sender: 'ai' as const,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: null as string | null,
    },
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const sendMessage = async () => {
    const hasText = newMessage.trim();
    const hasImage = selectedImage !== null;

    if ((!hasText && !hasImage) || loading) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: hasText ? newMessage : "📷 Analyzing plant image...",
      sender: 'user' as const,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: imagePreview,
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = newMessage;
    setNewMessage('');
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

        setMessages(prev => [
          ...prev,
          {
            id: prev.length + 1,
            text: aiText,
            sender: 'ai' as const,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

        setMessages(prev => [
          ...prev,
          {
            id: prev.length + 1,
            text: aiText,
            sender: 'ai' as const,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            imageUrl: null,
          },
        ]);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          text: `Error: ${err.message || "Failed to get response. Please check if the server is running."}`,
          sender: 'ai' as const,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          imageUrl: null,
        },
      ]);
    }
    setLoading(false);
  };

  const handleImageUpload = () => {
    imageInputRef.current?.click();
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const quickActions = [
    { icon: Camera, label: 'Camera', action: handleImageUpload },
    { icon: Image, label: 'Gallery', action: handleImageUpload },
    { icon: FileText, label: 'Document', action: handleFileUpload },
    { icon: Mic, label: 'Voice Note', action: () => {} },
  ];

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Chat Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-800">GreenGrow AI</h1>
            <div className="text-sm text-green-600 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Online • Ready to help
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-6 mb-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end space-x-3`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user' ? 'ml-3' : 'mr-3'}`}>
                  {message.sender === 'ai' ? (
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-2xl px-6 py-4 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {message.sender === 'ai' && (
                    <div className="flex items-center mb-2">
                      <Bot className="h-3 w-3 mr-2 text-green-600" />
                      <span className="text-xs font-medium text-green-600">AI Advisor</span>
                    </div>
                  )}
                  {message.imageUrl && (
                    <div className="mb-2 rounded-lg overflow-hidden">
                      <img
                        src={message.imageUrl}
                        alt="Uploaded plant"
                        className="w-full h-auto max-h-48 object-contain rounded-lg"
                      />
                    </div>
                  )}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</div>
                  <div className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {message.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] flex-row items-end space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="rounded-2xl px-6 py-4 bg-gray-100 text-gray-800">
                  <div className="flex items-center mb-2">
                    <Bot className="h-3 w-3 mr-2 text-green-600" />
                    <span className="text-xs font-medium text-green-600">AI Advisor</span>
                  </div>
                  <div className="text-sm">Thinking...</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-lg border-2 border-green-500"
                />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">Image ready to upload</div>
                <div className="text-xs text-gray-500">{selectedImage?.name}</div>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-100 pt-6">
          {/* Quick Actions */}
          {showMoreOptions && (
            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-4 gap-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className="flex flex-col items-center space-y-2 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Icon className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={selectedImage ? "Add a message (optional)..." : "Ask about crops, weather, pests, or any farming question..."}
                className="w-full px-4 py-3 pr-32 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none min-h-[50px] max-h-32"
                rows={1}
                disabled={loading}
              />
              
              {/* Input Actions */}
              <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                <button
                  onClick={handleImageUpload}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Upload Image"
                >
                  <Image className="h-4 w-4" />
                </button>
                <button
                  onClick={handleFileUpload}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Upload File"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className={`p-2 rounded-lg transition-colors ${
                    showMoreOptions 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                  }`}
                  title="More Options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              onClick={sendMessage}
              disabled={(!newMessage.trim() && !selectedImage) || loading}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => {
              // Handle file upload
              console.log('File selected:', e.target.files?.[0]);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;