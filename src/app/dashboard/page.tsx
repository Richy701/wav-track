import { MonthlyBreakdownPreview } from '@/components/dashboard/MonthlyBreakdownPreview'

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <MonthlyBreakdownPreview 
          monthlyData={[]}
          onExport={() => alert('Exporting stats...')}
        />
      </div>
    </div>
  )
} 