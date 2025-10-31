import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, Clock, User, Bot, Video, FileText, Send } from 'lucide-react';

const Support: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'general',
    priority: 'medium',
    subject: '',
    description: ''
  });

  const supportOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      availability: 'Available 24/7',
      responseTime: 'Instant',
      color: 'bg-green-500'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our farming experts',
      availability: 'Mon-Sat, 9 AM - 6 PM',
      responseTime: 'Immediate',
      color: 'bg-blue-500'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us detailed queries via email',
      availability: 'Always open',
      responseTime: 'Within 24 hours',
      color: 'bg-purple-500'
    },
    {
      icon: Video,
      title: 'Video Call',
      description: 'Schedule a video consultation',
      availability: 'By appointment',
      responseTime: 'Same day',
      color: 'bg-orange-500'
    }
  ];

  const categories = [
    { id: 'general', label: 'General Inquiry' },
    { id: 'technical', label: 'Technical Issue' },
    { id: 'billing', label: 'Billing & Payments' },
    { id: 'crops', label: 'Crop Advisory' },
    { id: 'weather', label: 'Weather Alerts' },
    { id: 'schemes', label: 'Government Schemes' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Support ticket submitted:', ticketForm);
    // Handle form submission
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Support Center</h1>
        <p className="text-gray-600">Get help from our farming experts and technical support team</p>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {supportOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <div className={`w-12 h-12 ${option.color} rounded-full flex items-center justify-center mb-4`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{option.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{option.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Availability:</span>
                  <span className="font-medium text-gray-800">{option.availability}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Response:</span>
                  <span className="font-medium text-green-600">{option.responseTime}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Ticket Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-800">Submit Support Ticket</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={ticketForm.name}
                    onChange={(e) => setTicketForm({...ticketForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={ticketForm.email}
                    onChange={(e) => setTicketForm({...ticketForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={ticketForm.phone}
                    onChange={(e) => setTicketForm({...ticketForm, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    required
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    required
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Brief description of your issue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  rows={6}
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="Please provide detailed information about your issue or question..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Send className="h-5 w-5" />
                <span>Submit Ticket</span>
              </button>
            </form>
          </div>
        </div>

        {/* Contact Information & FAQ */}
        <div className="space-y-6">
          {/* Direct Contact */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Direct Contact</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Phone Support</h3>
                  <p className="text-sm text-gray-600">+91 1800-123-4567</p>
                  <p className="text-xs text-green-600">Toll-free • Mon-Sat 9 AM - 6 PM</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Email Support</h3>
                  <p className="text-sm text-gray-600">support@farmwise.com</p>
                  <p className="text-xs text-blue-600">Response within 24 hours</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Live Chat</h3>
                  <p className="text-sm text-gray-600">Available 24/7</p>
                  <p className="text-xs text-purple-600">Instant response</p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Support */}
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-red-800">Emergency Support</h2>
            </div>
            <p className="text-red-700 mb-4">
              For urgent farming emergencies like pest outbreaks or crop diseases that need immediate attention.
            </p>
            <button className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium">
              Call Emergency Line
            </button>
          </div>

          {/* AI Assistant */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Try AI Assistant</h2>
            </div>
            <p className="text-green-100 mb-4">
              Get instant answers to common farming questions with our AI-powered assistant.
            </p>
            <button className="w-full bg-white text-green-600 py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              Start AI Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;