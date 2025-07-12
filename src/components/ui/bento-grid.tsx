import { ReactNode } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[18rem] grid-cols-3 gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  iconClassName,
}: {
  name: string;
  className: string;
  background: ReactNode;
  Icon: any;
  description: string;
  href: string;
  cta: string;
  iconClassName?: string;
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
      // Base styles
      "bg-background/60 backdrop-blur-xl",
      "border-2 border-purple-500/5",
      // Dark mode styles
      "dark:bg-background/10 dark:backdrop-blur-xl dark:border-purple-500/10",
      // Hover effects
      "transition-all duration-300 ease-in-out",
      "hover:shadow-[0_0_30px_-10px_rgba(130,87,229,0.3)] dark:hover:shadow-[0_0_30px_-10px_rgba(130,87,229,0.2)]",
      "hover:border-purple-500/30 dark:hover:border-purple-500/20",
      // Background gradient
      "bg-gradient-to-b from-background via-background/80 to-background/50",
      "dark:from-background/20 dark:via-background/10 dark:to-background/5",
      // Outline glow effect
      "outline outline-1 outline-purple-500/10 dark:outline-purple-500/5",
      "hover:outline-purple-500/20 dark:hover:outline-purple-500/10",
      className,
    )}
  >
    {/* Background wrapper with z-index control */}
    <div className="absolute inset-0 z-0 overflow-hidden">
      {background}
    </div>

    {/* Content wrapper with higher z-index */}
    <div className="relative z-10 flex h-full flex-col">
      {/* Icon and text content */}
      <div className="flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-2">
        <div className={cn(
          "h-12 w-12 rounded-xl p-2.5 transform-gpu transition-all duration-300 ease-in-out group-hover:scale-95",
          "bg-gradient-to-br from-[#8257E5] to-[#B490FF] text-white",
          "shadow-lg shadow-purple-500/20 dark:shadow-purple-500/10",
          iconClassName
        )}>
          <Icon className="h-full w-full" />
        </div>
        <h3 className="text-xl font-semibold text-foreground dark:text-foreground/90">
          {name}
        </h3>
        <p className="max-w-lg text-muted-foreground dark:text-muted-foreground/80">{description}</p>
      </div>

      {/* CTA button */}
      <div className="mt-auto p-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
        <Button 
          variant="ghost" 
          asChild 
          size="sm" 
          className="relative hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-500/10 dark:hover:bg-purple-500/5"
        >
          <a href={href}>
            {cta}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>

    {/* Hover overlay */}
    <div className="absolute inset-0 z-20 transform-gpu bg-gradient-to-b from-transparent via-purple-500/[0.02] to-purple-500/[0.03] opacity-0 transition-all duration-300 group-hover:opacity-100" />
  </div>
);

export { BentoCard, BentoGrid }; 