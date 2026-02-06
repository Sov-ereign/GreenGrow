
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Rajesh Kumar",
    location: "Punjab",
    image: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=1921&auto=format&fit=crop",
    rating: 5,
    text: "Agrinova's soil analysis and crop recommendations have transformed my farming practices. I've seen a 40% increase in yield and significant cost savings on fertilizers by using just what my soil needs."
  },
  {
    id: 2,
    name: "Lakshmi Devi",
    location: "Tamil Nadu",
    image: "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?q=80&w=1974&auto=format&fit=crop",
    rating: 5,
    text: "The weather forecasting feature has been a game-changer for me. I can now plan irrigation and harvesting with precision, saving water and protecting my crops from unexpected weather conditions."
  },
  {
    id: 3,
    name: "Amit Sharma",
    location: "Uttar Pradesh",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1974&auto=format&fit=crop",
    rating: 4,
    text: "I was skeptical about technology in farming, but the Agrinova app is so user-friendly. The disease prediction feature helped me save my tomato crop from blight by identifying it early."
  },
  {
    id: 4,
    name: "Priya Patel",
    location: "Gujarat",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
    rating: 5,
    text: "Being able to connect with other farmers through the community feature has been invaluable. I've learned new techniques and made friends who understand the challenges of farming."
  },
  {
    id: 5,
    name: "Mohammad Farooq",
    location: "Maharashtra",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
    rating: 5,
    text: "The AI chatbot answers my questions at any time of day, which is perfect for busy farmers like me. It's like having an agriculture expert in my pocket 24/7."
  }
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const next = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      next();
    }, 6000);

    return () => clearInterval(interval);
  }, [autoplay, current]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3 }
    })
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Patterns */}
      <div className="absolute inset-0 z-0 opacity-30" style={{ backgroundImage: "radial-gradient(#22c55e 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-agri-600 font-semibold uppercase tracking-wider text-sm">Success Stories</span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-2">
            Farmers Trust Agrinova
          </h2>
        </div>

        <div className="relative max-w-6xl mx-auto"
          onMouseEnter={() => setAutoplay(false)}
          onMouseLeave={() => setAutoplay(true)}
        >
          <div className="relative h-[450px] md:h-[400px] overflow-visible perspective-1000">
            <AnimatePresence custom={direction} initial={false} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12 w-full mx-auto absolute inset-0 flex flex-col md:flex-row gap-8 items-center md:items-stretch"
              >
                {/* Image Column */}
                <div className="w-32 h-32 md:w-64 md:h-full flex-shrink-0 relative group">
                  <div className="absolute inset-0 bg-agri-600 rounded-2xl rotate-3 group-hover:rotate-6 transition-transform duration-300 opacity-20"></div>
                  <img
                    src={testimonials[current].image}
                    alt={testimonials[current].name}
                    className="w-full h-full object-cover rounded-2xl shadow-lg relative z-10"
                  />
                  <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold text-gray-900">{testimonials[current].rating}.0</span>
                  </div>
                </div>

                {/* Content Column */}
                <div className="flex-1 flex flex-col justify-center text-center md:text-left">
                  <div className="text-agri-200 mb-4 mx-auto md:mx-0">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.01697 21L5.01697 18C5.01697 16.8954 5.9124 16 7.01697 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.01697C5.46468 8 5.01697 8.44772 5.01697 9V11C5.01697 11.5523 4.56925 12 4.01697 12H3.01697V5H13.017V12H12.017C11.4647 12 11.017 12.4477 11.017 13V15C11.017 18.3137 8.33067 21 5.01697 21H3.01697V21H5.01697Z" />
                    </svg>
                  </div>

                  <p className="text-xl md:text-2xl text-gray-700 font-medium italic mb-8 leading-relaxed">
                    "{testimonials[current].text}"
                  </p>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{testimonials[current].name}</h3>
                    <p className="text-agri-600 font-medium">{testimonials[current].location}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 z-20">
            <button
              onClick={prev}
              className="bg-white text-gray-800 rounded-full p-3 shadow-lg hover:bg-agri-600 hover:text-white transition-all transform hover:scale-110 border border-gray-100"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
          <div className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 z-20">
            <button
              onClick={next}
              className="bg-white text-gray-800 rounded-full p-3 shadow-lg hover:bg-agri-600 hover:text-white transition-all transform hover:scale-110 border border-gray-100"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-3 mt-12">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > current ? 1 : -1);
                  setCurrent(index);
                }}
                className={`transition-all duration-300 rounded-full h-2.5 ${index === current ? "w-8 bg-agri-600" : "w-2.5 bg-gray-300 hover:bg-agri-400"
                  }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
