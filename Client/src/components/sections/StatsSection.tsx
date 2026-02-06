
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const stats = [
  { value: 5000, label: "Farmers Connected", suffix: "+" },
  { value: 15000, label: "Hectares Analyzed", suffix: "+" },
  { value: 30, label: "Agricultural Programs", suffix: "" },
  { value: 18, label: "Indian States Covered", suffix: "" }
];

export default function StatsSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-agri-900 text-white relative overflow-hidden"
    >
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Empowering Farmers <br />
              <span className="text-leaf-400">Across the Globe</span>
            </h2>
            <p className="text-agri-100 text-lg max-w-xl">
              Our platform helps farmers reduce costs, increase yields, and make data-driven decisions that impact their bottom line and the environment.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors"
              >
                <CountUp
                  start={0}
                  end={stat.value}
                  duration={2.5}
                  isVisible={isVisible}
                  suffix={stat.suffix}
                  className="text-4xl md:text-5xl font-bold text-leaf-400 mb-2 block"
                />
                <span className="text-gray-300 font-medium">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface CountUpProps {
  start: number;
  end: number;
  duration: number;
  isVisible: boolean;
  suffix: string;
  className?: string;
}

function CountUp({ start, end, duration, isVisible, suffix, className = "" }: CountUpProps) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressPercent = Math.min(progress / (duration * 1000), 1);

      // Easing function for smoother animation
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progressPercent);

      const currentCount = Math.floor(start + easedProgress * (end - start));
      setCount(currentCount);

      if (progressPercent < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [start, end, duration, isVisible]);

  return <div className={className}>{count}{suffix}</div>;
}
