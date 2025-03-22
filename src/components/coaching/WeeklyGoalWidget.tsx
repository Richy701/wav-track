import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WeeklyGoal } from '@/lib/types';
import { getRecentCompletedBeats, generateWeeklyGoal, createWeeklyGoal, getActiveWeeklyGoal } from '@/lib/services/aiCoaching';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Check, X, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function WeeklyGoalWidget() {
  const { user } = useAuth();
  const [goal, setGoal] = useState<WeeklyGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTarget, setEditedTarget] = useState<number>(0);

  useEffect(() => {
    async function loadOrCreateGoal() {
      if (!user) return;

      try {
        // Try to get existing active goal
        let activeGoal = await getActiveWeeklyGoal(user.id);

        // If no active goal, create a new one
        if (!activeGoal) {
          const recentBeats = await getRecentCompletedBeats(user.id);
          const suggestedGoal = await generateWeeklyGoal(recentBeats.length);
          activeGoal = await createWeeklyGoal(user.id, suggestedGoal);
        }

        setGoal(activeGoal);
      } catch (error) {
        console.error('Error loading weekly goal:', error);
        toast.error('Failed to load weekly goal');
      } finally {
        setIsLoading(false);
      }
    }

    loadOrCreateGoal();
  }, [user]);

  const handleAccept = async () => {
    if (!goal) return;
    setIsEditing(false);
    toast.success('Weekly goal set!');
  };

  const handleSkip = async () => {
    if (!goal) return;
    setGoal(null);
    toast.info('Weekly goal skipped');
  };

  const handleEdit = async () => {
    if (!goal) return;
    setEditedTarget(goal.targetBeats);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!goal || editedTarget < 1) return;
    
    try {
      const updatedGoal = await createWeeklyGoal(user.id, editedTarget);
      setGoal(updatedGoal);
      setIsEditing(false);
      toast.success('Weekly goal updated!');
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="h-6 w-48 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!goal) {
    return null;
  }

  const progress = (goal.completedBeats / goal.targetBeats) * 100;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Weekly Goal</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEdit}
            className="h-8 w-8"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Complete {goal.targetBeats} beats</span>
              <span className="text-sm text-muted-foreground">
                {goal.completedBeats}/{goal.targetBeats}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSkip}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Skip
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Accept
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Weekly Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target number of beats</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={editedTarget}
                onChange={(e) => setEditedTarget(parseInt(e.target.value) || 1)}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 