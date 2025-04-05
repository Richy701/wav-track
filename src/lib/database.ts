import { supabase } from './supabase';
import { UserPreferences, UserMetrics, CategoryProgress, Session, SessionGoal } from '@/types/database';

/**
 * Fetches user preferences from the database
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }

  return data;
}

/**
 * Fetches user metrics from the database
 */
export async function getUserMetrics(userId: string): Promise<UserMetrics | null> {
  const { data, error } = await supabase
    .from('user_metrics')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user metrics:', error);
    return null;
  }

  return data;
}

/**
 * Fetches category progress from the database
 */
export async function getCategoryProgress(userId: string): Promise<CategoryProgress[]> {
  console.log('Fetching category progress for user:', userId);
  
  // Try with just the essential columns first
  const { data, error } = await supabase
    .from('category_progress')
    .select('user_id, category, progress_percent')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching category progress:', error);
    return [];
  }

  console.log('Category progress data:', data);
  return data || [];
}

/**
 * Fetches sessions with their active goals from the database
 */
export async function getSessionsWithGoals(userId: string): Promise<Session[]> {
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (sessionsError) {
    console.error('Error fetching sessions:', sessionsError);
    return [];
  }

  if (!sessions || sessions.length === 0) {
    return [];
  }

  // Get all active goal IDs
  const activeGoalIds = sessions
    .map(session => session.active_goal_id)
    .filter(Boolean) as string[];

  if (activeGoalIds.length === 0) {
    return sessions;
  }

  // Fetch all active goals in one query
  const { data: goals, error: goalsError } = await supabase
    .from('session_goals')
    .select('*')
    .in('id', activeGoalIds);

  if (goalsError) {
    console.error('Error fetching session goals:', goalsError);
    return sessions;
  }

  // Map goals to sessions
  return sessions.map(session => {
    const activeGoal = goals?.find(goal => goal.id === session.active_goal_id) || null;
    return {
      ...session,
      active_goal: activeGoal
    };
  });
}

/**
 * Creates or updates user preferences
 */
export async function upsertUserPreferences(preferences: Partial<UserPreferences> & { user_id: string }): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(preferences)
    .select()
    .single();

  if (error) {
    console.error('Error upserting user preferences:', error);
    return null;
  }

  return data;
}

/**
 * Creates or updates user metrics
 */
export async function upsertUserMetrics(metrics: Partial<UserMetrics> & { user_id: string }): Promise<UserMetrics | null> {
  const { data, error } = await supabase
    .from('user_metrics')
    .upsert(metrics)
    .select()
    .single();

  if (error) {
    console.error('Error upserting user metrics:', error);
    return null;
  }

  return data;
}

/**
 * Creates or updates category progress
 */
export async function upsertCategoryProgress(progress: Partial<CategoryProgress> & { user_id: string; category: string }): Promise<CategoryProgress | null> {
  const { data, error } = await supabase
    .from('category_progress')
    .upsert(progress)
    .select()
    .single();

  if (error) {
    console.error('Error upserting category progress:', error);
    return null;
  }

  return data;
} 