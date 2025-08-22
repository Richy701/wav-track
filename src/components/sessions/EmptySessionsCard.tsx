import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptySessionsCardProps {
  onStartSession?: () => void;
  className?: string;
}

export const EmptySessionsCard = React.forwardRef<HTMLDivElement, EmptySessionsCardProps>(
  ({ onStartSession, className }, ref) => {
    const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
    const [hovered, setHovered] = React.useState(false);

    const handleMove = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePos({
          x: (x / rect.width - 0.5) * 15, // Reduced rotation for subtlety
          y: (y / rect.height - 0.5) * -15,
        });
      },
      []
    );

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative w-full h-full min-h-[400px] overflow-hidden rounded-xl transform-gpu transition-all duration-300 ease-out",
          "bg-gradient-to-b from-muted/5 to-muted/10 dark:from-muted/10 dark:to-muted/20",
          "border border-border/50",
          "shadow-sm hover:shadow-md",
          className
        )}
        onMouseMove={handleMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setMousePos({ x: 0, y: 0 });
        }}
        animate={{
          rotateX: mousePos.y,
          rotateY: mousePos.x,
        }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.5 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="flex flex-col items-center justify-center h-full min-h-full py-8 text-center">
          <motion.div
            className="flex items-center justify-center"
            animate={{
              scale: hovered ? 1.1 : 1.05,
              rotate: hovered ? [0, 5, -5, 0] : 0,
            }}
            transition={{
              scale: { duration: 0.2 },
              rotate: { duration: 0.5, ease: "easeInOut" },
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              fill="currentColor"
              viewBox="0 0 256 256"
              className="w-14 h-14 text-muted-foreground/20"
            >
              <path d="M128,44a92,92,0,1,0,92,92A92.1,92.1,0,0,0,128,44Zm0,176a84,84,0,1,1,84-84A84.09,84.09,0,0,1,128,220ZM170.83,93.17a4,4,0,0,1,0,5.66l-40,40a4,4,0,1,1-5.66-5.66l40-40A4,4,0,0,1,170.83,93.17ZM100,16a4,4,0,0,1,4-4h48a4,4,0,0,1,0,8H104A4,4,0,0,1,100,16Z" />
            </svg>
          </motion.div>

          <motion.div
            className="mt-4 space-y-1"
            animate={{ y: hovered ? -2 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <h4 className="text-sm font-medium text-foreground">No studio sessions yet</h4>
            <p className="text-xs text-muted-foreground max-w-[200px]">
              Start your first session to begin tracking your music productivity.
            </p>
          </motion.div>

          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-6"
              onClick={onStartSession}
            >
              <Play className="w-2.5 h-2.5 mr-1" />
              Start Session
            </Button>
          </motion.div>
        </div>

        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)`,
            transform: "translateZ(2px)",
          }}
          animate={{ opacity: hovered ? 0.5 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    );
  }
);

EmptySessionsCard.displayName = "EmptySessionsCard"; 