import React from 'react'
import { useProjects } from '@/hooks/useProjects'
import { useProfile } from '@/hooks/useProfile'
import { LoadingWrapper } from '@/components/ui/loading-wrapper'
import { ProjectList } from '@/components/ProjectList'
import { Stats } from '@/components/Stats'
import { Achievements } from '@/components/achievements'

export function Dashboard() {
  const { projects, allProjects, isLoading: projectsLoading } = useProjects()
  const { profile, isLoading: profileLoading } = useProfile()

  return (
    <div className="space-y-6">
      <LoadingWrapper
        loadingKey="profile"
        className="h-32"
      >
        <Stats profile={profile} />
      </LoadingWrapper>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LoadingWrapper
            loadingKey="projects"
            className="h-[600px]"
          >
            <ProjectList projects={projects} />
          </LoadingWrapper>
        </div>

        <div>
          <LoadingWrapper
            loadingKey="achievements"
            className="h-[600px]"
          >
            <Achievements profile={profile} />
          </LoadingWrapper>
        </div>
      </div>
    </div>
  )
} 