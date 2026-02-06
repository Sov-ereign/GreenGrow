
import { motion } from "framer-motion";
import { Leaf, CloudSun, MessageSquare, Timer, BarChart2, Users } from "lucide-react";

const features = [
  {
    icon: <Leaf className="h-10 w-10 text-agri-500" />,
    title: "Soil Analysis & Crop Recommendations",
    description:
      "Analyze NPK levels from soil samples to receive tailored recommendations for crops and fertilizers to optimize your yield.",
    link: "/features/soil-analysis"
  },
  {
    icon: <CloudSun className="h-10 w-10 text-agri-500" />,
    title: "Weather Forecasting & Predictions",
    description:
      "Get accurate weather forecasts and real-time soil condition data to make informed decisions for your farming activities.",
    link: "/features/weather"
  },
  {
    icon: <MessageSquare className="h-10 w-10 text-agri-500" />,
    title: "AI-Powered Agricultural Assistant",
    description:
      "Access our intelligent chatbot for instant guidance on farming techniques, crop diseases, and best practices.",
    link: "/features/chatbot"
  },
  {
    icon: <Timer className="h-10 w-10 text-agri-500" />,
    title: "Growth & Income Calculation",
    description:
      "Time series models analyze your soil, weather, and crop data to calculate expected growth and yearly income predictions.",
    link: "/features/growth-calculator"
  },
  {
    icon: <BarChart2 className="h-10 w-10 text-agri-500" />,
    title: "Disease Prediction & Prevention",
    description:
      "Our GenAI technology identifies potential crop diseases before they appear and suggests prevention strategies.",
    link: "/features/disease-prediction"
  },
  {
    icon: <Users className="h-10 w-10 text-agri-500" />,
    title: "Farmer Community",
    description:
      "Connect with other farmers to share knowledge, experiences, and insights for better agricultural practices.",
    link: "/features/community"
  }
];

export default function FeaturesSection() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-agri-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-leaf-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <span className="text-agri-600 font-semibold tracking-wider uppercase text-sm">Why Choose AgriNova?</span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
            Innovative Technology for <br />
            <span className="text-agri-600 relative inline-block">
              Modern Farming
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-leaf-300 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" fill="currentColor" />
              </svg>
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Leverage AI, machine learning, and comprehensive data analytics to optimize every aspect of your agricultural operations.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 hover:border-agri-200 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-agri-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500 ease-out" />

              <div className="relative z-10">
                <div className="w-14 h-14 bg-agri-100 rounded-2xl flex items-center justify-center mb-6 text-agri-600 group-hover:bg-agri-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-agri-700 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                <a
                  href={feature.link}
                  className="inline-flex items-center text-agri-600 font-semibold group-hover:text-agri-700 hover:underline underline-offset-4 transition-all"
                >
                  Explore Feature <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14"></path>
      <path d="m12 5 7 7-7 7"></path>
    </svg>
  );
}
