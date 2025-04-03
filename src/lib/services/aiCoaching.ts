import { supabase } from '@/lib/supabase'
import { BeatCoachMessage, WeeklyGoal } from '@/lib/types'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
})

// Enhanced prompt templates for different contexts
const PROMPT_TEMPLATES = {
  continuation: `Generate a focused goal for continuing work on "${projectName}" that builds on previous progress. Consider the current status (${status}) and suggest the next logical step. Keep it specific and actionable.`,
  new_direction: `Generate a creative goal for "${projectName}" that explores a new direction or technique. Current status: ${status}. Make it inspiring but achievable.`,
  general: `Generate a balanced goal for "${projectName}" that maintains momentum. Current status: ${status}. Focus on steady progress.`
}

// Enhanced coach message generation with context
export async function generateCoachMessage(projectName: string, status: string): Promise<string> {
  // Determine context based on status
  const context = status === 'completed' ? 'new_direction' : 
                 status === 'in_progress' ? 'continuation' : 'general'

  const prompt = PROMPT_TEMPLATES[context as keyof typeof PROMPT_TEMPLATES]
    .replace('${projectName}', projectName)
    .replace('${status}', status)

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `You are an expert music production coach. Provide concise, encouraging advice that is specific to the project and context. Keep responses under 100 characters.`
      },
      { role: 'user', content: prompt }
    ],
    max_tokens: 50,
    temperature: 0.7,
    presence_penalty: 0.6,
    frequency_penalty: 0.5
  })

  return completion.choices[0].message.content || 'Keep pushing forward with your music!'
}

// Enhanced goal generation with context awareness
export async function generateGoal(projectName: string, context: {
  recentGoals: string[];
  preferredDuration: number;
  lastCompletedGoal?: string;
}): Promise<WeeklyGoal> {
  const { recentGoals, preferredDuration, lastCompletedGoal } = context

  // Determine goal type based on context
  const goalType = lastCompletedGoal ? 'continuation' : 
                  recentGoals.length > 0 ? 'new_direction' : 'general'

  const prompt = `Generate a detailed music production goal for "${projectName}". 
    Context: ${goalType} goal
    Recent goals: ${recentGoals.join(', ')}
    Preferred duration: ${preferredDuration} minutes
    Last completed: ${lastCompletedGoal || 'None'}
    
    Provide a structured goal with:
    1. Clear objective
    2. Specific steps
    3. Expected duration
    4. Success criteria`

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `You are an expert music production coach. Generate specific, actionable goals that align with the user's workflow and preferences.`
      },
      { role: 'user', content: prompt }
    ],
    max_tokens: 200,
    temperature: 0.7,
    presence_penalty: 0.6,
    frequency_penalty: 0.5
  })

  const response = completion.choices[0].message.content || ''
  
  // Parse the response into a structured goal
  const goal: WeeklyGoal = {
    title: projectName,
    description: response,
    duration: preferredDuration,
    priority: goalType === 'continuation' ? 'high' : 
             goalType === 'new_direction' ? 'medium' : 'low',
    status: 'pending'
  }

  return goal
}

// Enhanced message creation with analytics
export async function createCoachMessage(projectId: string, message: string) {
  const { data, error } = await supabase
    .from('beat_coach_messages')
    .insert([{ 
      projectId, 
      message,
      context: {
        timestamp: new Date().toISOString(),
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
      }
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Add analytics tracking
export async function logSuggestionToAnalytics(prompt: string, suggestions: any[]) {
  try {
    await supabase
      .from('ai_analytics')
      .insert([{
        prompt,
        suggestions,
        timestamp: new Date().toISOString(),
        context: {
          timeOfDay: new Date().getHours(),
          dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
        }
      }])
  } catch (error) {
    console.error('Error logging analytics:', error)
  }
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
