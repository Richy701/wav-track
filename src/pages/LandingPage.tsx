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
import BaseLayout from "@/components/layout/BaseLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Variants } from "framer-motion";
import { addToWaitlist } from "@/lib/waitlist";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/landing/HeroSection";
import { LANDING_PAGE_IMAGES } from "@/config/images";

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const features = [
  {
    icon: Headphones,
    title: "Track Your Music",
    description: "Monitor your listening habits and discover patterns in your music taste."
  },
  {
    icon: Target,
    title: "Set Creative Goals",
    description: "Stay productive by setting short-term music goals and tracking your progress."
  },
  {
    icon: Users,
    title: "Collaborate with Producers",
    description: "Share projects, request feedback, and grow with a community of beatmakers."
  }
];

const testimonials = [
  {
    quote: "WavTrack helped me finish 4 tracks this month. The session tracking is a game-changer for productivity.",
    author: "K-Soul",
    role: "Producer",
    icon: Sliders
  },
  {
    quote: "This is the Notion for beatmakers. I can finally organize my creative process and track my progress.",
    author: "AudioCraft",
    role: "Beat Producer",
    icon: GridFour
  },
  {
    quote: "The AI recommendations are spot on. Found some amazing collaborators through the platform.",
    author: "WaveRider",
    role: "Artist",
    icon: Waveform
  }
];

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
    } catch (error) {
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <Header />
      
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: ['#8257E5', '#B490FF', '#FFD700', '#FF6B6B', '#4CAF50'][Math.floor(Math.random() * 5)],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ 
                y: -20, 
                x: 0,
                opacity: 0 
              }}
              animate={{ 
                y: window.innerHeight + 20, 
                x: (Math.random() - 0.5) * 200,
                opacity: [0, 1, 1, 0],
                rotate: Math.random() * 360
              }}
              transition={{ 
                duration: 2 + Math.random() * 2,
                ease: "easeOut",
                delay: Math.random() * 0.5
              }}
            />
          ))}
        </div>
      )}

      <main className="flex-1">
        <HeroSection onWaitlistSubmit={() => setShowConfetti(true)} />

        {/* Features Section */}
        <section className="w-full">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mt-16">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <Card className="rounded-xl p-6 transition hover:scale-[1.02] hover:shadow-md border-[#8257E5]/20 hover:border-[#8257E5]/40 bg-white dark:bg-black">
                    <div className="flex flex-col items-center space-y-4">
                      <feature.icon className="h-12 w-12 text-[#8257E5]" weight="duotone" />
                      <CardTitle className="text-xl font-semibold bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent">
                        {feature.title}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Preview */}
        <section className="w-full">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
            <motion.div
              className="relative rounded-2xl overflow-hidden aspect-video bg-gradient-to-br from-[#8257E5]/5 to-[#B490FF]/5 dark:from-[#8257E5]/10 dark:to-[#B490FF]/10"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <ResponsiveImage
                src={LANDING_PAGE_IMAGES.hero.url}
                alt={LANDING_PAGE_IMAGES.hero.alt}
                className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-30"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 50vw"
                priority={true}
                fetchPriority="high"
                quality={85}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="relative flex flex-col items-center justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  {/* Glassmorphism Container */}
                  <div className="bg-black/30 backdrop-blur-md rounded-xl px-6 py-4">
                    <div className="relative">
                      <div className="text-5xl font-bold tracking-tighter bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent">
                        WT
                      </div>
                      <p className="text-sm text-white/50 tracking-wide mt-2 text-center">
                        WavTrack – Productivity for Music Producers
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="w-full">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
            <motion.div
              className="text-center space-y-8"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent">
                Trusted by Music Enthusiasts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.author} className="rounded-xl p-6 transition hover:scale-[1.02] hover:shadow-md border-[#8257E5]/20 hover:border-[#8257E5]/40 bg-white dark:bg-black">
                    <CardContent className="p-0 space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#8257E5] to-[#B490FF] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/25 group">
                          <testimonial.icon 
                            weight="duotone" 
                            className="h-5 w-5 text-white transition-transform duration-300 group-hover:scale-110" 
                          />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-foreground">{testimonial.author}</p>
                          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm text-left">
                        "{testimonial.quote}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
            <motion.div
              className="relative bg-gradient-to-r from-[#8257E5]/90 to-[#B490FF]/90 dark:from-[#8257E5] dark:to-[#B490FF] rounded-2xl p-8 text-center text-white overflow-hidden"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <img
                src={LANDING_PAGE_IMAGES.finalCta.url}
                alt={LANDING_PAGE_IMAGES.finalCta.alt}
                className="absolute inset-0 w-full h-full object-cover opacity-20"
              />
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">Ready to Start Your Music Journey?</h2>
                <p className="mb-6 text-white/90">Join our waitlist today and be the first to experience WavTrack.</p>
                <Button
                  onClick={scrollToEmailInput}
                  className="bg-white text-[#8257E5] hover:bg-white/90 rounded-xl px-5 py-2 font-medium transition hover:opacity-90"
                >
                  Join Waitlist
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 