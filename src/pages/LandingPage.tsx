import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useRef, useEffect, memo, lazy, Suspense } from "react";
import { ResponsiveImage } from "@/components/ui/responsive-image";
// Optimized icon imports
import { CheckCircle } from "@phosphor-icons/react/dist/icons/CheckCircle";
import { Spinner } from "@phosphor-icons/react/dist/icons/Spinner";
import { BaseLayout } from "@/components/layout/BaseLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Variants } from "framer-motion";
import { addToWaitlist } from "@/lib/waitlist";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LANDING_PAGE_IMAGES } from "@/config/images";
import { HeroSectionDemo } from "@/components/ui/hero-section-demo";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy components for better performance
const MagicBento = lazy(() => import("@/components/ui/MagicBento"));
const FeatureShowcase = lazy(() => import("@/components/landing/FeatureShowcase"));
const FeatureShowcase2 = lazy(() => import("@/components/landing/FeatureShowcase2"));
const FeatureShowcase3 = lazy(() => import("@/components/landing/FeatureShowcase3"));
const VideoFeatureHighlights = lazy(() => import("@/components/features/VideoFeatureHighlights").then(module => ({ default: module.VideoFeatureHighlights })));
const FAQSection = lazy(() => import("@/components/ui/faq-section").then(module => ({ default: module.FAQSection })));

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

// Loading skeleton components
const MagicBentoSkeleton = memo(() => (
  <div className="w-full max-w-6xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-xl" />
      ))}
    </div>
  </div>
));

const FeatureShowcaseSkeleton = memo(() => (
  <div className="container mx-auto px-4 py-16">
    <div className="space-y-8">
      <Skeleton className="h-12 w-64 mx-auto" />
      <Skeleton className="h-6 w-96 mx-auto" />
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <Skeleton className="h-64 rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  </div>
));

const FAQSkeleton = memo(() => (
  <div className="container mx-auto px-4 py-16">
    <Skeleton className="h-12 w-64 mx-auto mb-8" />
    <div className="space-y-4 max-w-3xl mx-auto">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  </div>
));

// Memoized LandingPage component
const LandingPage = memo(function LandingPage() {
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
      const { data, error } = await addToWaitlist(email);

      if (error) {
        // Handle specific error cases
        if (error.code === 'DUPLICATE_EMAIL' || error.status === 409) {
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
        return; // Exit early on error
      }

      // Success case - Show confetti effect
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
      console.error('Unexpected error in waitlist submission:', error);
      toast.error("Something went wrong", {
        description: "Please try again later.",
        className: "bg-white text-black dark:bg-zinc-900 dark:text-white border border-red-500 shadow-lg rounded-xl px-4 py-3",
      });
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
      <Suspense fallback={
        <div className="header-fallback h-16 bg-background/95 backdrop-blur border-b border-border/50" />
      }>
        <Header />
      </Suspense>
      <main className="flex-1">
        {/* Hero Section */}
        <Suspense fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        }>
          <HeroSectionDemo />
        </Suspense>
        
        {/* Main Content Section with Seamless Background */}
        <div className="relative w-full">
          {/* Continuous background matching hero section exactly */}
          <div className="absolute inset-0 bg-white dark:bg-purple-950/10 bg-none dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
          
          {/* MagicBento Section */}
          <div className="relative z-10">
            {/* Optimized Background Image - Lazy loaded */}
            <div className="absolute inset-0 z-0">
              <picture>
                <source
                  type="image/avif"
                  srcSet="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=480&fit=crop&q=60&fm=avif 480w,
                          https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=768&fit=crop&q=60&fm=avif 768w,
                          https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1024&fit=crop&q=60&fm=avif 1024w"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1024px"
                />
                <source
                  type="image/webp"
                  srcSet="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=480&fit=crop&q=60&fm=webp 480w,
                          https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=768&fit=crop&q=60&fm=webp 768w,
                          https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1024&fit=crop&q=60&fm=webp 1024w"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1024px"
                />
                <img
                  src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1024&h=600&q=60"
                  srcSet="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=480&fit=crop&q=60 480w,
                          https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=768&fit=crop&q=60 768w,
                          https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1024&fit=crop&q=60 1024w"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1024px"
                  alt="Music Production Interface"
                  className="w-full h-full object-cover opacity-70 filter brightness-75"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
            
            {/* MagicBento Content - Optimized for performance */}
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
                <Suspense fallback={<MagicBentoSkeleton />}>
                  <MagicBento 
                    textAutoHide={true}
                    enableStars={false}
                    enableSpotlight={false}
                    enableBorderGlow={true}
                    enableTilt={false}
                    enableMagnetism={false}
                    clickEffect={false}
                    spotlightRadius={200}
                    particleCount={6}
                    glowColor="132, 0, 255"
                  />
                </Suspense>
              </div>
            </div>
          </div>
          
          {/* Divider */}
          <div className="relative z-10 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8" />
          
          {/* Feature Showcases - Lazy loaded with skeletons */}
          <div className="relative z-10">
            <Suspense fallback={<FeatureShowcaseSkeleton />}>
              <FeatureShowcase />
            </Suspense>
            
            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent my-8" />
            
            <Suspense fallback={<FeatureShowcaseSkeleton />}>
              <FeatureShowcase2 />
            </Suspense>
            
            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent my-8" />
            
            <Suspense fallback={<FeatureShowcaseSkeleton />}>
              <FeatureShowcase3 />
            </Suspense>
          </div>

          {/* Divider */}
          <div className="relative z-10 w-full h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent my-12" />

          {/* FAQ Section - Lazy loaded */}
          <div className="relative z-10">
            <Suspense fallback={<FAQSkeleton />}>
              <FAQSection />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
});

export default LandingPage; 