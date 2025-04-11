import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { NotificationSound, playNotificationSound } from './timerUtils'
import { Volume2, Plus, Minus, Clock, Bell, ArrowRight } from 'lucide-react'
import { Slider } from '../ui/slider'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface TimerSettingsProps {
  workDuration: number
  breakDuration: number
  setWorkDuration: (duration: number) => void
  setBreakDuration: (duration: number) => void
  notificationSound: NotificationSound
  setNotificationSound: (sound: NotificationSound) => void
  applySettings: () => void
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function TimerSettings({
  workDuration,
  breakDuration,
  setWorkDuration,
  setBreakDuration,
  notificationSound,
  setNotificationSound,
  applySettings,
}: TimerSettingsProps) {
  const handleSoundChange = (value: string) => {
    const sound = value as NotificationSound
    setNotificationSound(sound)
    playNotificationSound(sound)
  }

  const adjustDuration = (type: 'work' | 'break', increment: boolean) => {
    const currentValue = type === 'work' ? workDuration : breakDuration
    const maxValue = type === 'work' ? 60 : 30
    const minValue = 1

    const newValue = increment
      ? Math.min(currentValue + 1, maxValue)
      : Math.max(currentValue - 1, minValue)

    if (type === 'work') {
      setWorkDuration(newValue)
    } else {
      setBreakDuration(newValue)
    }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4 p-3 rounded-lg bg-gradient-to-b from-background to-muted/30"
    >
      {/* Section: Timer Durations */}
      <motion.div variants={item} className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shadow-inner shadow-emerald-500/5">
            <Clock className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <h3 className="text-sm font-medium bg-gradient-to-r from-emerald-500 to-emerald-300 bg-clip-text text-transparent">Timer Durations</h3>
        </div>

        <div className="space-y-2">
          {/* Work Duration */}
          <div className="space-y-1.5 bg-emerald-50/5 p-2 rounded-lg border border-emerald-500/10 shadow-sm shadow-emerald-500/5">
            <Label className="text-xs font-medium flex items-center justify-between">
              <span className="text-emerald-600 dark:text-emerald-300">Work Duration</span>
              <span className="text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-300 bg-clip-text text-transparent">{workDuration}m</span>
            </Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 rounded-md shrink-0 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500"
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
                className="flex-1 [&>[role=slider]]:bg-emerald-500 [&>[role=slider]]:border-emerald-400 [&>.range]:bg-emerald-500"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 rounded-md shrink-0 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500"
                onClick={() => adjustDuration('work', true)}
                disabled={workDuration >= 60}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Break Duration */}
          <div className="space-y-1.5 bg-violet-50/5 p-2 rounded-lg border border-violet-500/10 shadow-sm shadow-violet-500/5">
            <Label className="text-xs font-medium flex items-center justify-between">
              <span className="text-violet-600 dark:text-violet-300">Break Duration</span>
              <span className="text-sm font-semibold bg-gradient-to-r from-violet-500 to-violet-300 bg-clip-text text-transparent">{breakDuration}m</span>
            </Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 rounded-md shrink-0 border-violet-500/20 hover:bg-violet-500/10 hover:text-violet-500"
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
                className="flex-1 [&>[role=slider]]:bg-violet-500 [&>[role=slider]]:border-violet-400 [&>.range]:bg-violet-500"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 rounded-md shrink-0 border-violet-500/20 hover:bg-violet-500/10 hover:text-violet-500"
                onClick={() => adjustDuration('break', true)}
                disabled={breakDuration >= 30}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section: Notification Sound */}
      <motion.div variants={item} className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center shadow-inner shadow-amber-500/5">
            <Bell className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <h3 className="text-sm font-medium bg-gradient-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent">Notification Sound</h3>
        </div>

        <div className="bg-amber-50/5 p-2 rounded-lg border border-amber-500/10 shadow-sm shadow-amber-500/5">
          <Select value={notificationSound} onValueChange={handleSoundChange}>
            <SelectTrigger className="w-full h-8 border-amber-500/20 bg-background/50 hover:bg-amber-500/5 focus:ring-amber-500/30 text-xs">
              <SelectValue placeholder="Select a sound" />
            </SelectTrigger>
            <SelectContent className="border-amber-500/20">
              <SelectItem value="beep" className="focus:bg-amber-500/10">Digital Beep</SelectItem>
              <SelectItem value="chime" className="focus:bg-amber-500/10">Musical Chime</SelectItem>
              <SelectItem value="bell" className="focus:bg-amber-500/10">Classic Bell</SelectItem>
              <SelectItem value="chirp" className="focus:bg-amber-500/10">Cheerful Chirp</SelectItem>
              <SelectItem value="ding" className="focus:bg-amber-500/10">Soft Ding</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Apply Button */}
      <motion.div variants={item}>
        <Button
          size="sm"
          className="w-full bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white font-medium shadow-md shadow-violet-500/20 rounded-lg py-1.5 text-xs"
          onClick={applySettings}
        >
          Apply Changes
          <ArrowRight className="w-3 h-3 ml-1.5" />
        </Button>
      </motion.div>
    </motion.div>
  )
}
