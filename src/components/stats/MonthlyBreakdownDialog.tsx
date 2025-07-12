import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'
import { BeatBarChart } from './BeatBarChart'
import { Project } from '@/lib/types'
import { ShareableCard } from './ShareableCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LiquidCard } from '@/components/ui/liquid-glass-card'
import { memo } from 'react'
import { X } from 'lucide-react'

interface MonthlyBreakdownDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  projects: Project[]
  selectedProject?: Project | null
}

export const MonthlyBreakdownDialog = memo(function MonthlyBreakdownDialog({
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
      <DialogContent className="sm:max-w-[800px] bg-transparent border-none p-0">
        <LiquidCard className="w-full will-change-transform">
          <div className="p-6 relative z-10">
            {/* Close Button */}
            <DialogClose className="absolute right-4 top-4 z-50">
              <div className="group relative">
                <div className="absolute inset-0 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 group-hover:bg-white/10" />
                <div className="relative p-2">
                  <X className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-white" />
                </div>
              </div>
            </DialogClose>

            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-200 via-fuchsia-200 to-rose-200 bg-clip-text text-transparent">
                Monthly Breakdown
              </DialogTitle>
              <DialogDescription className="text-zinc-400/90">
                View your monthly music production statistics and trends
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="chart" className="mt-4">
              <TabsList className="grid w-full grid-cols-2 bg-black/20 border border-white/10">
                <TabsTrigger 
                  value="chart" 
                  className="data-[state=active]:bg-white/5 data-[state=active]:text-white transition-colors relative z-10"
                >
                  Chart View
                </TabsTrigger>
                <TabsTrigger 
                  value="share"
                  className="data-[state=active]:bg-white/5 data-[state=active]:text-white transition-colors relative z-10"
                >
                  Share Stats
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chart" className="mt-4">
                <div className="rounded-lg shadow-md bg-white dark:bg-zinc-900 p-4 relative z-10">
                  <BeatBarChart
                    projects={projects}
                    selectedProject={selectedProject}
                    timeRange="year"
                    chartType="bar"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="share" className="mt-4">
                <div className="flex items-center justify-center relative z-10">
                  <ShareableCard
                    title="Monthly Beat Production"
                    stats={[
                      { label: 'Total Beats', value: totalBeats.toString() },
                      { label: 'Completed Projects', value: completedProjects.toString() },
                      { label: 'Average Monthly', value: averageBeatsPerMonth.toString() },
                      { label: 'Active Projects', value: (projects.length - completedProjects).toString() }
                    ]}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </LiquidCard>
      </DialogContent>
    </Dialog>
  )
}) 