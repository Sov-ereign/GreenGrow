
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const programs = [
  {
    id: 1,
    title: "Soil Health Camps",
    description: "Free soil testing and analysis sessions conducted across rural communities to help farmers understand their soil composition and get personalized recommendations.",
    date: "Monthly",
    location: "Multiple Locations",
    participants: "500+ per month",
    imageUrl: "src/Images/istockphoto-1360520451-612x612.jpg"
  },
  {
    id: 2,
    title: "Tech-Enabled Farming Workshops",
    description: "Hands-on training sessions on using technology for farming operations, from basic smartphone usage to advanced sensor systems and data interpretation.",
    date: "Bi-weekly",
    location: "Regional Centers",
    participants: "300+ per session",
    imageUrl: "src/Images/istockphoto-1386152719-612x612.jpg"
  },
  {
    id: 3,
    title: "Crop Diversification Programs",
    description: "Educational programs to help farmers diversify their crops for better economic stability and soil health, featuring experts in different crop varieties.",
    date: "Seasonal",
    location: "Agricultural Universities",
    participants: "1000+ per season",
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Youth in Agriculture Initiative",
    description: "Programs specifically designed to encourage and equip the next generation of farmers with modern agricultural techniques and business management skills.",
    date: "Quarterly",
    location: "Schools & Colleges",
    participants: "750+ per quarter",
    imageUrl: "src/Images/image_750x500_657ad9e35f2bc.jpg"
  }
];

export default function ProgramsSection() {
  const [activeProgram, setActiveProgram] = useState(programs[0]);

  return (
    <section id="programs" className="py-24 bg-agri-50/50 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-agri-600 font-semibold uppercase tracking-wider text-sm">Community Impact</span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-2">
            Agricultural Programs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
            Join our educational sessions designed to empower farmers with modern skills and sustainable practices.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Program List */}
          <div className="lg:col-span-4 space-y-4">
            {programs.map((program) => (
              <motion.div
                key={program.id}
                className={`p-6 rounded-xl cursor-pointer transition-all duration-300 border ${activeProgram.id === program.id
                  ? "bg-white border-agri-500 shadow-lg ring-1 ring-agri-500/20"
                  : "bg-white border-transparent hover:border-gray-200 hover:shadow-md"
                  }`}
                onClick={() => setActiveProgram(program)}
                whileHover={{ x: 5 }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-bold text-lg ${activeProgram.id === program.id ? "text-agri-700" : "text-gray-800"
                    }`}>
                    {program.title}
                  </h3>
                  {activeProgram.id === program.id && <div className="h-2 w-2 rounded-full bg-agri-500 mt-2"></div>}
                </div>
                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                  {program.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Program Details */}
          <motion.div
            className="lg:col-span-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
            key={activeProgram.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative h-72 md:h-80 w-full group">
              <img
                src={activeProgram.imageUrl}
                alt={activeProgram.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-6 left-6 max-w-xl">
                <h3 className="text-white text-3xl font-bold mb-2">{activeProgram.title}</h3>
                <p className="text-white/80 text-lg hidden md:block">{activeProgram.participants} Participating</p>
              </div>
            </div>

            <div className="p-8">
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">{activeProgram.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-agri-50/50 p-4 rounded-xl border border-agri-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="text-agri-600 h-5 w-5" />
                    <p className="text-sm font-semibold text-gray-900">Frequency</p>
                  </div>
                  <p className="text-gray-600 pl-8">{activeProgram.date}</p>
                </div>

                <div className="bg-agri-50/50 p-4 rounded-xl border border-agri-100">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="text-agri-600 h-5 w-5" />
                    <p className="text-sm font-semibold text-gray-900">Location</p>
                  </div>
                  <p className="text-gray-600 pl-8">{activeProgram.location}</p>
                </div>

                <div className="bg-agri-50/50 p-4 rounded-xl border border-agri-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="text-agri-600 h-5 w-5" />
                    <p className="text-sm font-semibold text-gray-900">Impact</p>
                  </div>
                  <p className="text-gray-600 pl-8">{activeProgram.participants}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                <Button variant="outline" className="border-agri-200 text-agri-700 hover:bg-agri-50 hover:border-agri-300">
                  View Full Schedule
                </Button>
                <Button className="bg-agri-600 hover:bg-agri-700 text-white shadow-lg shadow-agri-500/30">
                  Register Now
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
