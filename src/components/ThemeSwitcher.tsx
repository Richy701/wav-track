import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTheme(theme === 'dark' ? 'light' : 'dark');
    setTimeout(() => setIsAnimating(false), 300); // Match transition duration
  };

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      disabled={isAnimating}
      className={cn(
        "relative h-8 w-16 rounded-full transition-all duration-300",
        "bg-secondary hover:bg-secondary/80",
        "flex items-center",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        theme === 'dark' ? 'shadow-inner' : 'shadow-sm'
      )}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div
        className={cn(
          "absolute h-6 w-6 rounded-full shadow-md flex items-center justify-center",
          "transition-all duration-300 ease-spring",
          theme === 'dark' 
            ? 'left-[calc(100%-1.75rem)] bg-[#1A1F2C] scale-100' 
            : 'left-1 bg-amber-100 scale-100',
          isAnimating && 'scale-90'
        )}
      >
        <div className={cn(
          "transition-all duration-300",
          isAnimating ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        )}>
          {theme === 'dark' ? (
            <Moon size={14} className="text-purple-500" />
          ) : (
            <Sun size={14} className="text-amber-500" />
          )}
        </div>
      </div>
      <div className={cn(
        "absolute inset-0 flex items-center justify-between px-2",
        "pointer-events-none text-muted-foreground/50"
      )}>
        <Sun size={12} />
        <Moon size={12} />
      </div>
    </button>
  );
}
