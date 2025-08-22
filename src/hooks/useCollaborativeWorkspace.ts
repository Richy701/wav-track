// Collaborative Workspace Hook
// Manages real-time collaboration state and integrates with existing WavTrack architecture

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
  CollaborativeWorkspaceManager,
  CollaborativeWorkspace,
  WorkspaceParticipant,
  AudioAnnotation,
  CollaborativeGoal,
  createCollaborativeWorkspace,
  getUserWorkspaces,
  inviteUserToWorkspace
} from '@/lib/collaborative-workspace'

interface UseCollaborativeWorkspaceOptions {
  workspaceId?: string
  autoJoin?: boolean
  enableRealTimeCursors?: boolean
  enableAudioSync?: boolean
  enableAnnotations?: boolean
}

interface CollaborationState {
  isConnected: boolean
  participants: WorkspaceParticipant[]
  annotations: AudioAnnotation[]
  goals: CollaborativeGoal[]
  cursors: Map<string, { x: number; y: number }>
  playbackState: {
    position: number
    isPlaying: boolean
    lastSync: number
  }
}

export function useCollaborativeWorkspace(options: UseCollaborativeWorkspaceOptions = {}) {
  const {
    workspaceId,
    autoJoin = true,
    enableRealTimeCursors = true,
    enableAudioSync = true,
    enableAnnotations = true
  } = options

  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  const [collaborationState, setCollaborationState] = useState<CollaborationState>({
    isConnected: false,
    participants: [],
    annotations: [],
    goals: [],
    cursors: new Map(),
    playbackState: {
      position: 0,
      isPlaying: false,
      lastSync: 0
    }
  })

  const [currentWorkspace, setCurrentWorkspace] = useState<CollaborativeWorkspace | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')

  const workspaceManagerRef = useRef(new CollaborativeWorkspaceManager())

  // Fetch user's workspaces
  const workspacesQuery = useQuery({
    queryKey: ['collaborative-workspaces', user?.id],
    queryFn: async () => {
      if (!user) return []
      return await getUserWorkspaces(user.id)
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })

  // Fetch workspace goals
  const workspaceGoalsQuery = useQuery({
    queryKey: ['workspace-goals', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return []
      
      // This would fetch from collaborative_goals table
      // Implementation depends on Supabase schema being created
      return [] as CollaborativeGoal[]
    },
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000 // 2 minutes
  })

  // Create workspace mutation
  const createWorkspaceMutation = useMutation({
    mutationFn: async (workspaceData: {
      name: string
      description: string
      settings: CollaborativeWorkspace['settings']
    }) => {
      if (!user) throw new Error('User not authenticated')

      return await createCollaborativeWorkspace(
        workspaceData.name,
        workspaceData.description,
        user.id,
        workspaceData.settings
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborative-workspaces', user?.id] })
    }
  })

  // Invite user mutation
  const inviteUserMutation = useMutation({
    mutationFn: async ({ workspaceId, userId, role }: {
      workspaceId: string
      userId: string
      role: WorkspaceParticipant['role']
    }) => {
      return await inviteUserToWorkspace(workspaceId, userId, role)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborative-workspaces', user?.id] })
    }
  })

  // Join workspace
  const joinWorkspace = useCallback(async (targetWorkspaceId: string) => {
    if (!user || connectionStatus === 'connecting') return

    setConnectionStatus('connecting')

    try {
      const workspace = await workspaceManagerRef.current.joinWorkspace(
        targetWorkspaceId,
        user.id,
        {
          onParticipantJoined: (participant) => {
            setCollaborationState(prev => ({
              ...prev,
              participants: [...prev.participants.filter(p => p.id !== participant.id), participant]
            }))
          },
          onParticipantLeft: (participantId) => {
            setCollaborationState(prev => ({
              ...prev,
              participants: prev.participants.filter(p => p.id !== participantId),
              cursors: new Map(Array.from(prev.cursors.entries()).filter(([id]) => id !== participantId))
            }))
          },
          onAnnotationAdded: enableAnnotations ? (annotation) => {
            setCollaborationState(prev => ({
              ...prev,
              annotations: [...prev.annotations, annotation].sort((a, b) => a.timestamp - b.timestamp)
            }))
          } : undefined,
          onPlaybackSync: enableAudioSync ? (position, isPlaying) => {
            setCollaborationState(prev => ({
              ...prev,
              playbackState: {
                position,
                isPlaying,
                lastSync: Date.now()
              }
            }))
          } : undefined,
          onCursorMove: enableRealTimeCursors ? (participantId, x, y) => {
            setCollaborationState(prev => ({
              ...prev,
              cursors: new Map(prev.cursors.set(participantId, { x, y }))
            }))
          } : undefined
        }
      )

      if (workspace) {
        setCurrentWorkspace(workspace)
        setCollaborationState(prev => ({
          ...prev,
          isConnected: true,
          participants: workspace.participants
        }))
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('disconnected')
      }

    } catch (error) {
      console.error('Error joining workspace:', error)
      setConnectionStatus('disconnected')
    }
  }, [user, connectionStatus, enableAnnotations, enableAudioSync, enableRealTimeCursors])

  // Leave workspace
  const leaveWorkspace = useCallback(async () => {
    if (!user) return

    await workspaceManagerRef.current.leaveWorkspace(user.id)
    
    setCurrentWorkspace(null)
    setCollaborationState({
      isConnected: false,
      participants: [],
      annotations: [],
      goals: [],
      cursors: new Map(),
      playbackState: {
        position: 0,
        isPlaying: false,
        lastSync: 0
      }
    })
    setConnectionStatus('disconnected')
  }, [user])

  // Add annotation
  const addAnnotation = useCallback(async (
    projectId: string,
    timestamp: number,
    content: string,
    type: AudioAnnotation['type'] = 'comment'
  ) => {
    if (!user || !enableAnnotations) return null

    const annotation = await workspaceManagerRef.current.addAnnotation(
      projectId,
      timestamp,
      content,
      type,
      user.id
    )

    if (annotation) {
      setCollaborationState(prev => ({
        ...prev,
        annotations: [...prev.annotations, annotation].sort((a, b) => a.timestamp - b.timestamp)
      }))
    }

    return annotation
  }, [user, enableAnnotations])

  // Sync playback
  const syncPlayback = useCallback(async (position: number, isPlaying: boolean) => {
    if (!user || !enableAudioSync) return

    await workspaceManagerRef.current.syncPlayback(position, isPlaying, user.id)
    
    setCollaborationState(prev => ({
      ...prev,
      playbackState: {
        position,
        isPlaying,
        lastSync: Date.now()
      }
    }))
  }, [user, enableAudioSync])

  // Update cursor position
  const updateCursorPosition = useCallback((x: number, y: number) => {
    if (!user || !enableRealTimeCursors) return

    // Throttle cursor updates to avoid spam
    clearTimeout(updateCursorPosition.timeoutId)
    updateCursorPosition.timeoutId = setTimeout(() => {
      workspaceManagerRef.current.updateCursorPosition(x, y, user.id)
    }, 50) // 50ms throttle
  }, [user, enableRealTimeCursors]) as any

  // Create collaborative goal
  const createGoal = useCallback(async (
    title: string,
    description: string,
    targetValue: number,
    assignedUsers: string[],
    deadline: string
  ) => {
    if (!user) return null

    const goal = await workspaceManagerRef.current.createCollaborativeGoal(
      title,
      description,
      targetValue,
      assignedUsers,
      deadline,
      user.id
    )

    if (goal) {
      setCollaborationState(prev => ({
        ...prev,
        goals: [...prev.goals, goal]
      }))
    }

    return goal
  }, [user])

  // Update goal progress
  const updateGoalProgress = useCallback(async (goalId: string, progress: number) => {
    await workspaceManagerRef.current.updateGoalProgress(goalId, progress)
    
    setCollaborationState(prev => ({
      ...prev,
      goals: prev.goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, current_progress: progress, status: progress >= goal.target_value ? 'completed' : 'active' }
          : goal
      )
    }))
  }, [])

  // Auto-join workspace if specified
  useEffect(() => {
    if (workspaceId && user && autoJoin && connectionStatus === 'disconnected') {
      joinWorkspace(workspaceId)
    }
  }, [workspaceId, user, autoJoin, connectionStatus, joinWorkspace])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (user && connectionStatus === 'connected') {
        workspaceManagerRef.current.leaveWorkspace(user.id)
      }
    }
  }, [user, connectionStatus])

  // Get annotations in time range
  const getAnnotationsInRange = useCallback((startTime: number, endTime: number) => {
    return collaborationState.annotations.filter(annotation =>
      annotation.timestamp >= startTime && annotation.timestamp <= endTime
    )
  }, [collaborationState.annotations])

  // Get active participants (with recent cursor activity)
  const getActiveParticipants = useCallback(() => {
    const now = Date.now()
    const activeThreshold = 30 * 1000 // 30 seconds

    return collaborationState.participants.filter(participant => {
      const lastActive = new Date(participant.last_active).getTime()
      return (now - lastActive) < activeThreshold
    })
  }, [collaborationState.participants])

  return {
    // Workspace data
    currentWorkspace,
    userWorkspaces: workspacesQuery.data || [],
    workspaceGoals: workspaceGoalsQuery.data || [],
    
    // Collaboration state
    collaborationState,
    connectionStatus,
    isConnected: collaborationState.isConnected,
    
    // Participants
    participants: collaborationState.participants,
    activeParticipants: getActiveParticipants(),
    
    // Real-time features
    annotations: collaborationState.annotations,
    goals: collaborationState.goals,
    cursors: collaborationState.cursors,
    playbackState: collaborationState.playbackState,
    
    // Actions
    joinWorkspace,
    leaveWorkspace,
    createWorkspace: createWorkspaceMutation.mutate,
    inviteUser: inviteUserMutation.mutate,
    addAnnotation,
    syncPlayback,
    updateCursorPosition,
    createGoal,
    updateGoalProgress,
    getAnnotationsInRange,
    
    // Loading states
    isLoadingWorkspaces: workspacesQuery.isLoading,
    isCreatingWorkspace: createWorkspaceMutation.isPending,
    isInvitingUser: inviteUserMutation.isPending,
    
    // Utilities
    refreshWorkspaces: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborative-workspaces', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['workspace-goals', workspaceId] })
    }
  }
}

// Hook for managing workspace creation
export function useWorkspaceCreation() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const createWorkspace = useMutation({
    mutationFn: async (data: {
      name: string
      description: string
      isPublic: boolean
      maxParticipants: number
      permissions: {
        canAddAudio: boolean
        canComment: boolean
        canEditAnnotations: boolean
        canManageGoals: boolean
      }
    }) => {
      if (!user) throw new Error('User not authenticated')

      const settings: CollaborativeWorkspace['settings'] = {
        isPublic: data.isPublic,
        maxParticipants: data.maxParticipants,
        allowGuestAccess: data.isPublic,
        permissions: data.permissions
      }

      return await createCollaborativeWorkspace(data.name, data.description, user.id, settings)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborative-workspaces', user?.id] })
    }
  })

  return {
    createWorkspace: createWorkspace.mutate,
    isCreating: createWorkspace.isPending,
    error: createWorkspace.error,
    isSuccess: createWorkspace.isSuccess
  }
}