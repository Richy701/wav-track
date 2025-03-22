import { BeatCoachCard } from './BeatCoachCard';
import { WeeklyGoalWidget } from './WeeklyGoalWidget';

export function CoachingSection() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <BeatCoachCard />
      <WeeklyGoalWidget />
    </div>
  );
} 