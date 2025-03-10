import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { NotificationSound, playNotificationSound } from './timerUtils';
import { Volume2, Plus, Minus, SlidersHorizontal } from 'lucide-react';
import { Slider } from '../ui/slider';
import { cn } from '@/lib/utils';

interface TimerSettingsProps {
  workDuration: number;
  breakDuration: number;
  setWorkDuration: (duration: number) => void;
  setBreakDuration: (duration: number) => void;
  notificationSound: NotificationSound;
  setNotificationSound: (sound: NotificationSound) => void;
  applySettings: () => void;
}

export function TimerSettings({ 
  workDuration, 
  breakDuration, 
  setWorkDuration, 
  setBreakDuration,
  notificationSound,
  setNotificationSound,
  applySettings 
}: TimerSettingsProps) {
  
  const handleSoundChange = (value: string) => {
    const sound = value as NotificationSound;
    setNotificationSound(sound);
  };
  
  const previewSound = () => {
    playNotificationSound(notificationSound);
  };

  const adjustDuration = (type: 'work' | 'break', increment: boolean) => {
    const currentValue = type === 'work' ? workDuration : breakDuration;
    const maxValue = type === 'work' ? 60 : 30;
    const minValue = 1;
    
    const newValue = increment 
      ? Math.min(currentValue + 1, maxValue)
      : Math.max(currentValue - 1, minValue);
    
    if (type === 'work') {
      setWorkDuration(newValue);
    } else {
      setBreakDuration(newValue);
    }
  };
  
  return (
    <div className="space-y-4 mb-4 animate-scale-in">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground flex items-center gap-2">
          <SlidersHorizontal className="h-3 w-3" />
          Work Duration
        </Label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => adjustDuration('work', false)}
            disabled={workDuration <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Slider
            value={[workDuration]}
            onValueChange={([value]) => setWorkDuration(value)}
            min={1}
            max={60}
            step={1}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => adjustDuration('work', true)}
            disabled={workDuration >= 60}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium w-12 text-center">{workDuration}m</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground flex items-center gap-2">
          <SlidersHorizontal className="h-3 w-3" />
          Break Duration
        </Label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => adjustDuration('break', false)}
            disabled={breakDuration <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Slider
            value={[breakDuration]}
            onValueChange={([value]) => setBreakDuration(value)}
            min={1}
            max={30}
            step={1}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => adjustDuration('break', true)}
            disabled={breakDuration >= 30}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium w-12 text-center">{breakDuration}m</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground flex items-center gap-2">
          <Volume2 className="h-3 w-3" />
          Notification Sound
        </Label>
        <div className="flex items-center gap-2">
          <Select value={notificationSound} onValueChange={handleSoundChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a sound" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beep">Digital Beep</SelectItem>
              <SelectItem value="chime">Musical Chime</SelectItem>
              <SelectItem value="bell">Classic Bell</SelectItem>
              <SelectItem value="chirp">Cheerful Chirp</SelectItem>
              <SelectItem value="ding">Soft Ding</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            type="button" 
            size="icon"
            variant="outline"
            className="h-8 w-8 flex-shrink-0" 
            onClick={previewSound}
            title="Preview sound"
          >
            <Volume2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Button 
        size="sm" 
        className="w-full animate-fade-in bg-primary hover:bg-primary/90" 
        onClick={applySettings}
      >
        Apply Settings
      </Button>
    </div>
  );
}
