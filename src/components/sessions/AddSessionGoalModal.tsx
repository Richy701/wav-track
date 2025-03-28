import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Clock, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface AddSessionGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (goal: { title: string; description: string; duration: number }) => void
}

export const AddSessionGoalModal: React.FC<AddSessionGoalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
  })

  // Generate description based on title
  useEffect(() => {
    if (formData.title && !formData.description) {
      const generateDescription = () => {
        const keywords = formData.title.toLowerCase().split(' ')
        const templates = [
          `Focus on ${keywords[0]} with clear objectives and measurable outcomes.`,
          `Work on ${keywords[0]} while maintaining high quality and attention to detail.`,
          `Complete ${keywords[0]} with a focus on efficiency and productivity.`,
          `Achieve ${keywords[0]} by breaking it down into manageable steps.`,
          `Make progress on ${keywords[0]} with a structured approach.`,
        ]
        return templates[Math.floor(Math.random() * templates.length)]
      }
      setFormData(prev => ({ ...prev, description: generateDescription() }))
    }
  }, [formData.title])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-orange-500/5 via-[#111111]/50 to-[#111111]/50 border border-orange-500/20 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Target className="w-5 h-5 text-orange-400" />
            Add Session Goal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm text-white/70">
              Goal Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="What do you want to accomplish?"
              className="bg-white/5 border-orange-500/20 focus:border-orange-500/40"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm text-white/70">
              Description
            </Label>
            <div className="relative">
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your goal in detail..."
                className="bg-white/5 border-orange-500/20 focus:border-orange-500/40 min-h-[100px]"
              />
              {formData.title && !formData.description && (
                <div className="absolute right-2 top-2">
                  <Sparkles className="w-4 h-4 text-orange-400/70 animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {/* Duration Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-white/70">Duration</Label>
              <span className="text-sm text-orange-400">{formData.duration} minutes</span>
            </div>
            <Slider
              value={[formData.duration]}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, duration: value }))}
              min={5}
              max={120}
              step={5}
              className="py-4"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/5"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Target className="w-4 h-4 mr-2" />
              Save Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 