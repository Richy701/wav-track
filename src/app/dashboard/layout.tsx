'use client'

import Header from '@/components/Header'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { UserNav } from '@/components/dashboard/UserNav'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock } from 'lucide-react'
import { FeedbackButton } from '@/components/dashboard/FeedbackButton'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Guest logic should be handled with a client-side hook if needed
  // For now, omit isGuest logic

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Header />
      {/* Optionally add guest alert here if you have a client-side way to detect guest */}
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
          <div className="flex-1 space-y-6 p-6 pt-8 overflow-x-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
