import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Trophy, Target, Clock, Fire, Users } from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { useAchievements } from '@/hooks/useAchievements'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  }
}

export function Achievements() {
  const { profile } = useAuth()
  const { achievements, loading } = useAchievements()

  // Get the first 3 achievements to display
  const displayAchievements = achievements.slice(0, 3)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Achievements</h3>
        <Badge variant="secondary" className="text-xs">
          {achievements.filter(a => a.unlocked_at).length}/{achievements.length}
        </Badge>
      </div>

      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch"
      >
        {displayAchievements.map(achievement => (
          <motion.div
            key={achievement.id}
            variants={itemVariants}
            className="group relative h-full"
          >
            <Card className={cn(
              "relative overflow-hidden transition-all duration-300 h-full",
              "hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20",
              "border border-border/50",
              achievement.unlocked_at 
                ? "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-md" 
                : "bg-muted/30",
              "flex flex-col justify-between"
            )}>
              <CardContent className="p-5 flex flex-col h-full">
                {/* Gradient overlay */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                    "bg-gradient-to-tr",
                    achievement.unlocked_at ? "from-primary to-primary/50" : "from-muted to-muted/50"
                  )}
                />

                {/* Header with Icon */}
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      "bg-gradient-to-br",
                      achievement.unlocked_at 
                        ? "from-primary to-primary/80 shadow-inner shadow-primary/30" 
                        : "from-muted to-muted",
                      "text-white shadow-sm",
                      "transition-transform duration-300",
                      "group-hover:scale-110"
                    )}
                  >
                    {achievement.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="mt-6">
                  {achievement.unlocked_at ? (
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={cn(
                          "bg-white text-black text-xs font-semibold px-3 py-1 rounded-full shadow-sm",
                          "animate-pulse"
                        )}
                      >
                        Unlocked
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(achievement.unlocked_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progress</span>
                        <span className="font-medium tabular-nums">
                          {achievement.progress || 0}/{achievement.requirement}
                        </span>
                      </div>
                      <Progress 
                        value={((achievement.progress || 0) / achievement.requirement) * 100} 
                        className={cn(
                          "h-2",
                          "bg-muted",
                          "group-hover:bg-muted/80",
                          "transition-colors duration-300"
                        )}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
} 