import { BeamsBackground } from "@/components/ui/beams-background";
import { motion } from "framer-motion";

export function BeamsBackgroundDemo() {
    return (
        <BeamsBackground>
            <div className="flex flex-col items-center justify-center gap-6 px-4 text-center">
                <motion.h1
                    className="text-6xl md:text-7xl lg:text-8xl font-semibold text-white tracking-tighter"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Beams
                    <br />
                    Background
                </motion.h1>
                <motion.p
                    className="text-lg md:text-2xl lg:text-3xl text-white/70 tracking-tighter"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    For your pleasure
                </motion.p>
            </div>
        </BeamsBackground>
    );
} 