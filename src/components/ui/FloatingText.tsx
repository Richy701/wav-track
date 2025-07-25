import { motion } from "framer-motion";

interface FloatingTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
}

export function FloatingText({ 
  text, 
  className = "", 
  delay = 0, 
  duration = 2,
  y = 5
}: FloatingTextProps) {
  return (
    <motion.span
      className={className}
      animate={{
        y: [0, -y, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
    >
      {text}
    </motion.span>
  );
} 