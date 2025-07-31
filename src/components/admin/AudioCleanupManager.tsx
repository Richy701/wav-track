import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Trash2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'
import { 
  performAudioCleanup, 
  getAudioStorageStats, 
  type AudioCleanupResult 
} from '@/lib/utils/audioCleanup'

interface AudioStats {
  totalAudioFiles: number
  projectsWithAudio: number
  orphanedFiles: number
}

export function AudioCleanupManager() {
  const [stats, setStats] = useState<AudioStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)
  const [lastCleanup, setLastCleanup] = useState<AudioCleanupResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const audioStats = await getAudioStorageStats()
      setStats(audioStats)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load audio stats'
      setError(errorMessage)
      console.error('Error loading audio stats:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCleanup = async () => {
    setIsCleaning(true)
    setError(null)
    
    try {
      const result = await performAudioCleanup()
      setLastCleanup(result)
      
      // Reload stats after cleanup
      await loadStats()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Cleanup failed'
      setError(errorMessage)
      console.error('Cleanup error:', err)
    } finally {
      setIsCleaning(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const getStorageEfficiency = () => {
    if (!stats || stats.totalAudioFiles === 0) return 100
    return Math.round(((stats.totalAudioFiles - stats.orphanedFiles) / stats.totalAudioFiles) * 100)
  }

  const getCleanupStatus = () => {
    if (!stats) return 'unknown'
    if (stats.orphanedFiles === 0) return 'clean'
    if (stats.orphanedFiles < 5) return 'warning'
    return 'critical'
  }

  const cleanupStatus = getCleanupStatus()
  const storageEfficiency = getStorageEfficiency()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audio File Management</h2>
          <p className="text-muted-foreground">
            Monitor and clean up audio files to optimize storage usage
          </p>
        </div>
        <Button 
          onClick={loadStats} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Storage Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audio Files</CardTitle>
            <Badge variant="secondary">
              {isLoading ? '...' : stats?.totalAudioFiles || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats?.totalAudioFiles || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Files in storage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Badge variant="secondary">
              {isLoading ? '...' : stats?.projectsWithAudio || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats?.projectsWithAudio || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Projects with audio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orphaned Files</CardTitle>
            <Badge 
              variant={cleanupStatus === 'clean' ? 'secondary' : cleanupStatus === 'warning' ? 'default' : 'destructive'}
            >
              {isLoading ? '...' : stats?.orphanedFiles || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats?.orphanedFiles || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Files to clean up
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Efficiency</CardTitle>
            <Badge variant="outline">
              {storageEfficiency}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storageEfficiency}%
            </div>
            <Progress value={storageEfficiency} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Efficient storage usage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cleanup Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Audio File Cleanup
          </CardTitle>
          <CardDescription>
            Remove orphaned, old, and deleted project audio files to free up storage space
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleCleanup}
              disabled={isCleaning || !stats || stats.orphanedFiles === 0}
              variant="destructive"
            >
              {isCleaning ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {isCleaning ? 'Cleaning...' : 'Clean Up Audio Files'}
            </Button>
            
            {stats && stats.orphanedFiles > 0 && (
              <Badge variant="destructive">
                {stats.orphanedFiles} files can be cleaned up
              </Badge>
            )}
            
            {stats && stats.orphanedFiles === 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                No cleanup needed
              </Badge>
            )}
          </div>

          {lastCleanup && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Last cleanup completed:</strong> Deleted {lastCleanup.totalFilesDeleted} files 
                ({lastCleanup.orphanedFilesDeleted} orphaned, {lastCleanup.oldFilesDeleted} old, {lastCleanup.deletedProjectFilesDeleted} deleted projects)
                {lastCleanup.errors.length > 0 && (
                  <span className="text-destructive"> with {lastCleanup.errors.length} error(s)</span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Cleanup Information */}
      <Card>
        <CardHeader>
          <CardTitle>Cleanup Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-medium text-sm">Orphaned Files</h4>
              <p className="text-xs text-muted-foreground">
                Audio files without corresponding active projects
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Old Files</h4>
              <p className="text-xs text-muted-foreground">
                Files from projects not modified in over 1 year
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Deleted Projects</h4>
              <p className="text-xs text-muted-foreground">
                Files from soft-deleted projects
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 