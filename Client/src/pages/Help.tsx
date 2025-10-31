import React from 'react';
import { HelpCircle, Book, Video, MessageCircle, Phone, Mail, Search } from 'lucide-react';

const Help: React.FC = () => {
  const faqItems = [
    {
      question: "How do I get weather alerts for my farm?",
      answer: "Go to Settings > Notifications and enable weather alerts. You'll receive notifications about weather changes that might affect your crops."
    },
    {
      question: "How can I check current market prices?",
      answer: "Visit the Market Prices section from the sidebar. You'll see real-time prices for various crops across different mandis."
    },
    {
      question: "What government schemes am I eligible for?",
      answer: "Check the Government Schemes section. The system will show schemes you're eligible for based on your profile information."
    },
    {
      question: "How do I use the AI farming advisor?",
      answer: "Click on AI Chat in the sidebar. You can ask questions about crops, pests, diseases, or any farming-related queries."
    },
    {
      question: "Can I upload photos for crop diagnosis?",
      answer: "Yes! In the AI Chat, use the image button to upload photos of your crops. The AI can help diagnose issues from images."
    }
  ];

  const helpCategories = [
    {
      title: "Getting Started",
      icon: Book,
      description: "Learn the basics of using FarmWise",
      articles: 12
    },
    {
      title: "Weather & Alerts",
      icon: HelpCircle,
      description: "Understanding weather forecasts and alerts",
      articles: 8
    },
    {
      title: "Market Information",
      icon: MessageCircle,
      description: "How to use market price features",
      articles: 6
    },
    {
      title: "AI Assistant",
      icon: Video,
      description: "Making the most of AI farming advice",
      articles: 10
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Help Center</h1>
        <p className="text-gray-600">Find answers to your questions and learn how to use FarmWise</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help articles, tutorials, or FAQs..."
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Help Categories */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {helpCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{category.title}</h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600 font-medium">{category.articles} articles</span>
                    <button className="text-green-600 hover:text-green-700 font-medium">View All →</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Contact Support</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Live Chat</h3>
                  <p className="text-sm text-gray-600">Chat with our support team</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Phone Support</h3>
                  <p className="text-sm text-gray-600">+91 1800-123-4567</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Email Support</h3>
                  <p className="text-sm text-gray-600">support@farmwise.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Links</h2>
            
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-800">User Guide</span>
              </button>
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-800">Video Tutorials</span>
              </button>
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-800">System Requirements</span>
              </button>
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-800">Privacy Policy</span>
              </button>
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-800">Terms of Service</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;