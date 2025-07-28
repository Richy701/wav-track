import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { 
  PhosphorLogo, 
  Headphones, 
  SpeakerHigh, 
  Brain,
  MusicNote,
  Microphone,
  WaveSquare,
  Target,
  Users,
  Sliders,
  GridFour,
  Waveform,
  CheckCircle,
  Spinner
} from "@phosphor-icons/react";
import { BaseLayout } from "@/components/layout/BaseLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Variants } from "framer-motion";
import { addToWaitlist } from "@/lib/waitlist";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/landing/HeroSection";
import { LANDING_PAGE_IMAGES } from "@/config/images";
import MagicBento from "@/components/ui/MagicBento";
import { HeroSectionDemo } from "@/components/ui/hero-section-demo";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import FeatureShowcase2 from "@/components/landing/FeatureShowcase2";
import FeatureShowcase3 from "@/components/landing/FeatureShowcase3";


const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Reset confetti after animation
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await addToWaitlist(email);

      if (error) throw error;

      // Show confetti effect
      setShowConfetti(true);
      
      // Show toast notification with Sonner
      toast.success("You're on the waitlist!", {
        description: "We'll keep you posted as things roll out.",
        icon: <CheckCircle className="text-purple-500" />,
        className: "bg-white text-black dark:bg-zinc-900 dark:text-white border border-purple-500 shadow-lg rounded-xl px-4 py-3",
        duration: 4000,
      });
      
      // Reset form after a delay
      setTimeout(() => {
        setEmail("");
      }, 3000);
    } catch (error: any) {
      // Handle specific error cases
      if (error?.code === 'DUPLICATE_EMAIL' || error?.status === 409) {
        toast.error("Already on the waitlist!", {
          description: "This email is already registered. We'll keep you posted!",
          className: "bg-white text-black dark:bg-zinc-900 dark:text-white border border-purple-500 shadow-lg rounded-xl px-4 py-3",
        });
      } else {
        toast.error("Something went wrong", {
          description: "Please try again later.",
          className: "bg-white text-black dark:bg-zinc-900 dark:text-white border border-red-500 shadow-lg rounded-xl px-4 py-3",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToEmailInput = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 800); // Wait for scroll to complete
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSectionDemo />
        
        {/* MagicBento Section with Background */}
        <div className="relative w-full">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <picture>
              <source
                type="image/avif"
                srcSet="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=480&fit=crop&q=75&fm=avif 480w,
                        https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=768&fit=crop&q=75&fm=avif 768w,
                        https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1024&fit=crop&q=75&fm=avif 1024w,
                        https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&fit=crop&q=75&fm=avif 1920w"
                sizes="100vw"
              />
              <source
                type="image/webp"
                srcSet="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=480&fit=crop&q=75&fm=webp 480w,
                        https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=768&fit=crop&q=75&fm=webp 768w,
                        https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1024&fit=crop&q=75&fm=webp 1024w,
                        https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&fit=crop&q=75&fm=webp 1920w"
                sizes="100vw"
              />
              <img
                src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1920&h=1080&q=75"
                srcSet="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=480&fit=crop&q=75 480w,
                        https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=768&fit=crop&q=75 768w,
                        https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1024&fit=crop&q=75 1024w,
                        https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&fit=crop&q=75 1920w"
                sizes="100vw"
                alt="Music Production Interface"
                className="w-full h-full object-cover opacity-60 filter brightness-75"
                loading="eager"
                decoding="sync"
                data-fetchpriority="high"
              />
            </picture>
          </div>
          
          {/* Content Overlay */}
          <div className="relative z-10 py-12 px-4">
            <div className="text-center mb-8">
              <p className="lg:text-lg my-2 text-sm font-light uppercase tracking-widest text-muted-foreground/80">
                EVERYTHING YOU NEED
              </p>
              <h2 className="text-4xl font-semibold tracking-tight text-balance bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/80 dark:from-foreground dark:to-foreground/60">
                Level Up Your <span className="bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent">Production</span>
              </h2>
            </div>
            <div className="w-full max-w-6xl mx-auto">
              <MagicBento 
                textAutoHide={true}
                enableStars={false}
                enableSpotlight={true}
                enableBorderGlow={true}
                enableTilt={true}
                enableMagnetism={true}
                clickEffect={true}
                spotlightRadius={300}
                particleCount={12}
                glowColor="132, 0, 255"
              />
            </div>
          </div>
        </div>
        
        {/* Content sections */}
        <div className="relative w-full">
          <FeatureShowcase />
          <FeatureShowcase2 />
          <FeatureShowcase3 />
        </div>
      </main>
      <Footer />
    </div>
  );
} 