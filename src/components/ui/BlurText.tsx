import { motion } from "framer-motion";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  blurAmount?: number;
}

export function BlurText({ 
  text, 
  className = "", 
  delay = 0, 
  duration = 1,
  blurAmount = 10
}: BlurTextProps) {
  return (
    <motion.span
      className={className}
      initial={{ 
        filter: `blur(${blurAmount}px)`,
        opacity: 0 
      }}
      animate={{ 
        filter: "blur(0px)",
        opacity: 1 
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: "easeOut"
      }}
    >
      {text}
    </motion.span>
  );
} 