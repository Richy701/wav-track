import { Share2, CalendarDays, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Feature {
  icon: JSX.Element;
  title: string;
  description: string;
  onClick?: () => void;
  theme?: "primary" | "secondary" | "accent";
}

const defaultFeatures: Feature[] = [
  {
    icon: <Share2 className="h-5 w-5" />,
    title: "Share Progress",
    description: "Share your beat-making journey",
    theme: "primary",
  },
  {
    icon: <CalendarDays className="h-5 w-5" />,
    title: "Monthly Breakdown",
    description: "Track your monthly progress",
    theme: "secondary",
  },
  {
    icon: <FileDown className="h-5 w-5" />,
    title: "Year in Review",
    description: "Your annual music journey",
    theme: "accent",
  },
];

interface FeatureCardsProps {
  features?: Feature[];
  className?: string;
}

export function FeatureCards({ features = defaultFeatures, className }: FeatureCardsProps) {
  const themeStyles = {
    primary: {
      background: "bg-gradient-to-b from-violet-500/20 via-violet-500/15 to-transparent",
      hover: "hover:from-violet-500/30 hover:via-violet-500/20 hover:to-transparent",
      border: "border-violet-500/40",
      icon: "text-violet-700 dark:text-violet-500",
      title: "text-zinc-900 dark:text-violet-100",
      description: "text-zinc-800 dark:text-violet-300/70",
      glow: "group-hover:shadow-[0_0_30px_-5px] group-hover:shadow-violet-500/50",
    },
    secondary: {
      background: "bg-gradient-to-b from-emerald-500/20 via-emerald-500/15 to-transparent",
      hover: "hover:from-emerald-500/30 hover:via-emerald-500/20 hover:to-transparent",
      border: "border-emerald-500/40",
      icon: "text-emerald-700 dark:text-emerald-500",
      title: "text-zinc-900 dark:text-emerald-100",
      description: "text-zinc-800 dark:text-emerald-300/70",
      glow: "group-hover:shadow-[0_0_30px_-5px] group-hover:shadow-emerald-500/50",
    },
    accent: {
      background: "bg-gradient-to-b from-rose-500/20 via-rose-500/15 to-transparent",
      hover: "hover:from-rose-500/30 hover:via-rose-500/20 hover:to-transparent",
      border: "border-rose-500/40",
      icon: "text-rose-700 dark:text-rose-500",
      title: "text-zinc-900 dark:text-rose-100",
      description: "text-zinc-800 dark:text-rose-300/70",
      glow: "group-hover:shadow-[0_0_30px_-5px] group-hover:shadow-rose-500/50",
    },
  };

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4", className)}>
      {features.map((feature, index) => {
        const theme = themeStyles[feature.theme || "primary"];
        return (
          <motion.button
            key={feature.title}
            onClick={feature.onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={cn(
              // Base styles
              "h-[120px] sm:h-[140px] w-full",
              "rounded-xl border",
              "bg-white/95 dark:bg-black/20",
              "backdrop-blur-sm",
              "overflow-hidden text-balance",
              // Theme styles
              theme.background,
              theme.border,
              // Hover effects
              "transition-all duration-500",
              "hover:-translate-y-1",
              theme.hover,
              theme.glow,
              // Group styling
              "group relative",
              // Focus styles
              "focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900",
              "focus:ring-violet-500/40 dark:focus:ring-violet-500/40"
            )}
          >
            {/* Content container */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-3 space-y-2 sm:space-y-3">
              {/* Icon */}
              <div
                className={cn(
                  "rounded-lg p-2",
                  "bg-white/95 dark:bg-black/20",
                  "ring-1 ring-black/10 dark:ring-white/5",
                  "transition-transform duration-500",
                  "group-hover:scale-110",
                  theme.icon
                )}
              >
                {feature.icon}
              </div>

              {/* Text content */}
              <div className="space-y-1 max-w-[200px]">
                <h3 
                  className={cn(
                    "text-base font-semibold leading-tight tracking-tight",
                    theme.title
                  )}
                >
                  {feature.title}
                </h3>
                <p 
                  className={cn(
                    "text-xs leading-snug",
                    theme.description
                  )}
                >
                  {feature.description}
                </p>
              </div>
            </div>

            {/* Background glow effect */}
            <div
              className={cn(
                "absolute inset-0 z-0",
                "bg-gradient-to-br from-transparent via-transparent to-transparent",
                "transition-opacity duration-500",
                "opacity-0 group-hover:opacity-100",
                "pointer-events-none"
              )}
              style={{
                background: `radial-gradient(
                  600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
                  var(--glow-color, rgba(139, 92, 246, 0.05)),
                  transparent 40%
                )`,
                "--glow-color": feature.theme === "primary"
                  ? "rgba(139, 92, 246, 0.1)"
                  : feature.theme === "secondary"
                  ? "rgba(16, 185, 129, 0.1)"
                  : "rgba(244, 63, 94, 0.1)",
              } as React.CSSProperties}
            />
          </motion.button>
        );
      })}
    </div>
  );
} 