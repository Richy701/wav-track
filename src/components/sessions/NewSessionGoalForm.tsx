import React, { useState } from 'react'
import { Target, Clock, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface NewSessionGoalFormProps {
  onSubmit: (goal: { title: string; description: string; duration: number }) => void
}

export const NewSessionGoalForm: React.FC<NewSessionGoalFormProps> = ({
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 25,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-orange-50 via-white/95 to-white/90 dark:from-orange-500/10 dark:via-background/95 dark:to-background/90 border border-orange-200/80 dark:border-orange-500/20 p-6 sm:p-8 hover:border-orange-300/80 dark:hover:border-orange-500/30 transition-all duration-300 ease-in-out shadow-md dark:shadow-none ring-1 ring-orange-200/50 dark:ring-orange-500/10 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Session Goal</h3>
        </div>
      </div>

      <div className="flex-1">
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-white/90 via-white/95 to-white/90 dark:from-zinc-800/90 dark:via-zinc-800/95 dark:to-zinc-800/90 border border-orange-200/50 dark:border-orange-500/20 p-6 hover:border-orange-300/50 dark:hover:border-orange-500/30 transition-[border-color,box-shadow] duration-75 shadow-sm hover:shadow-md dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">New Goal</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  What's your goal?
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. 'Create a melodic hook for the chorus' or 'Mix the drum patterns'"
                    className="w-full bg-gradient-to-br from-white/80 to-white/60 dark:from-zinc-800/80 dark:to-zinc-900/60 border border-orange-200/50 dark:border-orange-500/20 rounded-2xl px-4 py-3 text-base font-medium text-neutral-900 dark:text-neutral-100 placeholder:text-sm placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:focus:ring-orange-500/40 focus:border-orange-500/30 dark:focus:border-orange-500/40 transition-all shadow-sm dark:shadow-inner-sm pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-orange-600/70 dark:text-orange-400/70 hover:text-orange-600 dark:hover:text-orange-400 rounded-xl"
                    >
                      <Brain className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Details
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add some details about your goal (optional)"
                  rows={3}
                  className="w-full bg-gradient-to-br from-white/80 to-white/60 dark:from-zinc-800/80 dark:to-zinc-900/60 border border-orange-200/50 dark:border-orange-500/20 rounded-2xl px-4 py-3 text-base font-medium text-neutral-900 dark:text-neutral-100 placeholder:text-sm placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:focus:ring-orange-500/40 focus:border-orange-500/30 dark:focus:border-orange-500/40 transition-all resize-none shadow-sm dark:shadow-inner-sm"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-orange-600/50 dark:text-orange-400/50" />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Duration</span>
                  </div>
                  <span className="text-sm font-medium px-2.5 py-1 rounded-xl bg-orange-100/50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-500/20">
                    {formData.duration} min
                  </span>
                </div>

                <div className="px-1">
                  <Slider
                    value={[formData.duration]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, duration: value }))}
                    min={5}
                    max={60}
                    step={5}
                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:bg-orange-500 [&_[role=slider]]:border-orange-500 dark:[&_[role=slider]]:bg-orange-400 dark:[&_[role=slider]]:border-orange-400 [&_[role=slider]]:hover:scale-110 [&_[role=slider]]:focus:scale-110"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">5 min</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">60 min</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-150 shadow-md hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:focus:ring-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed h-10"
              >
                <div className="flex items-center justify-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Create Goal</span>
                </div>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 