import { motion } from "framer-motion";
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
      const { data, error } = await addToWaitlist(email);

      if (error) {
        // Handle specific error cases
        if (error.code === 'DUPLICATE_EMAIL' || error.status === 409) {
          toast.error("Already on the waitlist!", {
            description: "This email is already registered. We'll keep you posted!",
            className: "bg-[#FAF9F6] text-neutral-800 dark:bg-zinc-900 dark:text-white border border-yellow-200 dark:border-yellow-500 shadow-lg rounded-xl px-4 py-3",
          });
        } else {
          toast.error("Something went wrong", {
            description: "Please try again later.",
            className: "bg-[#FAF9F6] text-neutral-800 dark:bg-zinc-900 dark:text-white border border-red-200 dark:border-red-500 shadow-lg rounded-xl px-4 py-3",
          });
        }
        return; // Exit early on error
      }
      
      // Success case - Show toast notification with Sonner
      toast.success("You're on the waitlist!", {
        description: "We'll keep you posted as things roll out.",
        icon: <CheckCircle className="text-yellow-600 dark:text-purple-500" />,
        className: "bg-[#FAF9F6] text-neutral-800 dark:bg-zinc-900 dark:text-white border border-yellow-200 dark:border-purple-500 shadow-lg rounded-xl px-4 py-3",
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
    } catch (error: any) {
      console.error('Unexpected error in waitlist submission:', error);
      toast.error("Something went wrong", {
        description: "Please try again later.",
        className: "bg-[#FAF9F6] text-neutral-800 dark:bg-zinc-900 dark:text-white border border-red-200 dark:border-red-500 shadow-lg rounded-xl px-4 py-3",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
      <motion.div 
        className="text-center"
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        <h1 className="text-5xl font-semibold tracking-tight text-balance text-neutral-800 dark:text-foreground sm:text-7xl">
          Welcome to the future of music production tracking
        </h1>
        <p className="mt-8 text-lg font-medium text-pretty text-neutral-600 dark:text-muted-foreground sm:text-xl/8">
          Your creative rhythm. Your data-powered music companion.
        </p>
        <p className="mt-4 text-base font-medium text-pretty text-neutral-600 dark:text-muted-foreground sm:text-lg/8">
          WavTrack helps producers, artists, and hobbyists track sessions, hit creative goals, and stay inspired.
        </p>
        
        <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row w-full max-w-md gap-2 mt-10 mx-auto">
          <Input
            ref={emailInputRef}
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 h-12 text-base border border-neutral-200 rounded-xl px-4 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-purple-500 focus:border-transparent bg-white dark:bg-background text-neutral-800 dark:text-foreground min-w-0"
            required
          />
          <Button 
            type="submit" 
            className="h-12 px-6 bg-yellow-100 hover:bg-yellow-200 dark:bg-gradient-to-r dark:from-[#8257E5] dark:to-[#B490FF] dark:hover:from-[#8257E5]/90 dark:hover:to-[#B490FF]/90 text-yellow-900 dark:text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/20 dark:hover:shadow-purple-500/20 w-full sm:w-auto"
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
        
        <div className="mt-6 text-sm text-neutral-500 dark:text-muted-foreground">
          Join the growing community of producers on the waitlist
        </div>
      </motion.div>
    </div>
  );
} 