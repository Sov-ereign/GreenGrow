import React, { useState, useRef } from 'react';
import { Send, Image, Paperclip, MoreHorizontal, Bot, User, Mic, Camera, FileText } from 'lucide-react';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI farming advisor. I'm here to help you with all your agricultural questions. How can I assist you today?",
      sender: 'ai',
      time: '10:30 AM',
      avatar: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: 2,
      text: "My wheat crop is showing yellow leaves in some areas. The plants are about 3 months old. What could be causing this?",
      sender: 'user',
      time: '10:32 AM'
    },
    {
      id: 3,
      text: "Yellow leaves in wheat at 3 months can indicate several issues:\n\n1. **Nitrogen Deficiency** - Most common cause\n2. **Waterlogging** - Check soil drainage\n3. **Disease** - Look for spots or patterns\n\nCan you share a photo of the affected plants? This will help me give you a more accurate diagnosis.",
      sender: 'ai',
      time: '10:33 AM',
      avatar: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: 4,
      text: "I'll take some photos right now. Also, should I apply fertilizer immediately?",
      sender: 'user',
      time: '10:35 AM'
    },
    {
      id: 5,
      text: "Great! Photos will be very helpful. Before applying fertilizer:\n\n✅ **Check soil moisture** first\n✅ **Wait for photos** to confirm diagnosis\n✅ **Test soil pH** if possible\n\n⚠️ Don't apply fertilizer if soil is waterlogged - it won't help and may cause more damage.\n\nI'll provide specific recommendations once I see the photos!",
      sender: 'ai',
      time: '10:36 AM',
      avatar: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: messages.length + 1,
        text: newMessage,
        sender: 'user' as const,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      
      setMessages([...messages, userMessage]);
      setNewMessage('');
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          text: "I understand your concern. Let me analyze this information and provide you with the best recommendations for your situation.",
          sender: 'ai' as const,
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          avatar: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=100'
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
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
            <h1 className="text-xl font-semibold text-gray-800">AI Farming Advisor</h1>
            <p className="text-sm text-green-600 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Online • Ready to help
            </p>
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
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {message.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

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
                placeholder="Ask about crops, weather, pests, or any farming question..."
                className="w-full px-4 py-3 pr-32 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none min-h-[50px] max-h-32"
                rows={1}
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
              disabled={!newMessage.trim()}
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
            onChange={(e) => {
              // Handle image upload
              console.log('Image selected:', e.target.files?.[0]);
            }}
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