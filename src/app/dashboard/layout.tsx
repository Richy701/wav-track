import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { UserNav } from '@/components/dashboard/UserNav'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock } from 'lucide-react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { FeedbackButton } from '@/components/dashboard/FeedbackButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isGuest = user?.user_metadata?.isGuest

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {isGuest && (
        <Alert className="rounded-none border-b border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            You are using a guest account. Your data will be cleared after 24 hours.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex min-h-screen">
        <DashboardNav />
        <div className="flex-1 min-w-0">
          <div className="border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex h-16 items-center px-4 sm:px-6">
              <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
                <FeedbackButton />
                <UserNav />
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 pt-12 sm:pt-16 lg:pt-20 overflow-x-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
