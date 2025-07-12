import { memo } from 'react'
import { cn } from "@/lib/utils";
import styles from "./beams-background.module.css";

interface BeamsBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  intensity?: "low" | "medium" | "high";
}

const opacityMap = {
  low: "opacity-30",
  medium: "opacity-50",
  high: "opacity-70",
} as const;

const BeamsBackgroundInner = ({
  children,
  className,
  intensity = "medium",
  ...props
}: BeamsBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-black",
        className
      )}
      {...props}
    >
      {/* Animated beams */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          opacityMap[intensity]
        )}
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      >
        <div
          className={cn(
            "absolute h-[200%] w-[40%] bg-gradient-to-r from-violet-500/30 to-purple-500/30 blur-[120px] transform -rotate-35 -translate-y-1/2",
            styles.beam
          )}
          style={{
            willChange: 'transform',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
        />
        <div
          className={cn(
            "absolute h-[200%] w-[40%] bg-gradient-to-r from-blue-500/30 to-cyan-500/30 blur-[120px] transform -rotate-35 -translate-y-1/2",
            styles.beam2
          )}
          style={{
            willChange: 'transform',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
        />
        <div
          className={cn(
            "absolute h-[200%] w-[40%] bg-gradient-to-r from-fuchsia-500/30 to-pink-500/30 blur-[120px] transform -rotate-35 -translate-y-1/2",
            styles.beam3
          )}
          style={{
            willChange: 'transform',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
        />
        <div
          className={cn(
            "absolute h-[200%] w-[40%] bg-gradient-to-r from-indigo-500/30 to-violet-500/30 blur-[120px] transform -rotate-35 -translate-y-1/2",
            styles.beam4
          )}
          style={{
            willChange: 'transform',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export const BeamsBackground = memo(BeamsBackgroundInner); 