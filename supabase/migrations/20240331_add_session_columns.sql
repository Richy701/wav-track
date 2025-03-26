-- Add missing columns to sessions table
ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS productivity_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS goal TEXT,
ADD COLUMN IF NOT EXISTS goal_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS feedback TEXT CHECK (feedback IN ('😞', '😐', '🙂', '😄')),
ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0; 