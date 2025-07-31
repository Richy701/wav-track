import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeInUp } from "@/lib/animations";
import { BlurText } from "@/components/ui/BlurText";
import { LazyVideo } from "@/components/ui/lazy-video";

export default function FeatureShowcase3() {
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
                  text="Track Your Recent Work" 
                  delay={0.7}
                  duration={4.0}
                  blurAmount={9}
                  className="text-neutral-800 dark:text-foreground"
                />
              </h2>
              <p className="text-lg sm:text-xl text-pretty text-neutral-600 dark:text-muted-foreground leading-relaxed">
                <BlurText 
                  text="Keep tabs on your latest projects and never lose track of your creative momentum. See what you've been working on recently and jump right back into your flow."
                  delay={1.4}
                  duration={4.5}
                  blurAmount={5}
                />
              </p>
            </div>
          </motion.div>

          {/* Right Column - Screenshot */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {/* Video */}
            <div className="aspect-[16/9] relative">
              <LazyVideo
                src="/videos/Wavtrack%20pro%20recent%20project%20.mp4"
                className="w-full h-full object-cover rounded-2xl"
                muted
                loop
                playsInline
                preload="auto"
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => e.currentTarget.pause()}
              />
            </div>
          </motion.div>
        </div>
        </div>
      </div>
    </section>
  );
} 