import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FeatureCard {
  title: string;
  description: string;
  image: string;
  alt: string;
  href?: string;
}

const features: FeatureCard[] = [
  {
    title: "Track Your Sessions",
    description: "Monitor your beat-making sessions with our smart timer and productivity insights.",
    image: "/images/features/wavtrack-screengrabs/Pomodoro Timer component.png",
    alt: "Pomodoro Timer component showing session tracking",
  },
  {
    title: "Visualize Your Progress",
    description: "See your production journey with detailed charts and analytics.",
    image: "/images/features/wavtrack-screengrabs/Charts components 2.png",
    alt: "Charts showing production progress and analytics",
  },
  {
    title: "Manage Your Projects",
    description: "Organize all your beats and tracks in one central workspace.",
    image: "/images/features/wavtrack-screengrabs/Recent project Component .png",
    alt: "Recent projects component showing organized workflow",
  },
  {
    title: "Earn Achievements",
    description: "Level up your producer game by unlocking rewards and building streaks.",
    image: "/images/features/wavtrack-screengrabs/Achievement Cards 2.png",
    alt: "Achievement cards showing unlocked rewards",
  },
  {
    title: "Analyze Your Audio",
    description: "Advanced waveform visualization and audio analysis tools.",
    image: "/images/features/wavtrack-screengrabs/Charts data components.png",
    alt: "Audio analysis charts and data visualization",
  },
  {
    title: "Stay Motivated",
    description: "Build momentum with streaks, goals, and progress tracking.",
    image: "/images/features/wavtrack-screengrabs/achievement cards 1.png",
    alt: "Motivation and achievement tracking interface",
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

function FeatureCard({ feature, index }: { feature: FeatureCard; index: number }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
      className="group w-full"
    >
      <div className="bg-muted/10 rounded-2xl shadow-md overflow-hidden border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-[#8257E5]/10">
        <div className="relative overflow-hidden">
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="w-full aspect-[16/9] bg-muted animate-pulse" />
          )}
          
          <img 
            src={feature.image} 
            alt={feature.alt} 
            className={cn(
              "w-full h-auto object-cover aspect-[16/9] transition-all duration-300 group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#8257E5]/20 to-[#B490FF]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="p-4 sm:p-6 lg:p-8">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-3 group-hover:text-[#8257E5] transition-colors duration-300">
            {feature.title}
          </h3>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function FeatureGrid() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-screen-xl mx-auto">
      <motion.div 
        className="text-center mb-12"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-foreground">
          Everything You Need to{" "}
          <span className="bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent">
            Level Up
          </span>
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
          Powerful tools designed specifically for music producers to track, analyze, and improve their workflow.
        </p>
      </motion.div>

      <motion.div 
        className="flex flex-col space-y-8 sm:space-y-12"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
      >
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </motion.div>

      {/* Call to action */}
      <motion.div 
        className="text-center mt-16 sm:mt-20"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <p className="text-muted-foreground mb-6 text-sm sm:text-base lg:text-lg">
          Ready to transform your music production workflow?
        </p>
        <button className="bg-gradient-to-r from-[#8257E5] to-[#B490FF] text-white px-8 sm:px-10 py-4 rounded-xl font-medium hover:from-[#8257E5]/90 hover:to-[#B490FF]/90 transition-all duration-200 hover:shadow-lg hover:shadow-[#8257E5]/25 text-base sm:text-lg">
          Get Started Today
        </button>
      </motion.div>
    </section>
  );
} 