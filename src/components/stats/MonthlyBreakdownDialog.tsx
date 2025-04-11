import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { BeatBarChart } from './BeatBarChart'
import { Project } from '@/lib/types'
import { ShareableCard } from './ShareableCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface MonthlyBreakdownDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  projects: Project[]
  selectedProject?: Project | null
}

export function MonthlyBreakdownDialog({
  isOpen,
  onOpenChange,
  projects,
  selectedProject
}: MonthlyBreakdownDialogProps) {
  // Calculate monthly stats
  const totalBeats = projects.length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const averageBeatsPerMonth = Math.round(totalBeats / 12)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Monthly Breakdown</DialogTitle>
          <DialogDescription>
            View your monthly music production statistics and trends
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="chart" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart">Chart View</TabsTrigger>
            <TabsTrigger value="share">Share Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="mt-4">
            <div className="rounded-lg border bg-card p-4">
              <BeatBarChart
                projects={projects}
                selectedProject={selectedProject}
                timeRange="year"
                chartType="bar"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="share" className="mt-4">
            <div className="flex items-center justify-center">
              <ShareableCard
                title="Monthly Beat Production"
                stats={[
                  { label: 'Total Beats', value: totalBeats },
                  { label: 'Completed Projects', value: completedProjects },
                  { label: 'Average Monthly', value: averageBeatsPerMonth },
                  { label: 'Active Projects', value: projects.length - completedProjects }
                ]}
                gradientColors={{
                  from: '#10b981',
                  via: '#14b8a6',
                  to: '#06b6d4'
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 