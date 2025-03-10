import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProjectList from '@/components/ProjectList';
import Timer from '@/components/Timer';
import Stats from '@/components/Stats';
import { sessions } from '@/lib/data';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/lib/types';

const Index = () => {
  const { projects, isLoading, error, setProjects } = useProjects();
  const [orderedProjects, setOrderedProjects] = useState<Project[]>([]);

  // Update orderedProjects when projects change
  useEffect(() => {
    setOrderedProjects(projects);
  }, [projects]);

  const handleDragEnd = (activeId: string, overId: string) => {
    const oldIndex = orderedProjects.findIndex(p => p.id === activeId);
    const newIndex = orderedProjects.findIndex(p => p.id === overId);

    const newProjects = [...orderedProjects];
    const [movedProject] = newProjects.splice(oldIndex, 1);
    newProjects.splice(newIndex, 0, movedProject);

    setOrderedProjects(newProjects);
    // Update the projects in your data store
    setProjects(newProjects);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">Error loading projects</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 md:mb-12">
          <div className="lg:col-span-2">
            <Stats projects={projects} sessions={sessions} />
          </div>
          <div className="grid grid-cols-1 gap-6">
            <Timer />
            {/* Coming Soon: Session History */}
            <div className="bg-card rounded-lg p-3 sm:p-4 relative overflow-hidden group">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent dark:from-primary/[0.03]" />
              
              {/* Content */}
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-xs sm:text-sm">Recent Sessions</h3>
                  <Badge variant="coming-soon" className="scale-75 sm:scale-90">COMING SOON</Badge>
                </div>

                {/* Preview content */}
                <div className="space-y-1.5 sm:space-y-2">
                  {/* Sample session items with shimmer effect */}
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted/80 dark:bg-muted/60 border border-border shadow-sm flex items-center justify-center">
                        <div className={cn(
                          "w-3 h-3 sm:w-4 sm:h-4 rounded-full animate-pulse",
                          i === 0 && "bg-gradient-to-r from-violet-500 to-indigo-500",
                          i === 1 && "bg-gradient-to-r from-blue-500 to-cyan-500",
                          i === 2 && "bg-gradient-to-r from-fuchsia-500 to-pink-500"
                        )} />
                      </div>
                      <div className="flex-1 space-y-0.5 sm:space-y-1">
                        <div className="h-1.5 sm:h-2 w-16 sm:w-20 bg-muted/70 dark:bg-muted/50 rounded-md animate-pulse" />
                        <div className="h-1 sm:h-1.5 w-12 sm:w-14 bg-muted/60 dark:bg-muted/40 rounded-md animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feature preview */}
                <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-border/5 dark:border-border/10">
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                    Coming features:
                  </p>
                  <ul className="mt-1 sm:mt-1.5 space-y-0.5 sm:space-y-1">
                    <li className="text-[9px] sm:text-[10px] text-muted-foreground flex items-center gap-1">
                      <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
                      Track daily focus sessions
                    </li>
                    <li className="text-[9px] sm:text-[10px] text-muted-foreground flex items-center gap-1">
                      <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                      View productivity trends
                    </li>
                    <li className="text-[9px] sm:text-[10px] text-muted-foreground flex items-center gap-1">
                      <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500" />
                      Set and achieve goals
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-12">
          <ProjectList onDragEnd={handleDragEnd} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
