import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BeatCoachMessage, Project } from '@/lib/types';
import { getStaleProjects, generateCoachMessage, createCoachMessage } from '@/lib/services/aiCoaching';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play } from 'lucide-react';
import { toast } from 'sonner';

export function BeatCoachCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coachMessages, setCoachMessages] = useState<Array<{
    project: Project;
    message: BeatCoachMessage;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCoachMessages() {
      if (!user) return;

      try {
        const staleProjects = await getStaleProjects(user.id);
        const messages = await Promise.all(
          staleProjects.map(async (project) => {
            const message = await generateCoachMessage(project.title, project.status);
            const savedMessage = await createCoachMessage(project.id, message);
            return { project, message: savedMessage };
          })
        );
        setCoachMessages(messages);
      } catch (error) {
        console.error('Error loading coach messages:', error);
        toast.error('Failed to load coaching messages');
      } finally {
        setIsLoading(false);
      }
    }

    loadCoachMessages();
  }, [user]);

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

  if (coachMessages.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">Beat Progress Coach</CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {coachMessages.map(({ project, message }, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">{message.message}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{project.title}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Resume
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
} 