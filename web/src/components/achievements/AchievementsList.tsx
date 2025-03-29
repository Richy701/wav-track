import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

interface Achievement {
  id: string
  type: string
  description: string
  current: number
  target: number
  icon: string
  color: string
  user_id: string
  created_at: string
}

export function AchievementsList() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAchievements() {
      try {
        // First, get the current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          console.error('Error getting user:', userError)
          throw new Error('Failed to get user information')
        }

        if (!user) {
          console.error('No user found')
          throw new Error('No user found')
        }

        console.log('Fetching achievements for user:', user.id)

        // Then fetch achievements
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching achievements:', error)
          throw error
        }

        console.log('Fetched achievements:', data)
        setAchievements(data || [])
      } catch (err) {
        console.error('Error in fetchAchievements:', err)
        setError(err instanceof Error ? err.message : 'Failed to load achievements')
      } finally {
        setLoading(false)
      }
    }

    fetchAchievements()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-destructive mb-2">{error}</p>
          <p className="text-sm text-muted-foreground">
            Please try refreshing the page or contact support if the issue persists.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (achievements.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground">
            No achievements yet — start a beat to unlock your first!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {achievements.map(achievement => (
        <Card
          key={achievement.id}
          className={`relative overflow-hidden ${
            achievement.current >= achievement.target ? 'ring-2 ring-primary ring-opacity-50' : ''
          }`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="text-2xl" style={{ color: achievement.color }}>
                {achievement.icon}
              </span>
              {achievement.type}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
            <div className="space-y-2">
              <Progress value={(achievement.current / achievement.target) * 100} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {achievement.current} / {achievement.target}
              </p>
            </div>
            {achievement.current >= achievement.target && (
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                  Completed
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
