import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { LoadingProvider } from '@/contexts/LoadingContext'
import { useLoading } from '@/contexts/LoadingContext'

function MainLayoutContent() {
  const { isLoading } = useLoading()

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function MainLayout() {
  return (
    <LoadingProvider>
      <MainLayoutContent />
    </LoadingProvider>
  )
} 