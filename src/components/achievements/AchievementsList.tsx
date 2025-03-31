import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import { Achievement } from '@/lib/types'
import { AchievementCard } from './AchievementCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MusicNotes, Flame, Clock, Target, ShareNetwork } from '@phosphor-icons/react'

const categoryIcons = {
  production: <MusicNotes className="h-4 w-4" />,
  streak: <Flame className="h-4 w-4" />,
  time: <Clock className="h-4 w-4" />,
  goals: <Target className="h-4 w-4" />,
  social: <ShareNetwork className="h-4 w-4" />,
}

const categoryLabels = {
  production: 'Production',
  streak: 'Streaks',
  time: 'Time',
  goals: 'Goals',
  social: 'Social',
}

interface AchievementsListProps {
  achievements: Achievement[]
}

export function AchievementsList({ achievements }: AchievementsListProps) {
  // Group achievements by category
  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = []
    }
    acc[achievement.category].push(achievement)
    return acc
  }, {} as Record<string, Achievement[]>)

  return (
    <Tabs defaultValue="production" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((category) => (
          <TabsTrigger key={category} value={category} className="flex items-center gap-2">
            {categoryIcons[category]}
            {categoryLabels[category]}
          </TabsTrigger>
        ))}
      </TabsList>

      {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((category) => (
        <TabsContent key={category} value={category} className="mt-4">
          <div className="grid gap-4">
            {groupedAchievements[category]?.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
            {!groupedAchievements[category]?.length && (
              <div className="text-center text-muted-foreground py-8">
                No achievements in this category yet
              </div>
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
