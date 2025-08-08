import { MonthlyBreakdownPreview } from '@/components/dashboard/MonthlyBreakdownPreview'
import { YearInReviewPreview } from '@/components/dashboard/YearInReviewPreview'

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
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2">
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
      </div>
      
      {/* Empty state versions */}
      <div className="grid gap-6 md:grid-cols-2">
        <MonthlyBreakdownPreview 
          monthlyData={[]}
          onExport={() => alert('Exporting monthly breakdown...')}
        />
        <YearInReviewPreview 
          totalBeats={0}
          studioTime={0}
          onExport={() => alert('Exporting year in review...')}
        />
      </div>
    </div>
  )
} 