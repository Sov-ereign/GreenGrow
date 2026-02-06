
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function AboutSection() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const benefits = [
    "AI-Powered Crop Analysis",
    "Real-time Weather Alerts",
    "Community Support Network",
    "Market Price Predictions"
  ];

  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-agri-50 to-transparent"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left - Image Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=2127&auto=format&fit=crop"
                alt="Farmer using technology"
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white p-4">
                <p className="font-bold text-2xl">Empowering</p>
                <p className="text-agri-300">Rural India</p>
              </div>
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-xl shadow-xl border border-gray-100 hidden md:block animate-bounce z-20">
              <div className="flex items-center gap-4">
                <div className="bg-agri-100 p-3 rounded-full">
                  <span className="text-2xl">🌾</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">5000+</p>
                  <p className="text-sm text-gray-500">Farmers Joined</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <motion.span variants={fadeInUp} className="inline-block px-4 py-1.5 rounded-full bg-agri-100 text-agri-700 font-semibold text-sm mb-4">
              About GreenGrow
            </motion.span>

            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Bridging Tradition with <span className="text-agri-600">Innovation</span>
            </motion.h2>

            <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-6 leading-relaxed">
              GreenGrow was founded in 2020 with a vision to revolutionize farming in India. We combine deep agricultural expertise with cutting-edge AI and data science to solve the real-world challenges faced by farmers today.
            </motion.p>

            <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-8 leading-relaxed">
              We believe that every farmer deserves access to tools that increase productivity, reduce waste, and ensure sustainable profits.
            </motion.p>

            <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-agri-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{benefit}</span>
                </div>
              ))}
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
