import React from 'react';
import { Users, MessageSquare, ThumbsUp, Share2, Calendar, MapPin, Award } from 'lucide-react';

const Community: React.FC = () => {
  const discussions = [
    {
      id: 1,
      title: "Best practices for wheat cultivation in Punjab",
      author: "Harpreet Singh",
      location: "Ludhiana, Punjab",
      time: "2 hours ago",
      replies: 12,
      likes: 24,
      category: "Crops",
      excerpt: "I've been growing wheat for 15 years and want to share some techniques that have improved my yield by 30%..."
    },
    {
      id: 2,
      title: "Dealing with pest attacks during monsoon",
      author: "Priya Sharma",
      location: "Jaipur, Rajasthan",
      time: "5 hours ago",
      replies: 8,
      likes: 18,
      category: "Pest Control",
      excerpt: "This monsoon has been particularly challenging with increased pest activity. Here's what worked for me..."
    },
    {
      id: 3,
      title: "Government scheme application tips",
      author: "Ramesh Kumar",
      location: "Patna, Bihar",
      time: "1 day ago",
      replies: 15,
      likes: 32,
      category: "Schemes",
      excerpt: "Successfully applied for PM-KISAN and crop insurance. Sharing the complete process and required documents..."
    },
    {
      id: 4,
      title: "Organic farming transition experience",
      author: "Sunita Devi",
      location: "Nashik, Maharashtra",
      time: "2 days ago",
      replies: 20,
      likes: 45,
      category: "Organic",
      excerpt: "Completed my 3-year transition to organic farming. Here are the challenges and benefits I experienced..."
    }
  ];

  const events = [
    {
      title: "Sustainable Farming Workshop",
      date: "March 15, 2024",
      location: "Delhi",
      attendees: 150
    },
    {
      title: "Crop Insurance Awareness",
      date: "March 20, 2024",
      location: "Online",
      attendees: 300
    },
    {
      title: "Modern Irrigation Techniques",
      date: "March 25, 2024",
      location: "Pune",
      attendees: 200
    }
  ];

  const topContributors = [
    {
      name: "Dr. Rajesh Mehta",
      title: "Agricultural Expert",
      contributions: 156,
      badge: "Expert"
    },
    {
      name: "Kavita Singh",
      title: "Organic Farmer",
      contributions: 89,
      badge: "Helper"
    },
    {
      name: "Amit Patel",
      title: "Tech Farmer",
      contributions: 67,
      badge: "Contributor"
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Farmer Community</h1>
        <p className="text-gray-600">Connect, learn, and share experiences with fellow farmers</p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Active Members</h3>
          <p className="text-2xl font-bold text-gray-800">12,450</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Discussions</h3>
          <p className="text-2xl font-bold text-gray-800">3,240</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Award className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Experts</h3>
          <p className="text-2xl font-bold text-gray-800">156</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Events</h3>
          <p className="text-2xl font-bold text-gray-800">24</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Discussions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Discussions</h2>
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              Start Discussion
            </button>
          </div>

          <div className="space-y-6">
            {discussions.map((discussion) => (
              <div key={discussion.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                        {discussion.category}
                      </span>
                      <span className="text-sm text-gray-500">{discussion.time}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-green-600 cursor-pointer">
                      {discussion.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">{discussion.excerpt}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {discussion.author.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{discussion.author}</p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {discussion.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">{discussion.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">{discussion.replies}</span>
                    </button>
                    <button className="text-gray-500 hover:text-purple-600 transition-colors">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Upcoming Events</h2>
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-800 mb-1">{event.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {event.date}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {event.location}
                    </div>
                    <span>{event.attendees} attending</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
              View All Events
            </button>
          </div>

          {/* Top Contributors */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Top Contributors</h2>
            <div className="space-y-4">
              {topContributors.map((contributor, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {contributor.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{contributor.name}</h3>
                    <p className="text-sm text-gray-500">{contributor.title}</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full mb-1">
                      {contributor.badge}
                    </div>
                    <p className="text-xs text-gray-500">{contributor.contributions} posts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Join Community */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <h2 className="text-xl font-semibold mb-3">Join Our Community</h2>
            <p className="text-green-100 mb-4">
              Connect with thousands of farmers, share experiences, and learn from experts.
            </p>
            <button className="w-full bg-white text-green-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;