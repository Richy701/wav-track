import React from 'react';
import { useTheme } from 'next-themes';
import { MoonIcon as MoonSolid, SunIcon as SunSolid, SparklesIcon as SparklesSolid } from '@heroicons/react/24/solid';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-lg transition-colors ${
          theme === 'light'
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted'
        }`}
        aria-label="Light theme"
      >
        <SunSolid className="w-5 h-5" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-lg transition-colors ${
          theme === 'dark'
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted'
        }`}
        aria-label="Dark theme"
      >
        <MoonSolid className="w-5 h-5" />
      </button>
      <button
        onClick={() => setTheme('midnight')}
        className={`p-2 rounded-lg transition-colors ${
          theme === 'midnight'
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted'
        }`}
        aria-label="Midnight theme"
      >
        <SparklesSolid className="w-5 h-5" />
      </button>
    </div>
  );
} 