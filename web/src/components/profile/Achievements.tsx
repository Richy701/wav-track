import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Trophy, Target } from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'

export function Achievements() {
  const { profile } = useAuth()

  const achievements = [
    {
      id: 'first_beat',
      title: 'First Beat',
      description: 'Created your first project',
      icon: <Star className="h-4 w-4" weight="fill" />,
      unlocked: (profile?.total_beats || 0) > 0,
      date: profile?.join_date ? new Date(profile.join_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null,
      color: 'from-amber-500 to-orange-500',
      borderColor: 'border-amber-500/20',
    },
    {
      id: 'ten_beats',
      title: 'Beat Master',
      description: 'Created 10+ beats',
      icon: <Trophy className="h-4 w-4" weight="fill" />,
      unlocked: (profile?.total_beats || 0) >= 10,
      count: profile?.total_beats || 0,
      color: 'from-indigo-500 to-violet-500',
      borderColor: 'border-indigo-500/20',
    },
    {
      id: 'five_completed',
      title: 'Finisher',
      description: 'Completed 5+ projects',
      icon: <Target className="h-4 w-4" weight="fill" />,
      unlocked: (profile?.completed_projects || 0) >= 5,
      count: profile?.completed_projects || 0,
      color: 'from-emerald-500 to-teal-500',
      borderColor: 'border-emerald-500/20',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Achievements</h2>
        <p className="text-sm text-muted-foreground">
          Track your milestones and unlock new badges as you progress.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {achievements.map(achievement => (
          <Card
            key={achievement.id}
            className={`group relative overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-[1.01] border ${achievement.unlocked ? achievement.borderColor : 'border-muted'}`}
          >
            <CardContent className="p-5">
              {/* Gradient overlay on hover */}
              <span
                className={`absolute inset-0 bg-gradient-to-tr opacity-0 group-hover:opacity-50 
                           transition-opacity duration-200 pointer-events-none ${achievement.color}/5`}
              />

              {/* Header with Icon */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`p-2.5 rounded-full bg-gradient-to-br ${achievement.unlocked ? achievement.color : 'from-muted to-muted'} text-white 
                            shadow-sm transition-transform duration-200 group-hover:scale-105`}
                >
                  {achievement.icon}
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
              </div>

              {/* Progress Section */}
              <div className="space-y-2">
                {achievement.unlocked ? (
                  <div className="flex justify-between items-center">
                    <Badge
                      variant="outline"
                      className={`bg-gradient-to-r ${achievement.color} border-0 text-white text-xs`}
                    >
                      Unlocked
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {achievement.date || `${achievement.count} total`}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium tabular-nums">
                      {achievement.count || 0}/{achievement.id === 'ten_beats' ? '10' : '5'}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 