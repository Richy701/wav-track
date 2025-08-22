// Collaborative Workspace Component
// Real-time collaborative interface using existing shadcn/ui design system

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  MessageSquare,
  Play,
  Pause,
  Volume2,
  Settings,
  Plus,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  Mic,
  MicOff
} from 'lucide-react'
import {
  CollaborativeWorkspaceManager,
  CollaborativeWorkspace,
  WorkspaceParticipant,
  AudioAnnotation,
  CollaborativeGoal
} from '@/lib/collaborative-workspace'

interface CollaborativeWorkspaceProps {
  workspaceId: string
  onLeave?: () => void
}

export function CollaborativeWorkspace({ workspaceId, onLeave }: CollaborativeWorkspaceProps) {
  const { user } = useAuth()
  const [workspace, setWorkspace] = useState<CollaborativeWorkspace | null>(null)
  const [participants, setParticipants] = useState<WorkspaceParticipant[]>([])
  const [annotations, setAnnotations] = useState<AudioAnnotation[]>([])
  const [goals, setGoals] = useState<CollaborativeGoal[]>([])
  const [cursors, setCursors] = useState<Map<string, { x: number; y: number }>>(new Map())
  
  // UI state
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackPosition, setPlaybackPosition] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [selectedAnnotation, setSelectedAnnotation] = useState<AudioAnnotation | null>(null)
  const [showGoalDialog, setShowGoalDialog] = useState(false)

  const workspaceManagerRef = useRef(new CollaborativeWorkspaceManager())
  const containerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Join workspace on mount
  useEffect(() => {
    if (!user || !workspaceId) return

    const joinWorkspace = async () => {
      const workspaceData = await workspaceManagerRef.current.joinWorkspace(workspaceId, user.id, {
        onParticipantJoined: (participant) => {
          setParticipants(prev => [...prev.filter(p => p.id !== participant.id), participant])
        },
        onParticipantLeft: (participantId) => {
          setParticipants(prev => prev.filter(p => p.id !== participantId))
        },
        onAnnotationAdded: (annotation) => {
          setAnnotations(prev => [...prev, annotation].sort((a, b) => a.timestamp - b.timestamp))
        },
        onPlaybackSync: (position, playing) => {
          setPlaybackPosition(position)
          setIsPlaying(playing)
          if (audioRef.current) {
            audioRef.current.currentTime = position
            if (playing) {
              audioRef.current.play()
            } else {
              audioRef.current.pause()
            }
          }
        },
        onCursorMove: (participantId, x, y) => {
          setCursors(prev => new Map(prev.set(participantId, { x, y })))
        }
      })

      if (workspaceData) {
        setWorkspace(workspaceData)
        setParticipants(workspaceData.participants)
      }
    }

    joinWorkspace()

    return () => {
      workspaceManagerRef.current.leaveWorkspace(user.id)
    }
  }, [user, workspaceId])

  // Mouse move handler for cursor tracking
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !user) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    workspaceManagerRef.current.updateCursorPosition(x, y, user.id)
  }, [user])

  // Audio playback controls
  const togglePlayback = async () => {
    if (!user) return

    const newIsPlaying = !isPlaying
    const position = audioRef.current?.currentTime || 0

    setIsPlaying(newIsPlaying)
    await workspaceManagerRef.current.syncPlayback(position, newIsPlaying, user.id)
  }

  // Add annotation at current playback position
  const addAnnotation = async () => {
    if (!user || !newComment.trim() || !workspace) return

    const timestamp = audioRef.current?.currentTime || playbackPosition
    
    const annotation = await workspaceManagerRef.current.addAnnotation(
      workspace.currentAudio?.projectId || '',
      timestamp,
      newComment,
      'comment',
      user.id
    )

    if (annotation) {
      setNewComment('')
    }
  }

  // Create new collaborative goal
  const createGoal = async (goalData: {
    title: string
    description: string
    targetValue: number
    assignedUsers: string[]
    deadline: string
  }) => {
    if (!user) return

    const goal = await workspaceManagerRef.current.createCollaborativeGoal(
      goalData.title,
      goalData.description,
      goalData.targetValue,
      goalData.assignedUsers,
      goalData.deadline,
      user.id
    )

    if (goal) {
      setGoals(prev => [...prev, goal])
      setShowGoalDialog(false)
    }
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Joining workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="h-full w-full relative bg-background"
      onMouseMove={handleMouseMove}
    >
      {/* Real-time cursors */}
      <AnimatePresence>
        {Array.from(cursors.entries()).map(([participantId, cursor]) => {
          const participant = participants.find(p => p.user_id === participantId)
          if (participantId === user?.id || !participant) return null

          return (
            <motion.div
              key={participantId}
              className="absolute pointer-events-none z-50"
              style={{
                left: `${cursor.x}%`,
                top: `${cursor.y}%`
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                  {participant.user_profile?.username}
                </span>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      <div className="grid grid-cols-12 h-full gap-4 p-4">
        {/* Main Content Area */}
        <div className="col-span-8 space-y-4">
          {/* Workspace Header */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>{workspace.name}</span>
                  </CardTitle>
                  {workspace.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {workspace.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {participants.length} active
                  </Badge>
                  <Button variant="outline" size="sm" onClick={onLeave}>
                    Leave
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Audio Player & Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    {workspace.currentAudio?.trackName || 'No audio loaded'}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <div className="text-xs text-muted-foreground">
                    {Math.floor(playbackPosition / 60)}:{Math.floor(playbackPosition % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>

              {/* Waveform with Annotations */}
              <div className="relative h-24 bg-muted rounded mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-sm text-muted-foreground">Waveform visualization</div>
                </div>
                
                {/* Annotation markers */}
                {annotations.map(annotation => (
                  <motion.div
                    key={annotation.id}
                    className="absolute top-0 bottom-0 w-0.5 bg-primary cursor-pointer"
                    style={{ left: `${(annotation.timestamp / 180) * 100}%` }}
                    whileHover={{ scale: 1.5 }}
                    onClick={() => setSelectedAnnotation(annotation)}
                  />
                ))}

                {/* Playback position indicator */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                  style={{ left: `${(playbackPosition / 180) * 100}%` }}
                />
              </div>

              {/* Add Comment */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Add comment at current position..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addAnnotation()}
                />
                <Button size="sm" onClick={addAnnotation} disabled={!newComment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Collaborative Goals */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Team Goals</span>
                </CardTitle>
                <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Team Goal</DialogTitle>
                    </DialogHeader>
                    <GoalCreationForm onSubmit={createGoal} participants={participants} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {goals.map(goal => (
                <div key={goal.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{goal.title}</h4>
                    <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                      {goal.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                  <Progress value={(goal.current_progress / goal.target_value) * 100} className="mb-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{goal.current_progress} / {goal.target_value}</span>
                    <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {goals.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No team goals yet. Create one to get started!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-4 space-y-4">
          <Tabs defaultValue="participants" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="participants">
                <Users className="h-4 w-4 mr-2" />
                People
              </TabsTrigger>
              <TabsTrigger value="comments">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {participants.map(participant => (
                        <div key={participant.id} className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={participant.user_profile?.avatar_url} />
                            <AvatarFallback>
                              {participant.user_profile?.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {participant.user_profile?.username}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {participant.role}
                              </Badge>
                              {cursors.has(participant.user_id) && (
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Comments & Annotations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {annotations.map(annotation => {
                        const participant = participants.find(p => p.user_id === annotation.user_id)
                        return (
                          <div key={annotation.id} className="border rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={participant?.user_profile?.avatar_url} />
                                <AvatarFallback>
                                  {participant?.user_profile?.username?.[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-sm font-medium">
                                {participant?.user_profile?.username}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {Math.floor(annotation.timestamp / 60)}:{Math.floor(annotation.timestamp % 60).toString().padStart(2, '0')}
                              </div>
                            </div>
                            <p className="text-sm">{annotation.content}</p>
                          </div>
                        )
                      })}
                      {annotations.length === 0 && (
                        <div className="text-center text-muted-foreground py-4">
                          No comments yet. Add one to get the conversation started!
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        preload="none"
        onTimeUpdate={(e) => setPlaybackPosition(e.currentTarget.currentTime)}
      />
    </div>
  )
}

// Goal creation form component
function GoalCreationForm({ 
  onSubmit, 
  participants 
}: { 
  onSubmit: (data: any) => void
  participants: WorkspaceParticipant[] 
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetValue, setTargetValue] = useState(10)
  const [deadline, setDeadline] = useState('')
  const [assignedUsers, setAssignedUsers] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title,
      description,
      targetValue,
      assignedUsers,
      deadline
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Goal Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="target">Target Value</Label>
        <Input
          id="target"
          type="number"
          value={targetValue}
          onChange={(e) => setTargetValue(Number(e.target.value))}
          required
        />
      </div>
      <div>
        <Label htmlFor="deadline">Deadline</Label>
        <Input
          id="deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Create Goal
      </Button>
    </form>
  )
}