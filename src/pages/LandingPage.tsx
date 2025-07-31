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
import { VideoFeatureHighlights } from "@/components/features/VideoFeatureHighlights";
import { FAQSection } from "@/components/ui/faq-section";

const wavtrackPlans = [
  {
    name: "STARTER",
    price: "9.99",
    yearlyPrice: "8",
    period: "per month",
    features: [
      "10 projects per month",
      "Basic audio analysis",
      "Pomodoro timer",
      "Session tracking",
      "AI goal suggestions",
      "Community support",
    ],
    description: "Perfect for beginners starting their music journey",
    buttonText: "Start Free Trial",
    href: "/auth/login",
    isPopular: false,
  },
  {
    name: "PRODUCER",
    price: "19.99",
    yearlyPrice: "16",
    period: "per month",
    features: [
      "Unlimited projects",
      "Advanced audio analysis",
      "Custom timer sessions",
      "AI coaching",
      "Productivity analytics",
      "Session goals tracking",
      "Priority support",
    ],
    description: "Ideal for serious producers and growing artists",
    buttonText: "Get Started",
    href: "/auth/login",
    isPopular: true,
  },
  {
    name: "STUDIO",
    price: "49.99",
    yearlyPrice: "40",
    period: "per month",
    features: [
      "Everything in Producer",
      "Multi-user access",
      "Advanced analytics",
      "Custom branding",
      "API access",
      "Dedicated support",
      "Workflow automation",
    ],
    description: "For professional studios and large organizations",
    buttonText: "Contact Sales",
    href: "/contact",
    isPopular: false,
  },
];

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
    } catch (error: unknown) {
      // Handle specific error cases
      const errorObj = error as { code?: string; status?: number };
      if (errorObj?.code === 'DUPLICATE_EMAIL' || errorObj?.status === 409) {
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
        {/* Hero Section */}
        <HeroSectionDemo />
        
        {/* Main Content Section with Seamless Background */}
        <div className="relative w-full">
          {/* Continuous background matching hero section exactly */}
          <div className="absolute inset-0 bg-white dark:bg-purple-950/10 bg-none dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
          
          {/* MagicBento Section */}
          <div className="relative z-10">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 z-0">
              <picture>
                <source
                  type="image/avif"
                  srcSet="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=480&fit=crop&q=75&fm=avif 480w,
                          https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=768&fit=crop&q=75&fm=avif 768w,
                          https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1024&fit=crop&q=75&fm=avif 1024w,
                          https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&fit=crop&q=75&fm=avif 1924w"
                  sizes="100vw"
                />
                <source
                  type="image/webp"
                  srcSet="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=480&fit=crop&q=75&fm=webp 480w,
                          https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=768&fit=crop&q=75&fm=webp 768w,
                          https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1024&fit=crop&q=75&fm=webp 1024w,
                          https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&fit=crop&q=75&fm=webp 1924w"
                  sizes="100vw"
                />
                <img
                  src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1920&h=1080&q=75"
                  srcSet="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=480&fit=crop&q=75 480w,
                          https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=768&fit=crop&q=75 768w,
                          https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1024&fit=crop&q=75 1024w,
                          https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&fit=crop&q=75 1924w"
                  sizes="100vw"
                  alt="Music Production Interface"
                  className="w-full h-full object-cover opacity-70 filter brightness-75"
                  loading="eager"
                  decoding="sync"
                  data-fetchpriority="high"
                />
              </picture>
            </div>
            
            {/* MagicBento Content */}
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
          
          {/* Divider */}
          <div className="relative z-10 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8" />
          
          {/* Feature Showcases */}
          <div className="relative z-10">
            <FeatureShowcase />
            
            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent my-8" />
            
            <FeatureShowcase2 />
            
            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent my-8" />
            
            <FeatureShowcase3 />
          </div>

          {/* Divider */}
          <div className="relative z-10 w-full h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent my-12" />


          
          {/* FAQ Section */}
          <div className="relative z-10">
            <FAQSection />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 