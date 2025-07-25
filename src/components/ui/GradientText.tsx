import { motion } from "framer-motion";

interface GradientTextProps {
  text: string;
  className?: string;
  gradient?: string;
  animate?: boolean;
}

export function GradientText({ 
  text, 
  className = "", 
  gradient = "from-[#8257E5] to-[#B490FF]",
  animate = true 
}: GradientTextProps) {
  const baseClasses = `bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`;
  
  if (!animate) {
    return <span className={baseClasses}>{text}</span>;
  }

  return (
    <motion.span
      className={baseClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      {text}
    </motion.span>
  );
} 