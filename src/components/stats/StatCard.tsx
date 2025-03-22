import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  trend: number;
  className?: string;
  tooltip?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  description, 
  trend,
  className,
  tooltip = getDefaultTooltip(title)
}: StatCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-lg p-3 sm:p-4 transition-all hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-primary/5 hover:bg-accent/50",
      className
    )}>
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className="font-medium text-sm sm:text-base cursor-help">
                {title}
              </h3>
            </TooltipTrigger>
            <TooltipContent className="max-w-[280px] p-4 text-sm bg-gradient-to-b from-card to-card/95 backdrop-blur-sm border-border shadow-xl">
              <div className="space-y-2">
                <p className="font-medium text-foreground/90">{getTooltipTitle(title)}</p>
                <div className="text-muted-foreground space-y-1.5" style={{ whiteSpace: 'pre-line' }}>
                  {tooltip}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background flex items-center justify-center">
          {icon}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">{value}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
        </div>
        
        {trend !== 0 && (
          <div className={cn(
            "text-xs sm:text-sm rounded-full px-2 py-0.5 flex items-center gap-0.5",
            trend >= 0 
              ? "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" 
              : "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400"
          )}>
            {trend >= 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
    </div>
  );
}

function getTooltipTitle(title: string): string {
  switch (title) {
    case "Productivity Score":
      return "Track Your Progress 🎯";
    case "Total Beats":
      return "Your Beat Collection 🎵";
    case "Completed Projects":
      return "Finished Works 🏆";
    case "Completion Rate":
      return "Success Rate 📈";
    default:
      return title;
  }
}

function getDefaultTooltip(title: string): string {
  switch (title) {
    case "Productivity Score":
      return "Your score is based on:\n\n• How many beats you make (50%)\n• How many projects you finish (30%)\n• How often you work on music (20%)";
    case "Total Beats":
      return "All the beats you've created so far.\n\nThis includes both your finished work and beats in progress.";
    case "Completed Projects":
      return "The projects you've successfully finished.\n\nKeep creating and completing more to grow this number!";
    case "Completion Rate":
      return "How often you finish what you start.\n\nA higher percentage means you're great at completing your music projects!";
    default:
      return "";
  }
}
