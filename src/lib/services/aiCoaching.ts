import { supabase } from '@/lib/supabase'
import { BeatCoachMessage, WeeklyGoal } from '@/lib/types'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
})

export async function generateCoachMessage(projectName: string, status: string): Promise<string> {
  const prompt = `Generate a short, encouraging message for a music producer working on a beat called "${projectName}" that is currently in ${status} status. The message should be friendly, motivating, and specific to their progress. Keep it under 100 characters.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 50,
  })

  return completion.choices[0].message.content || 'Keep pushing forward with your music!'
}

export async function generateWeeklyGoal(completedBeats: number): Promise<number> {
  const prompt = `Based on the user completing ${completedBeats} beats in the last 7 days, suggest a reasonable weekly goal for completing beats. Consider their current pace and suggest a slightly challenging but achievable number. Respond with just the number.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 10,
  })

  const suggestedGoal = parseInt(completion.choices[0].message.content || '2')
  return isNaN(suggestedGoal) ? 2 : Math.max(1, Math.min(10, suggestedGoal))
}

export async function getStaleProjects(userId: string) {
  const fiveDaysAgo = new Date()
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('userId', userId)
    .neq('status', 'completed')
    .lt('lastModified', fiveDaysAgo.toISOString())

  if (error) throw error
  return data
}

export async function createCoachMessage(projectId: string, message: string) {
  const { data, error } = await supabase
    .from('beat_coach_messages')
    .insert([{ projectId, message }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getRecentCompletedBeats(userId: string) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('userId', userId)
    .eq('status', 'completed')
    .gte('lastModified', sevenDaysAgo.toISOString())

  if (error) throw error
  return data
}

export async function createWeeklyGoal(userId: string, targetBeats: number) {
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 7)

  const { data, error } = await supabase
    .from('weekly_goals')
    .insert([
      {
        userId,
        targetBeats,
        completedBeats: 0,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'active',
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateWeeklyGoalProgress(goalId: string, completedBeats: number) {
  const { data, error } = await supabase
    .from('weekly_goals')
    .update({
      completedBeats,
      status: completedBeats >= targetBeats ? 'completed' : 'active',
      updatedAt: new Date().toISOString(),
    })
    .eq('id', goalId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getActiveWeeklyGoal(userId: string) {
  const { data, error } = await supabase
    .from('weekly_goals')
    .select('*')
    .eq('userId', userId)
    .eq('status', 'active')
    .order('createdAt', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}
