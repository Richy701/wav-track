import { MonthlyBreakdownPreview } from '@/components/dashboard/MonthlyBreakdownPreview'
import { YearInReviewPreview } from '@/components/dashboard/YearInReviewPreview'
import ResponsiveGrid from '@/components/layout/ResponsiveGrid'

export default function DashboardPage() {
  // Sample data to showcase the redesigned components
  const sampleMonthlyData = [
    { month: 'Jan', beats: 12 },
    { month: 'Feb', beats: 8 },
    { month: 'Mar', beats: 15 },
    { month: 'Apr', beats: 22 },
    { month: 'May', beats: 18 },
    { month: 'Jun', beats: 25 }
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Track your music production progress and insights</p>
      </div>
      
      <ResponsiveGrid 
        cols={{ default: 1, md: 2 }}
        gap="lg"
      >
        <MonthlyBreakdownPreview 
          monthlyData={sampleMonthlyData}
          onExport={() => alert('Exporting monthly breakdown...')}
        />
        <YearInReviewPreview 
          totalBeats={120}
          studioTime={45}
          topGenre="Hip Hop"
          title="Year in Review 2024"
          description="Your creative journey this year"
          onExport={() => alert('Exporting year in review...')}
        />
      </ResponsiveGrid>
      
      {/* Empty state examples */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Empty State Examples</h2>
        <ResponsiveGrid 
          cols={{ default: 1, md: 2 }}
          gap="lg"
        >
          <MonthlyBreakdownPreview 
            monthlyData={[]}
            onExport={() => alert('Exporting monthly breakdown...')}
          />
          <YearInReviewPreview 
            totalBeats={0}
            studioTime={0}
            onExport={() => alert('Exporting year in review...')}
          />
        </ResponsiveGrid>
      </div>
    </div>
  )
} 