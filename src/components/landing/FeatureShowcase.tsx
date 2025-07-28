import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp } from "@/lib/animations";
import { BlurText } from "@/components/ui/BlurText";

export default function FeatureShowcase() {
  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 relative">
      <div className="mx-auto max-w-7xl">
        <div className="bg-background/60 backdrop-blur-xl border-2 border-purple-500/5 dark:bg-background/10 dark:backdrop-blur-xl dark:border-purple-500/10 rounded-2xl p-8 lg:p-12 transition-all duration-300 ease-in-out hover:shadow-[0_0_30px_-10px_rgba(130,87,229,0.3)] dark:hover:shadow-[0_0_30px_-10px_rgba(130,87,229,0.2)] hover:border-purple-500/30 dark:hover:border-purple-500/20 bg-gradient-to-b from-background via-background/80 to-background/50 dark:from-background/20 dark:via-background/10 dark:to-background/5 outline outline-1 outline-purple-500/10 dark:outline-purple-500/5 hover:outline-purple-500/20 dark:hover:outline-purple-500/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance text-neutral-800 dark:text-foreground">
                <BlurText 
                  text="Your Dashboard, Your Workflow" 
                  delay={0.5}
                  duration={3.5}
                  blurAmount={8}
                  className="text-neutral-800 dark:text-foreground"
                />
              </h2>
              <p className="text-lg sm:text-xl text-pretty text-neutral-600 dark:text-muted-foreground leading-relaxed">
                <BlurText 
                  text="This is a screenshot of the WavTrack dashboard - your central hub for tracking sessions, monitoring progress, and staying inspired throughout your music production journey."
                  delay={1.0}
                  duration={4.0}
                  blurAmount={6}
                />
              </p>
            </div>
            
            <Button 
              size="lg"
              className="h-14 px-8 bg-gradient-to-r from-[#8257E5] to-[#B490FF] hover:from-[#8257E5]/90 hover:to-[#B490FF]/90 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 text-lg"
            >
              Get Started
            </Button>
          </motion.div>

          {/* Right Column - App Mockup */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {/* App Mockup Container */}
            <div className="relative rounded-2xl overflow-hidden">
                          {/* Screenshot */}
            <div className="aspect-[4/3] relative">
              <img
                src="/images/features/wavtrack-screengrabs/app-overview.png"
                alt="WavTrack Music Production Dashboard Screenshot"
                className="w-full h-full object-contain rounded-2xl"
                loading="lazy"
              />
            </div>
            </div>


          </motion.div>
        </div>
        </div>
      </div>
    </section>
  );
} 