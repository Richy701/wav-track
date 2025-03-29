import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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
  Waveform
} from "@phosphor-icons/react";
import BaseLayout from "@/components/layout/BaseLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Variants } from "framer-motion";

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
  const { toast } = useToast();
  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert({ email, id: crypto.randomUUID() });

      if (error) throw error;

      toast({
        title: "🎉 You're on the waitlist!",
        description: "We'll notify you when WavTrack launches.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
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
    <BaseLayout>
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="relative flex-1 flex items-center justify-center px-4 md:px-8 py-12 md:py-20 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&h=1080&fit=crop&q=80"
              alt="Music Production Studio"
              className="w-full h-full object-cover opacity-10 dark:opacity-20 blur-sm transform transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/40 dark:from-background/90 dark:to-background/60" />
          </div>

          <motion.div
            className="text-center space-y-6 max-w-4xl mx-auto relative z-10"
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent animate-pulse">
              WavTrack
            </h1>
            <div className="space-y-4">
              <p className="text-xl text-muted-foreground">
                Welcome to the future of music production tracking
              </p>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Your creative rhythm. Your data-powered music companion.
              </p>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                WavTrack helps producers, artists, and hobbyists track sessions, hit creative goals, and stay inspired.
              </p>
            </div>
            
            <form onSubmit={handleWaitlistSubmit} className="flex w-full max-w-md gap-2 mt-6 mx-auto">
              <Input
                ref={emailInputRef}
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl px-4 py-2 shadow-sm border border-muted text-sm bg-white dark:bg-black"
              />
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="rounded-xl px-5 py-2 font-medium bg-gradient-to-r from-[#8257E5] to-[#B490FF] hover:from-[#8257E5]/90 hover:to-[#B490FF]/90 text-white transition hover:opacity-90 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
              >
                {isLoading ? "Joining..." : "Join Waitlist"}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground">Over 1,200 sessions tracked this month</p>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="px-4 md:px-8 py-12 md:py-20">
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
        </section>

        {/* Product Preview */}
        <section className="px-4 md:px-8 py-12 md:py-20">
          <motion.div
            className="relative rounded-2xl overflow-hidden aspect-video bg-gradient-to-br from-[#8257E5]/5 to-[#B490FF]/5 dark:from-[#8257E5]/10 dark:to-[#B490FF]/10"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <img
              src="https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=1920&h=1080&fit=crop&q=80"
              alt="Music Production Interface"
              className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-30"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                className="relative flex flex-col items-center justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 z-[-1] blur-2xl bg-gradient-to-br from-purple-400/30 to-purple-600/30" />
                
                {/* Glassmorphism Container */}
                <div className="bg-black/30 backdrop-blur-md rounded-xl px-6 py-4 shadow-xl shadow-purple-700/20">
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
        </section>

        {/* Social Proof */}
        <section className="px-4 md:px-8 py-12 md:py-20">
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
        </section>

        {/* Final CTA */}
        <section className="px-4 md:px-8 py-12 md:py-20">
          <motion.div
            className="relative bg-gradient-to-r from-[#8257E5]/90 to-[#B490FF]/90 dark:from-[#8257E5] dark:to-[#B490FF] rounded-2xl p-8 text-center text-white overflow-hidden"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <img
              src="https://images.unsplash.com/photo-1593697821252-0c9137d9fc45?w=1920&h=1080&fit=crop&q=80"
              alt="Recording Studio Setup"
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
        </section>
      </div>
    </BaseLayout>
  );
} 