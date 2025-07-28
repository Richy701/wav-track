import React from 'react'
import { useProjects } from '@/hooks/useProjects'
import { LoadingWrapper } from '@/components/ui/loading-wrapper'
import ProjectList from '@/components/ProjectList'
import Stats from '@/components/Stats'
import { MotivationalQuotes } from '@/components/MotivationalQuotes'
import { AICoach } from '@/components/ai-coach/AICoach'

export function Dashboard() {
  const { projects, allProjects, isLoading: projectsLoading } = useProjects()

  return (
    <div className="space-y-6">
      <LoadingWrapper
        loadingKey="stats"
        className="h-32"
      >
        <Stats sessions={[]} beatActivities={[]} />
      </LoadingWrapper>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LoadingWrapper
            loadingKey="projects"
            className="h-[600px]"
          >
            <ProjectList />
          </LoadingWrapper>
        </div>

        <div className="space-y-6">
          <LoadingWrapper
            loadingKey="quotes"
            className="h-[100px]"
          >
            <MotivationalQuotes />
          </LoadingWrapper>

          <LoadingWrapper
            loadingKey="ai-coach"
            className="h-[480px]"
          >
            <AICoach />
          </LoadingWrapper>
        </div>
      </div>
    </div>
  )
} 