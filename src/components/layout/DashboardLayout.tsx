import { ReactNode } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

interface DashboardLayoutProps {
  children: ReactNode
}


export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden ml-0 pl-0">
        <div className="flex flex-1 flex-col gap-4 p-4 overflow-auto min-w-0">
          <div className="max-w-7xl mx-auto w-full min-w-0">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}