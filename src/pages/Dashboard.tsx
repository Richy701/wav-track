import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ShareProgressPreview } from '../components/dashboard/ShareProgressPreview'
import { MonthlyBreakdownPreview } from '../components/dashboard/MonthlyBreakdownPreview'
import { YearInReviewPreview } from '../components/dashboard/YearInReviewPreview'
import { Button } from '../components/ui/button'
import { Download } from 'lucide-react'
import { cn } from '../lib/utils'

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Welcome back, {user?.email}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Share Progress Card */}
        <ShareProgressPreview
          totalAchievements={150}
          sharedAchievements={45}
          onExport={handleExport}
        >
          <div className={cn(cardClassName, "min-h-[200px] sm:min-h-[220px]")}>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Share Your Progress</h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 mb-4">
              Share your achievements and inspire others in the community
            </p>
            <Button className="w-full">Share Progress</Button>
          </div>
        </ShareProgressPreview>

        {/* Monthly Breakdown Card */}
        <MonthlyBreakdownPreview monthlyData={mockMonthlyData} onExport={handleExport}>
          <div className={cn(cardClassName, "min-h-[200px] sm:min-h-[220px]")}>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Monthly Breakdown</h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 mb-4">
              Track your productivity and growth over time
            </p>
            <Button className="w-full">View Details</Button>
          </div>
        </MonthlyBreakdownPreview>

        {/* Year in Review Card */}
        <YearInReviewPreview onExport={handleExport}>
          <div className={cn(cardClassName, "min-h-[200px] sm:min-h-[220px]")}>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Year in Review</h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 mb-4">
              See your highlights and achievements from this year
            </p>
            <Button className="w-full">View Review</Button>
          </div>
        </YearInReviewPreview>
      </div>
    </div>
  )
}

export default Dashboard
