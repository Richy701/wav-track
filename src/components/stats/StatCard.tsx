import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  trend: number;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  description, 
  trend,
  className 
}: StatCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-lg p-3 sm:p-4 transition-all hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-primary/5 hover:bg-accent/50",
      className
    )}>
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <h3 className="font-medium text-sm sm:text-base">{title}</h3>
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
