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
        "relative h-7 w-14 rounded-full transition-colors duration-300",
        "bg-secondary/80 hover:bg-secondary",
        "flex items-center px-1",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        theme === 'dark' ? 'shadow-inner' : 'shadow-sm'
      )}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Sliding circle with icon */}
      <div
        className={cn(
          "absolute h-5 w-5 rounded-full flex items-center justify-center",
          "transition-all duration-300 ease-out",
          theme === 'dark' 
            ? 'translate-x-[1.625rem] bg-[#1A1F2C]' 
            : 'translate-x-0 bg-white',
          "shadow-md",
          isAnimating ? 'scale-90' : 'scale-100'
        )}
      >
        <div
          className={cn(
            "transition-all duration-300",
            isAnimating ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
          )}
        >
          {theme === 'dark' ? (
            <Moon size={12} className="text-purple-400" />
          ) : (
            <Sun size={12} className="text-amber-500" />
          )}
        </div>
      </div>
    </button>
  );
}
