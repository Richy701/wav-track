import { ReactNode } from 'react'
import { DashboardLayout } from './DashboardLayout'

interface DashboardWrapperProps {
  children: ReactNode
}

export function DashboardWrapper({ children }: DashboardWrapperProps) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}