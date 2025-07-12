import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TabsPillProps {
  options: string[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function TabsPill({
  options,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
}: TabsPillProps) {
  const [selectedValue, setSelectedValue] = React.useState(defaultValue || options[0]);
  const value = controlledValue || selectedValue;

  const handleValueChange = (newValue: string) => {
    if (!controlledValue) {
      setSelectedValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <div
      className={cn(
        "relative flex items-center gap-1 p-1 rounded-lg bg-muted/50",
        "overflow-x-auto scrollbar-none snap-x snap-mandatory",
        className
      )}
    >
      {options.map((option) => {
        const isSelected = value === option;
        return (
          <button
            key={option}
            onClick={() => handleValueChange(option)}
            className={cn(
              "relative px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap",
              "transition-colors duration-200 snap-start",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isSelected ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="pill-tab-background"
                className="absolute inset-0 bg-primary rounded-md"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{option}</span>
          </button>
        );
      })}
    </div>
  );
} 