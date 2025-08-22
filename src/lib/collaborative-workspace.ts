// Collaborative Audio Workspace System
// Built on existing Supabase real-time foundation for multi-user audio collaboration

import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

// Collaborative workspace data structures
export interface CollaborativeWorkspace {
  id: string
  name: string
  description?: string
  owner_id: string
  created_at: string
  updated_at: string
  settings: {
    isPublic: boolean
    maxParticipants: number
    allowGuestAccess: boolean
    permissions: {
      canAddAudio: boolean
      canComment: boolean
      canEditAnnotations: boolean
      canManageGoals: boolean
    }
  }
  participants: WorkspaceParticipant[]
  currentAudio?: {
    projectId: string
    trackName: string
    playbackPosition: number
    isPlaying: boolean
  }
}

export interface WorkspaceParticipant {
  id: string
  user_id: string
  workspace_id: string
  role: 'owner' | 'collaborator' | 'viewer' | 'guest'
  joined_at: string
  last_active: string
  cursor_position?: {
    x: number
    y: number
    timestamp: number
  }
  user_profile?: {
    username: string
    avatar_url?: string
  }
}

export interface AudioAnnotation {
  id: string
  workspace_id: string
  project_id: string
  user_id: string
  timestamp: number // Position in audio (seconds)
  type: 'comment' | 'marker' | 'suggestion' | 'issue'
  content: string
  created_at: string
  updated_at: string
  resolved?: boolean
  replies?: AudioAnnotationReply[]
}

export interface AudioAnnotationReply {
  id: string
  annotation_id: string
  user_id: string
  content: string
  created_at: string
}

export interface CollaborativeGoal {
  id: string
  workspace_id: string
  title: string
  description: string
  target_value: number
  current_progress: number
  assigned_users: string[]
  deadline: string
  status: 'active' | 'completed' | 'paused'
  created_by: string
  created_at: string
}

// Real-time collaboration manager
export class CollaborativeWorkspaceManager {
  private channel: RealtimeChannel | null = null
  private currentWorkspace: CollaborativeWorkspace | null = null
  private participants: Map<string, WorkspaceParticipant> = new Map()
  private annotations: Map<string, AudioAnnotation> = new Map()
  
  private onParticipantJoined?: (participant: WorkspaceParticipant) => void
  private onParticipantLeft?: (participantId: string) => void
  private onAnnotationAdded?: (annotation: AudioAnnotation) => void
  private onPlaybackSync?: (position: number, isPlaying: boolean) => void
  private onCursorMove?: (participantId: string, x: number, y: number) => void

  // Join a collaborative workspace
  async joinWorkspace(
    workspaceId: string,
    userId: string,
    callbacks: {
      onParticipantJoined?: (participant: WorkspaceParticipant) => void
      onParticipantLeft?: (participantId: string) => void
      onAnnotationAdded?: (annotation: AudioAnnotation) => void
      onPlaybackSync?: (position: number, isPlaying: boolean) => void
      onCursorMove?: (participantId: string, x: number, y: number) => void
    } = {}
  ): Promise<CollaborativeWorkspace | null> {
    try {
      // Store callbacks
      this.onParticipantJoined = callbacks.onParticipantJoined
      this.onParticipantLeft = callbacks.onParticipantLeft
      this.onAnnotationAdded = callbacks.onAnnotationAdded
      this.onPlaybackSync = callbacks.onPlaybackSync
      this.onCursorMove = callbacks.onCursorMove

      // Fetch workspace data
      const { data: workspace, error: workspaceError } = await supabase
        .from('collaborative_workspaces')
        .select(`
          *,
          participants:workspace_participants(
            *,
            user_profile:profiles(username, avatar_url)
          )
        `)
        .eq('id', workspaceId)
        .single()

      if (workspaceError) throw workspaceError

      this.currentWorkspace = {
        ...workspace,
        settings: JSON.parse(workspace.settings || '{}'),
        participants: workspace.participants || []
      }

      // Add current user as participant if not already present
      await this.addParticipant(workspaceId, userId)

      // Set up real-time channel
      this.channel = supabase.channel(`workspace:${workspaceId}`)

      // Listen for participant changes
      this.channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workspace_participants',
          filter: `workspace_id=eq.${workspaceId}`
        },
        (payload) => this.handleParticipantChange(payload)
      )

      // Listen for annotation changes
      this.channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audio_annotations',
          filter: `workspace_id=eq.${workspaceId}`
        },
        (payload) => this.handleAnnotationChange(payload)
      )

      // Listen for real-time events
      this.channel.on('broadcast', { event: 'cursor_move' }, (payload) => {
        if (this.onCursorMove && payload.payload.userId !== userId) {
          this.onCursorMove(payload.payload.userId, payload.payload.x, payload.payload.y)
        }
      })

      this.channel.on('broadcast', { event: 'playback_sync' }, (payload) => {
        if (this.onPlaybackSync && payload.payload.userId !== userId) {
          this.onPlaybackSync(payload.payload.position, payload.payload.isPlaying)
        }
      })

      this.channel.on('broadcast', { event: 'typing_indicator' }, (payload) => {
        // Handle typing indicators for comments
      })

      // Subscribe to channel
      await this.channel.subscribe()

      // Load existing annotations
      await this.loadAnnotations(workspaceId)

      return this.currentWorkspace

    } catch (error) {
      console.error('Error joining workspace:', error)
      return null
    }
  }

  // Leave workspace and cleanup
  async leaveWorkspace(userId: string): Promise<void> {
    if (!this.currentWorkspace) return

    try {
      // Update participant as offline
      await supabase
        .from('workspace_participants')
        .update({ last_active: new Date().toISOString() })
        .eq('workspace_id', this.currentWorkspace.id)
        .eq('user_id', userId)

      // Unsubscribe from channel
      if (this.channel) {
        await supabase.removeChannel(this.channel)
        this.channel = null
      }

      // Clear local state
      this.currentWorkspace = null
      this.participants.clear()
      this.annotations.clear()

    } catch (error) {
      console.error('Error leaving workspace:', error)
    }
  }

  // Add audio annotation at specific timestamp
  async addAnnotation(
    projectId: string,
    timestamp: number,
    content: string,
    type: AudioAnnotation['type'] = 'comment',
    userId: string
  ): Promise<AudioAnnotation | null> {
    if (!this.currentWorkspace) return null

    try {
      const annotation: Omit<AudioAnnotation, 'id' | 'created_at' | 'updated_at'> = {
        workspace_id: this.currentWorkspace.id,
        project_id: projectId,
        user_id: userId,
        timestamp,
        type,
        content,
        resolved: false
      }

      const { data, error } = await supabase
        .from('audio_annotations')
        .insert(annotation)
        .select()
        .single()

      if (error) throw error

      const newAnnotation: AudioAnnotation = {
        ...data,
        replies: []
      }

      this.annotations.set(newAnnotation.id, newAnnotation)
      return newAnnotation

    } catch (error) {
      console.error('Error adding annotation:', error)
      return null
    }
  }

  // Sync playback position across all participants
  async syncPlayback(position: number, isPlaying: boolean, userId: string): Promise<void> {
    if (!this.channel || !this.currentWorkspace) return

    try {
      // Update workspace current audio state
      await supabase
        .from('collaborative_workspaces')
        .update({
          current_audio: JSON.stringify({
            ...this.currentWorkspace.currentAudio,
            playbackPosition: position,
            isPlaying
          })
        })
        .eq('id', this.currentWorkspace.id)

      // Broadcast to other participants
      await this.channel.send({
        type: 'broadcast',
        event: 'playback_sync',
        payload: { userId, position, isPlaying }
      })

    } catch (error) {
      console.error('Error syncing playback:', error)
    }
  }

  // Update cursor position for real-time cursors
  async updateCursorPosition(x: number, y: number, userId: string): Promise<void> {
    if (!this.channel) return

    try {
      // Broadcast cursor position (throttled to avoid spam)
      await this.channel.send({
        type: 'broadcast',
        event: 'cursor_move',
        payload: { userId, x, y, timestamp: Date.now() }
      })

    } catch (error) {
      console.error('Error updating cursor position:', error)
    }
  }

  // Create collaborative goal
  async createCollaborativeGoal(
    title: string,
    description: string,
    targetValue: number,
    assignedUsers: string[],
    deadline: string,
    createdBy: string
  ): Promise<CollaborativeGoal | null> {
    if (!this.currentWorkspace) return null

    try {
      const goal: Omit<CollaborativeGoal, 'id' | 'created_at'> = {
        workspace_id: this.currentWorkspace.id,
        title,
        description,
        target_value: targetValue,
        current_progress: 0,
        assigned_users: assignedUsers,
        deadline,
        status: 'active',
        created_by: createdBy
      }

      const { data, error } = await supabase
        .from('collaborative_goals')
        .insert(goal)
        .select()
        .single()

      if (error) throw error

      return data as CollaborativeGoal

    } catch (error) {
      console.error('Error creating collaborative goal:', error)
      return null
    }
  }

  // Update goal progress
  async updateGoalProgress(goalId: string, progress: number): Promise<void> {
    try {
      await supabase
        .from('collaborative_goals')
        .update({ 
          current_progress: progress,
          status: progress >= 100 ? 'completed' : 'active'
        })
        .eq('id', goalId)

    } catch (error) {
      console.error('Error updating goal progress:', error)
    }
  }

  // Get workspace participants
  getParticipants(): WorkspaceParticipant[] {
    return Array.from(this.participants.values())
  }

  // Get annotations for specific timestamp range
  getAnnotationsInRange(startTime: number, endTime: number): AudioAnnotation[] {
    return Array.from(this.annotations.values())
      .filter(annotation => 
        annotation.timestamp >= startTime && annotation.timestamp <= endTime
      )
      .sort((a, b) => a.timestamp - b.timestamp)
  }

  // Private helper methods
  private async addParticipant(workspaceId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workspace_participants')
        .upsert({
          workspace_id: workspaceId,
          user_id: userId,
          role: 'collaborator',
          joined_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        })

      if (error && !error.message.includes('duplicate')) {
        throw error
      }
    } catch (error) {
      console.error('Error adding participant:', error)
    }
  }

  private async loadAnnotations(workspaceId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('audio_annotations')
        .select(`
          *,
          replies:audio_annotation_replies(*)
        `)
        .eq('workspace_id', workspaceId)
        .order('timestamp', { ascending: true })

      if (error) throw error

      this.annotations.clear()
      data?.forEach(annotation => {
        this.annotations.set(annotation.id, annotation as AudioAnnotation)
      })

    } catch (error) {
      console.error('Error loading annotations:', error)
    }
  }

  private handleParticipantChange(payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload

    switch (eventType) {
      case 'INSERT':
        if (this.onParticipantJoined) {
          this.onParticipantJoined(newRecord as WorkspaceParticipant)
        }
        this.participants.set(newRecord.id, newRecord as WorkspaceParticipant)
        break

      case 'DELETE':
        if (this.onParticipantLeft) {
          this.onParticipantLeft(oldRecord.id)
        }
        this.participants.delete(oldRecord.id)
        break

      case 'UPDATE':
        this.participants.set(newRecord.id, newRecord as WorkspaceParticipant)
        break
    }
  }

  private handleAnnotationChange(payload: any): void {
    const { eventType, new: newRecord } = payload

    switch (eventType) {
      case 'INSERT':
        const annotation = { ...newRecord, replies: [] } as AudioAnnotation
        this.annotations.set(annotation.id, annotation)
        
        if (this.onAnnotationAdded) {
          this.onAnnotationAdded(annotation)
        }
        break

      case 'UPDATE':
        const existingAnnotation = this.annotations.get(newRecord.id)
        if (existingAnnotation) {
          this.annotations.set(newRecord.id, { 
            ...existingAnnotation, 
            ...newRecord 
          } as AudioAnnotation)
        }
        break

      case 'DELETE':
        this.annotations.delete(newRecord.id)
        break
    }
  }
}

// Workspace creation and management functions
export async function createCollaborativeWorkspace(
  name: string,
  description: string,
  ownerId: string,
  settings: CollaborativeWorkspace['settings']
): Promise<CollaborativeWorkspace | null> {
  try {
    const workspace = {
      name,
      description,
      owner_id: ownerId,
      settings: JSON.stringify(settings),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('collaborative_workspaces')
      .insert(workspace)
      .select()
      .single()

    if (error) throw error

    return {
      ...data,
      settings: JSON.parse(data.settings || '{}'),
      participants: []
    } as CollaborativeWorkspace

  } catch (error) {
    console.error('Error creating workspace:', error)
    return null
  }
}

export async function getUserWorkspaces(userId: string): Promise<CollaborativeWorkspace[]> {
  try {
    const { data, error } = await supabase
      .from('collaborative_workspaces')
      .select(`
        *,
        participants:workspace_participants!inner(user_id)
      `)
      .eq('participants.user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return (data || []).map(workspace => ({
      ...workspace,
      settings: JSON.parse(workspace.settings || '{}'),
      participants: workspace.participants || []
    })) as CollaborativeWorkspace[]

  } catch (error) {
    console.error('Error fetching user workspaces:', error)
    return []
  }
}

export async function inviteUserToWorkspace(
  workspaceId: string,
  userId: string,
  role: WorkspaceParticipant['role'] = 'collaborator'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('workspace_participants')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        role,
        joined_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      })

    return !error
  } catch (error) {
    console.error('Error inviting user to workspace:', error)
    return false
  }
}