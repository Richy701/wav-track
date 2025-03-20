import { useState, useEffect, useMemo } from 'react';
import { 
  ChartLineUp, 
  PencilSimple, 
  CheckCircle as PhCheckCircle, 
  MusicNote, 
  Clock as PhClock, 
  Calendar as PhCalendar, 
  Trophy as PhTrophy, 
  Star as PhStar, 
  Target as PhTarget, 
  Medal, 
  ShareNetwork, 
  Download as PhDownload, 
  Sparkle, 
  FileXls, 
  CalendarCheck 
} from '@phosphor-icons/react';
import { StatCard } from './stats/StatCard';
import { BeatsChart } from './stats/BeatsChart';
import { TimeRangeSelector } from './stats/TimeRangeSelector';
import { getTotalBeatsInTimeRange, getBeatsCreatedByProject, beatActivities } from '@/lib/data';
import { Project, Session } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Badge } from './ui/badge';

interface StatsProps {
  projects: Project[];
  sessions: Session[];
  selectedProject?: Project | null;
}

export default function Stats({ projects, sessions, selectedProject }: StatsProps) {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [totalBeatsCreated, setTotalBeatsCreated] = useState(0);
  const [totalBeatsInPeriod, setTotalBeatsInPeriod] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastBeatUpdate, setLastBeatUpdate] = useState(Date.now());
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Fetch beat counts when projects or selected project changes
  useEffect(() => {
    const fetchBeatCounts = async () => {
      setIsLoading(true);
      try {
        if (projects.length === 0) {
          setTotalBeatsCreated(0);
          setTotalBeatsInPeriod(0);
          return;
        }

        // Calculate total beats across all projects or selected project
        const periodBeats = await getTotalBeatsInTimeRange(timeRange, selectedProject?.id ?? null);
        setTotalBeatsInPeriod(periodBeats);

        if (selectedProject) {
          const beats = await getBeatsCreatedByProject(selectedProject.id);
          setTotalBeatsCreated(beats);
        } else {
          const beatPromises = projects.map(project => getBeatsCreatedByProject(project.id));
          const beatCounts = await Promise.all(beatPromises);
          const total = beatCounts.reduce((sum, count) => sum + count, 0);
          setTotalBeatsCreated(total);
        }
      } catch (error) {
        console.error('Error fetching beat counts:', error);
        setTotalBeatsCreated(0);
        setTotalBeatsInPeriod(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBeatCounts();
  }, [projects, selectedProject, timeRange, refreshKey]);

  // Update when new beats are added or project is selected
  useEffect(() => {
    const checkForNewBeats = () => {
      const latestBeat = beatActivities[beatActivities.length - 1];
      if (latestBeat && new Date(latestBeat.date).getTime() > lastBeatUpdate) {
        setLastBeatUpdate(Date.now());
        setRefreshKey(prev => prev + 1);
      }
    };

    // Check for new beats immediately
    checkForNewBeats();

    // Only check every 5 seconds if there are recent beats
    const interval = setInterval(checkForNewBeats, 5000);
    return () => clearInterval(interval);
  }, [lastBeatUpdate, beatActivities]);
  
  // Count completed projects
  const completedProjects = projects.filter(project => project.status === 'completed').length;
  
  // Calculate productivity score
  const productivityScore = useMemo(() => {
    if (projects.length === 0 && sessions.length === 0) return 0;
    
    // Base score from total beats (max 50 points)
    const beatsScore = Math.min(50, Math.round((totalBeatsCreated / 20) * 50));
    
    // Score from completed projects (max 30 points)
    const completionScore = Math.min(30, completedProjects * 5);
    
    // Score from active sessions (max 20 points)
    const sessionScore = Math.min(20, Math.round((sessions.length / 10) * 20));
    
    // Total score (max 100)
    return beatsScore + completionScore + sessionScore;
  }, [projects.length, sessions.length, totalBeatsCreated, completedProjects]);

  // Get recent projects sorted by last modified
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 3);

  // Calculate achievements
  const achievements = [
    {
      id: 'first_beat',
      title: 'First Beat',
      description: 'Created your first project',
      icon: <PhStar className="h-4 w-4" weight="fill" />,
      unlocked: projects.length > 0,
      date: projects.length > 0 ? format(new Date(projects[projects.length - 1].dateCreated), 'MMM yyyy') : null,
      color: 'from-amber-500 to-orange-500',
      borderColor: 'border-amber-500/20'
    },
    {
      id: 'ten_beats',
      title: 'Beat Master',
      description: 'Created 10+ beats',
      icon: <PhTrophy className="h-4 w-4" weight="fill" />,
      unlocked: totalBeatsCreated >= 10,
      count: totalBeatsCreated,
      color: 'from-indigo-500 to-violet-500',
      borderColor: 'border-indigo-500/20'
    },
    {
      id: 'five_completed',
      title: 'Finisher',
      description: 'Completed 5+ projects',
      icon: <PhTarget className="h-4 w-4" weight="fill" />,
      unlocked: completedProjects >= 5,
      count: completedProjects,
      color: 'from-emerald-500 to-teal-500',
      borderColor: 'border-emerald-500/20'
    }
  ];

  const handleExportStats = () => {
    const stats = {
      totalBeats: totalBeatsCreated,
      completedProjects,
      productivityScore,
      achievements: achievements.map(a => ({
        title: a.title,
        unlocked: a.unlocked,
        date: a.date,
        count: a.count
      })),
      recentActivity: recentProjects.map(p => ({
        title: p.title,
        date: format(new Date(p.lastModified), 'MMM d'),
        bpm: p.bpm,
        status: p.status
      }))
    };

    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beat-stats-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Stats exported successfully!", {
      description: "Your stats have been downloaded as JSON.",
    });
  };

  const handleShareStats = () => {
    const shareText = `🎵 Beat Stats 🎵\n\n` +
      `I've created ${totalBeatsCreated} beats and completed ${completedProjects} projects!\n` +
      `Productivity score: ${productivityScore}%\n\n` +
      `Unlocked achievements:\n` +
      achievements
        .filter(a => a.unlocked)
        .map(a => `✨ ${a.title}`)
        .join('\n');

    if (navigator.share) {
      navigator.share({
        title: 'My Beat Stats',
        text: shareText,
        url: window.location.href
      }).catch(() => {
        // Fallback to clipboard if share API is not available
        navigator.clipboard.writeText(shareText);
        toast.success("Stats copied to clipboard!", {
          description: "Share your progress with others.",
        });
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText);
      toast.success("Stats copied to clipboard!", {
        description: "Share your progress with others.",
      });
    }
  };

  const generateYearInReview = () => {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    
    // Filter projects and sessions for current year
    const yearProjects = projects.filter(p => new Date(p.dateCreated) >= yearStart);
    const yearSessions = sessions.filter(s => new Date(s.date) >= yearStart);
    
    // Calculate year-specific stats
    const yearBeats = yearProjects.reduce((total, project) => total + getBeatsCreatedByProject(project.id), 0);
    const yearCompleted = yearProjects.filter(p => p.status === 'completed').length;
    const yearStudioTime = yearSessions.reduce((total, session) => total + session.duration, 0);
    const yearHours = Math.floor(yearStudioTime / 60);
    
    // Calculate monthly distribution
    const monthlyStats = Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(currentYear, i, 1);
      const monthEnd = new Date(currentYear, i + 1, 0);
      const monthProjects = yearProjects.filter(p => {
        const date = new Date(p.dateCreated);
        return date >= monthStart && date <= monthEnd;
      });
      const monthSessions = yearSessions.filter(s => {
        const date = new Date(s.date);
        return date >= monthStart && date <= monthEnd;
      });
      
      return {
        month: format(monthStart, 'MMM'),
        beats: monthProjects.reduce((total, p) => total + getBeatsCreatedByProject(p.id), 0),
        completed: monthProjects.filter(p => p.status === 'completed').length,
        studioTime: monthSessions.reduce((total, s) => total + s.duration, 0)
      };
    });

    return {
      year: currentYear,
      totalBeats: yearBeats,
      completedProjects: yearCompleted,
      studioTime: `${yearHours} hours`,
      monthlyStats,
      topGenres: Object.entries(
        yearProjects.reduce((acc, p) => {
          acc[p.genre || 'Uncategorized'] = (acc[p.genre || 'Uncategorized'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([genre]) => genre)
    };
  };

  const handleExportCSV = () => {
    const yearReview = generateYearInReview();
    
    // Create CSV content
    const csvRows = [
      // Header row
      ['Year in Review', yearReview.year],
      [],
      ['Overall Stats'],
      ['Total Beats', yearReview.totalBeats],
      ['Completed Projects', yearReview.completedProjects],
      ['Studio Time', yearReview.studioTime],
      [],
      ['Monthly Breakdown'],
      ['Month', 'Beats Created', 'Completed Projects', 'Studio Time (hours)'],
      ...yearReview.monthlyStats.map(stat => [
        stat.month,
        stat.beats,
        stat.completed,
        (stat.studioTime / 60).toFixed(1)
      ]),
      [],
      ['Top Genres'],
      ...yearReview.topGenres.map((genre, i) => [`${i + 1}. ${genre}`])
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beat-stats-${yearReview.year}-review.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Year in Review exported!", {
      description: "Your stats have been downloaded as CSV.",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 animate-fade-in">
      <div className="bg-card rounded-lg p-3 sm:p-4 lg:p-6 lg:col-span-3 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-3 md:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <PhTrophy className="h-4 w-4 text-primary" weight="fill" />
              </div>
              {selectedProject && (
                <Badge variant="outline" className="text-xs">
                  {selectedProject.title}
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">{totalBeatsInPeriod}</span>
              <span className="text-xs sm:text-sm text-muted-foreground">this {timeRange}</span>
            </div>
            <h3 className="font-medium text-foreground text-sm sm:text-base">
              {selectedProject ? "Project Beats" : "Total Beats"}
            </h3>
          </div>
          
          <TimeRangeSelector 
            timeRange={timeRange} 
            onTimeRangeChange={setTimeRange} 
            className="w-full md:w-auto"
          />
        </div>
        
        <div className="h-[200px] sm:h-[250px] lg:h-[300px]">
          <BeatsChart 
            key={refreshKey}
            timeRange={timeRange} 
            projects={projects} 
            selectedProject={selectedProject} 
          />
        </div>

        {/* Achievements Section */}
        <div className="mt-4 sm:mt-6 pt-3 border-t">
          <h4 className="font-medium text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">Achievements</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={cn(
                  "flex flex-col items-center p-2 sm:p-3 lg:p-4 rounded-lg transition-all aspect-square group relative overflow-hidden border",
                  achievement.unlocked
                    ? `bg-gradient-to-br from-primary/5 via-transparent to-transparent hover:from-primary/10 hover:via-primary/5 hover:to-transparent hover:scale-[1.02] hover:shadow-lg ${achievement.borderColor}`
                    : "bg-muted/30 opacity-50 hover:opacity-60 border-muted-foreground/10"
                )}
              >
                {/* Background glow effect */}
                {achievement.unlocked && (
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    achievement.color.replace('from-', 'from-').replace('to-', 'to-') + '/10'
                  )} />
                )}
                
                <div className="flex-1 flex flex-col items-center justify-center w-full relative">
                  <div className={cn(
                    "p-2 sm:p-2.5 rounded-full mb-2 sm:mb-3 flex items-center justify-center transition-all duration-300",
                    achievement.unlocked
                      ? `bg-gradient-to-br ${achievement.color} text-white group-hover:scale-110 group-hover:shadow-md shadow-sm`
                      : "bg-muted text-muted-foreground"
                  )}>
                    {achievement.icon}
                  </div>
                  <div className="text-center relative z-10">
                    <p className={cn(
                      "text-[11px] sm:text-xs font-medium",
                      achievement.unlocked ? "text-foreground" : "text-muted-foreground"
                    )}>{achievement.title}</p>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">{achievement.description}</p>
                    {achievement.unlocked && (
                      <p className={cn(
                        "text-[10px] sm:text-[11px] mt-0.5 font-medium",
                        achievement.color.includes('amber') ? "text-amber-600" :
                        achievement.color.includes('indigo') ? "text-indigo-600" :
                        "text-emerald-600"
                      )}>
                        {achievement.date || `${achievement.count} ${achievement.id === 'twenty_hours' ? 'hours' : ''}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export/Share Section */}
        <div className="mt-4 pt-3 border-t">
          <h4 className="font-medium text-xs text-muted-foreground mb-3">Share Your Progress</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleShareStats}
              className="p-3 rounded-lg bg-gradient-to-br from-indigo-600/10 via-violet-600/15 to-purple-600/20 border border-violet-600/25 hover:from-indigo-600/15 hover:via-violet-600/20 hover:to-purple-600/25 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 text-center w-full group"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-violet-600/15 group-hover:bg-violet-600/25 group-hover:scale-110 transition-all duration-300">
                    <ShareNetwork className="h-4 w-4 text-violet-700" />
                  </div>
                  <h5 className="text-sm font-medium">Share Progress</h5>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Share your achievements with others
                </p>
              </div>
            </button>
            <button
              onClick={handleExportCSV}
              className="p-3 rounded-lg bg-gradient-to-br from-sky-600/10 via-blue-600/15 to-cyan-600/20 border border-blue-600/25 hover:from-sky-600/15 hover:via-blue-600/20 hover:to-cyan-600/25 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 text-center w-full group"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-600/15 group-hover:bg-blue-600/25 group-hover:scale-110 transition-all duration-300">
                    <CalendarCheck className="h-4 w-4 text-blue-700" />
                  </div>
                  <h5 className="text-sm font-medium">Monthly Breakdown</h5>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Track your progress month by month
                </p>
              </div>
            </button>
            <button
              onClick={handleExportCSV}
              className="p-3 rounded-lg bg-gradient-to-br from-rose-600/10 via-pink-600/15 to-fuchsia-600/20 border border-pink-600/25 hover:from-rose-600/15 hover:via-pink-600/20 hover:to-fuchsia-600/25 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 text-center w-full group"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-pink-600/15 group-hover:bg-pink-600/25 group-hover:scale-110 transition-all duration-300">
                    <FileXls className="h-4 w-4 text-pink-700" />
                  </div>
                  <h5 className="text-sm font-medium">Year in Review</h5>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Download your yearly stats as CSV
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
        <StatCard
          title="Productivity Score"
          value={`${productivityScore}%`}
          icon={<ChartLineUp className="w-3 h-3" />}
          description="Based on beats and completed projects"
          trend={0}
          className="bg-card/50"
        />
        
        <StatCard
          title="Total Beats"
          value={totalBeatsCreated.toString()}
          icon={<MusicNote className="w-3 h-3" />}
          description="Across all projects"
          trend={0}
          className="bg-card/50"
        />
        
        <StatCard
          title="Completed Projects"
          value={completedProjects.toString()}
          icon={<PhCheckCircle className="w-3 h-3" weight="fill" />}
          description="Successfully finished"
          trend={0}
          className="bg-card/50"
        />
        
        <StatCard
          title="Completion Rate"
          value={`${projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0}%`}
          icon={<PhTarget className="w-3 h-3" weight="fill" />}
          description="Projects completed"
          trend={0}
          className="bg-card/50"
        />
      </div>
    </div>
  );
}
