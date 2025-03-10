
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerControlsProps {
  isRunning: boolean;
  time: number;
  initialTime: number;
  toggleTimer: () => void;
  resetTimer: () => void;
}

export function TimerControls({ isRunning, time, initialTime, toggleTimer, resetTimer }: TimerControlsProps) {
  return (
    <div className="flex items-center justify-center space-x-4">
      <button 
        onClick={toggleTimer}
        className={cn(
          "h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95",
          isRunning 
            ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50" 
            : "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
        )}
      >
        {isRunning ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
      </button>
      
      <button 
        onClick={resetTimer}
        className="h-10 w-10 rounded-full bg-secondary hover:bg-secondary/70 flex items-center justify-center transition-all duration-300 transform hover:rotate-180 hover:scale-105 active:scale-95"
        disabled={time === initialTime && !isRunning}
      >
        <RotateCcw size={16} className={time === initialTime && !isRunning ? "text-muted-foreground" : ""} />
      </button>
    </div>
  );
}
