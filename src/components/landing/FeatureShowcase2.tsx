import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeInUp } from "@/lib/animations";
import { BlurText } from "@/components/ui/BlurText";

export default function FeatureShowcase2() {
  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 relative">
      <div className="mx-auto max-w-7xl">
        <div className="bg-background/60 backdrop-blur-xl border-2 border-purple-500/5 dark:bg-background/10 dark:backdrop-blur-xl dark:border-purple-500/10 rounded-2xl p-8 lg:p-12 transition-all duration-300 ease-in-out hover:shadow-[0_0_30px_-10px_rgba(130,87,229,0.3)] dark:hover:shadow-[0_0_30px_-10px_rgba(130,87,229,0.2)] hover:border-purple-500/30 dark:hover:border-purple-500/20 bg-gradient-to-b from-background via-background/80 to-background/50 dark:from-background/20 dark:via-background/10 dark:to-background/5 outline outline-1 outline-purple-500/10 dark:outline-purple-500/5 hover:outline-purple-500/20 dark:hover:outline-purple-500/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Screenshot */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="relative order-2 lg:order-1"
          >
            {/* Screenshot */}
            <div className="aspect-[4/3] relative">
              <img
                src="/images/features/wavtrack-screengrabs/project-tracking.png"
                alt="WavTrack Project Management Screenshot"
                className="w-full h-full object-contain rounded-2xl"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Right Column - Content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="space-y-8 order-1 lg:order-2"
          >
            <div className="space-y-6">
              <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance text-neutral-800 dark:text-foreground">
                <BlurText 
                  text="Track Your Projects" 
                  delay={0.6}
                  duration={3.8}
                  blurAmount={10}
                  className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance"
                />
              </h2>
              <p className="text-lg sm:text-xl text-pretty text-neutral-600 dark:text-muted-foreground leading-relaxed">
                <BlurText 
                  text="Organize your music production projects with our intuitive project management system. Keep track of your beats, sessions, and creative progress all in one place."
                  delay={1.2}
                  duration={4.2}
                  blurAmount={7}
                />
              </p>
            </div>
            
            <Button 
              size="lg"
              className="h-14 px-8 bg-gradient-to-r from-[#8257E5] to-[#B490FF] hover:from-[#8257E5]/90 hover:to-[#B490FF]/90 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 text-lg"
            >
              Explore Projects
            </Button>
          </motion.div>
        </div>
        </div>
      </div>
    </section>
  );
} 