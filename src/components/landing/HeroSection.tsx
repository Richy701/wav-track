import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fadeInUp } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@phosphor-icons/react";
import { useState, useRef } from "react";
import { addToWaitlist } from "@/lib/waitlist";
import { toast } from "sonner";
import { CheckCircle } from "@phosphor-icons/react";

interface HeroSectionProps {
  onWaitlistSubmit?: () => void;
}

export default function HeroSection({ onWaitlistSubmit }: HeroSectionProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await addToWaitlist(email);

      if (error) throw error;
      
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

      // Call the callback if provided
      if (onWaitlistSubmit) {
        onWaitlistSubmit();
      }
    } catch (error) {
      toast.error("Something went wrong", {
        description: "Please try again later.",
        className: "bg-white text-black dark:bg-zinc-900 dark:text-white border border-red-500 shadow-lg rounded-xl px-4 py-3",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative isolate overflow-hidden">
      {/* Gradient background with blur effects */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div 
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" 
          style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}
        ></div>
      </div>
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <motion.div 
          className="text-center"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <h1 className="text-5xl font-semibold tracking-tight text-balance text-gray-900 dark:text-white sm:text-7xl">Welcome to the future of music production tracking</h1>
          <p className="mt-8 text-lg font-medium text-pretty text-gray-500 dark:text-gray-400 sm:text-xl/8">Your creative rhythm. Your data-powered music companion.</p>
          <p className="mt-4 text-base font-medium text-pretty text-gray-500 dark:text-gray-400 sm:text-lg/8">WavTrack helps producers, artists, and hobbyists track sessions, hit creative goals, and stay inspired.</p>
          
          <form onSubmit={handleWaitlistSubmit} className="flex w-full max-w-md gap-2 mt-10 mx-auto">
            <Input
              ref={emailInputRef}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 text-base bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <Button 
              type="submit" 
              className="h-12 px-6 bg-gradient-to-r from-[#8257E5] to-[#B490FF] hover:from-[#8257E5]/90 hover:to-[#B490FF]/90 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  <span>Joining...</span>
                </div>
              ) : (
                "Join Waitlist"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Join 500+ producers already on the waitlist
          </div>
        </motion.div>
      </div>
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
        <div 
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" 
          style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}
        ></div>
      </div>
    </section>
  );
} 