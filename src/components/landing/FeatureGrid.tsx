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
        
        <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
          <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-foreground mb-2 sm:mb-3 group-hover:text-[#8257E5] transition-colors duration-300">
            {feature.title}
          </h3>
          <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

interface FeatureGridProps {
  features?: FeatureCard[];
  className?: string;
}

export default function FeatureGrid({ features = defaultFeatures, className }: FeatureGridProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8", className)}>
      {features.map((feature, index) => (
        <FeatureCard key={feature.title} feature={feature} index={index} />
      ))}
    </div>
  );
} 