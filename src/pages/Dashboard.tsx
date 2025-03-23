import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ShareProgressPreview } from '../components/dashboard/ShareProgressPreview'
import { MonthlyBreakdownPreview } from '../components/dashboard/MonthlyBreakdownPreview'
import { YearInReviewPreview } from '../components/dashboard/YearInReviewPreview'
import { Button } from '../components/ui/button'
import { Download } from 'lucide-react'

// Mock data - replace with real data from your backend
const mockMonthlyData = [
  { month: 'Jan', beats: 12 },
  { month: 'Feb', beats: 8 },
  { month: 'Mar', beats: 15 },
  { month: 'Apr', beats: 10 },
  { month: 'May', beats: 18 },
  { month: 'Jun', beats: 14 },
  { month: 'Jul', beats: 20 },
  { month: 'Aug', beats: 16 },
  { month: 'Sep', beats: 22 },
  { month: 'Oct', beats: 19 },
  { month: 'Nov', beats: 25 },
  { month: 'Dec', beats: 21 },
]

const Dashboard: React.FC = () => {
  const { user } = useAuth()

  const handleExport = () => {
    // Implement your export logic here
    console.log('Exporting data...')
  }

  const cardClassName = `
    bg-white dark:bg-zinc-800 
    rounded-xl p-6 
    shadow-lg
    transition-all duration-200
    hover:shadow-xl hover:scale-[1.02]
    border border-zinc-200/60 dark:border-zinc-800/50
    hover:border-violet-200/60 dark:hover:border-violet-800/50
  `

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome back, {user?.email}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Share Progress Card */}
        <ShareProgressPreview
          totalAchievements={150}
          sharedAchievements={45}
          onExport={handleExport}
        >
          <div className={cardClassName}>
            <h2 className="text-xl font-semibold mb-4">Share Your Progress</h2>
            <p className="text-zinc-600 dark:text-zinc-300 mb-4">
              Share your achievements and inspire others in the community
            </p>
            <Button className="w-full">Share Progress</Button>
          </div>
        </ShareProgressPreview>

        {/* Monthly Breakdown Card */}
        <MonthlyBreakdownPreview monthlyData={mockMonthlyData} onExport={handleExport}>
          <div className={cardClassName}>
            <h2 className="text-xl font-semibold mb-4">Monthly Breakdown</h2>
            <p className="text-zinc-600 dark:text-zinc-300 mb-4">
              Track your productivity and growth over time
            </p>
            <Button className="w-full">View Details</Button>
          </div>
        </MonthlyBreakdownPreview>

        {/* Year in Review Card */}
        <YearInReviewPreview
          totalBeats={210}
          completedProjects={45}
          averageBPM={128}
          onExport={handleExport}
        >
          <div className={cardClassName}>
            <h2 className="text-xl font-semibold mb-4">Year in Review</h2>
            <p className="text-zinc-600 dark:text-zinc-300 mb-4">
              See your year's highlights and achievements
            </p>
            <Button className="w-full">View Review</Button>
          </div>
        </YearInReviewPreview>
      </div>
    </div>
  )
}

export default Dashboard
