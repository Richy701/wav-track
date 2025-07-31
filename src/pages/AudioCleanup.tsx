import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trash2, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { cleanupUnusedAudioFiles, getAudioStorageStats } from '@/scripts/cleanupAudio'
import { cleanupSpecificBucket, getBucketStats } from '@/scripts/cleanupSpecificBucket'
import { deepCleanupBucket, getDeepBucketAnalysis } from '@/scripts/deepCleanup'
import { nuclearCleanupBucket, getNuclearAnalysis } from '@/scripts/nuclearCleanup'
import { toast } from 'sonner'

interface AudioStats {
  totalFiles: number
  activeFiles: number
  orphanedFiles: number
  deletedProjectFiles: number
  filesToDelete: string[]
}

interface BucketStats {
  bucketId: string
  totalFiles: number
  activeFiles: number
  orphanedFiles: number
  deletedProjectFiles: number
  filesToDelete: string[]
  fileDetails: Array<{
    name: string
    size: number
    lastModified: string
    isOrphaned: boolean
    isDeletedProject: boolean
  }>
}

interface DeepCleanupStats {
  bucketId: string
  totalFiles: number
  totalSize: number
  fileTypes: Record<string, number>
  userFolders: Record<string, number>
  orphanedFiles: string[]
  orphanedSize: number
  filesToDelete: string[]
  fileDetails: Array<{
    name: string
    size: number
    lastModified: string
    type: string
    userFolder: string
    isOrphaned: boolean
  }>
}

interface NuclearCleanupStats {
  bucketId: string
  totalFiles: number
  totalSize: number
  fileTypes: Record<string, number>
  userFolders: Record<string, number>
  allFiles: string[]
  fileDetails: Array<{
    name: string
    size: number
    lastModified: string
    type: string
    userFolder: string
  }>
}

export default function AudioCleanupPage() {
  const [stats, setStats] = useState<AudioStats | null>(null)
  const [bucketStats, setBucketStats] = useState<BucketStats | null>(null)
  const [deepStats, setDeepStats] = useState<DeepCleanupStats | null>(null)
  const [nuclearStats, setNuclearStats] = useState<NuclearCleanupStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)
  const [isCleaningBucket, setIsCleaningBucket] = useState(false)
  const [isDeepCleaning, setIsDeepCleaning] = useState(false)
  const [isNuclearCleaning, setIsNuclearCleaning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const audioStats = await getAudioStorageStats()
      setStats(audioStats)
      toast.success('Audio stats loaded successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load audio stats'
      setError(errorMessage)
      toast.error('Failed to load audio stats', { description: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const loadBucketStats = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const bucketStatsData = await getBucketStats()
      setBucketStats(bucketStatsData)
      toast.success('Bucket stats loaded successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bucket stats'
      setError(errorMessage)
      toast.error('Failed to load bucket stats', { description: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const loadDeepStats = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const deepStatsData = await getDeepBucketAnalysis()
      setDeepStats(deepStatsData)
      toast.success('Deep analysis loaded successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load deep analysis'
      setError(errorMessage)
      toast.error('Failed to load deep analysis', { description: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const loadNuclearStats = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const nuclearStatsData = await getNuclearAnalysis()
      setNuclearStats(nuclearStatsData)
      toast.success('Nuclear analysis loaded successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load nuclear analysis'
      setError(errorMessage)
      toast.error('Failed to load nuclear analysis', { description: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCleanup = async () => {
    if (!stats || stats.filesToDelete.length === 0) {
      toast.warning('No files to clean up')
      return
    }

    setIsCleaning(true)
    setError(null)
    
    try {
      const result = await cleanupUnusedAudioFiles()
      setStats(result)
      toast.success(`Cleanup completed! Deleted ${result.filesToDelete.length} files`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Cleanup failed'
      setError(errorMessage)
      toast.error('Cleanup failed', { description: errorMessage })
    } finally {
      setIsCleaning(false)
    }
  }

  const handleBucketCleanup = async () => {
    if (!bucketStats || bucketStats.filesToDelete.length === 0) {
      toast.warning('No files to clean up in bucket')
      return
    }

    setIsCleaningBucket(true)
    setError(null)
    
    try {
      const result = await cleanupSpecificBucket()
      setBucketStats(result)
      toast.success(`Bucket cleanup completed! Deleted ${result.filesToDelete.length} files`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bucket cleanup failed'
      setError(errorMessage)
      toast.error('Bucket cleanup failed', { description: errorMessage })
    } finally {
      setIsCleaningBucket(false)
    }
  }

  const handleDeepCleanup = async () => {
    if (!deepStats || deepStats.filesToDelete.length === 0) {
      toast.warning('No files to clean up with deep analysis')
      return
    }

    setIsDeepCleaning(true)
    setError(null)
    
    try {
      const result = await deepCleanupBucket()
      setDeepStats(result)
      toast.success(`Deep cleanup completed! Deleted ${result.filesToDelete.length} files`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Deep cleanup failed'
      setError(errorMessage)
      toast.error('Deep cleanup failed', { description: errorMessage })
    } finally {
      setIsDeepCleaning(false)
    }
  }

  const handleNuclearCleanup = async () => {
    if (!nuclearStats || nuclearStats.allFiles.length === 0) {
      toast.warning('No files to clean up with nuclear option')
      return
    }

    const confirmed = window.confirm(
      `☢️ NUCLEAR CLEANUP WARNING!\n\n` +
      `This will delete ALL ${nuclearStats.allFiles.length} files in the bucket!\n` +
      `Total size: ${(nuclearStats.totalSize / 1024 / 1024).toFixed(2)} MB\n\n` +
      `This action cannot be undone. Are you absolutely sure?`
    )

    if (!confirmed) {
      toast.info('Nuclear cleanup cancelled')
      return
    }

    setIsNuclearCleaning(true)
    setError(null)
    
    try {
      const result = await nuclearCleanupBucket()
      setNuclearStats(result)
      toast.success(`Nuclear cleanup completed! Deleted ${result.allFiles.length} files`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nuclear cleanup failed'
      setError(errorMessage)
      toast.error('Nuclear cleanup failed', { description: errorMessage })
    } finally {
      setIsNuclearCleaning(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audio File Cleanup</h1>
          <p className="text-muted-foreground">
            Clean up unused audio files from storage buckets
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={loadStats} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Info className="h-4 w-4 mr-2" />
            )}
            Project Audio Stats
          </Button>
          <Button 
            onClick={loadBucketStats} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Info className="h-4 w-4 mr-2" />
            )}
            Bucket Stats
          </Button>
          <Button 
            onClick={loadDeepStats} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Info className="h-4 w-4 mr-2" />
            )}
            Deep Analysis
          </Button>
          <Button 
            onClick={loadNuclearStats} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Info className="h-4 w-4 mr-2" />
            )}
            Nuclear Analysis
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <Badge variant="secondary">{stats.totalFiles}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFiles}</div>
              <p className="text-xs text-muted-foreground">In storage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Files</CardTitle>
              <Badge variant="default">{stats.activeFiles}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeFiles}</div>
              <p className="text-xs text-muted-foreground">Linked to projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orphaned Files</CardTitle>
              <Badge variant="destructive">{stats.orphanedFiles}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orphanedFiles}</div>
              <p className="text-xs text-muted-foreground">No project reference</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deleted Projects</CardTitle>
              <Badge variant="destructive">{stats.deletedProjectFiles}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.deletedProjectFiles}</div>
              <p className="text-xs text-muted-foreground">From deleted projects</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cleanup Action */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Clean Up Audio Files
          </CardTitle>
          <CardDescription>
            Remove orphaned and deleted project audio files to free up storage space
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats && stats.filesToDelete.length > 0 ? (
            <>
              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleCleanup}
                  disabled={isCleaning}
                  variant="destructive"
                  size="lg"
                >
                  {isCleaning ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {isCleaning ? 'Cleaning...' : `Delete ${stats.filesToDelete.length} Files`}
                </Button>
                
                <Badge variant="destructive">
                  {stats.filesToDelete.length} files will be deleted
                </Badge>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> This action will permanently delete {stats.filesToDelete.length} audio files. 
                  This action cannot be undone.
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="font-medium mb-2">Files to be deleted:</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {stats.filesToDelete.map((file, index) => (
                    <div key={index} className="text-sm text-muted-foreground font-mono">
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : stats ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-600">No files need to be cleaned up</span>
            </div>
          ) : (
            <div className="text-muted-foreground">
              Click "Refresh Stats" to see what files can be cleaned up
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bucket Cleanup Section */}
      {bucketStats && (
        <>
          <div className="border-t pt-6">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Specific Bucket Cleanup</h2>
            <p className="text-muted-foreground mb-6">
              Bucket ID: <code className="bg-muted px-2 py-1 rounded">{bucketStats.bucketId}</code>
            </p>
          </div>

          {/* Bucket Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                <Badge variant="secondary">{bucketStats.totalFiles}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bucketStats.totalFiles}</div>
                <p className="text-xs text-muted-foreground">In bucket</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Files</CardTitle>
                <Badge variant="default">{bucketStats.activeFiles}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bucketStats.activeFiles}</div>
                <p className="text-xs text-muted-foreground">Linked to projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orphaned Files</CardTitle>
                <Badge variant="destructive">{bucketStats.orphanedFiles}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bucketStats.orphanedFiles}</div>
                <p className="text-xs text-muted-foreground">No project reference</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deleted Projects</CardTitle>
                <Badge variant="destructive">{bucketStats.deletedProjectFiles}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bucketStats.deletedProjectFiles}</div>
                <p className="text-xs text-muted-foreground">From deleted projects</p>
              </CardContent>
            </Card>
          </div>

          {/* Bucket Cleanup Action */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Clean Up Bucket Files
              </CardTitle>
              <CardDescription>
                Remove orphaned and deleted project audio files from the specific bucket
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bucketStats.filesToDelete.length > 0 ? (
                <>
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={handleBucketCleanup}
                      disabled={isCleaningBucket}
                      variant="destructive"
                      size="lg"
                    >
                      {isCleaningBucket ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      {isCleaningBucket ? 'Cleaning...' : `Delete ${bucketStats.filesToDelete.length} Files`}
                    </Button>
                    
                    <Badge variant="destructive">
                      {bucketStats.filesToDelete.length} files will be deleted
                    </Badge>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Warning:</strong> This action will permanently delete {bucketStats.filesToDelete.length} audio files from bucket {bucketStats.bucketId}. 
                      This action cannot be undone.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <h4 className="font-medium mb-2">Files to be deleted:</h4>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {bucketStats.fileDetails
                        .filter(file => bucketStats.filesToDelete.includes(file.name))
                        .map((file, index) => (
                          <div key={index} className="text-sm text-muted-foreground font-mono flex justify-between">
                            <span>{file.name}</span>
                            <span className="text-xs">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">No files need to be cleaned up in this bucket</span>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Deep Cleanup Section */}
      {deepStats && (
        <>
          <div className="border-t pt-6">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Deep Cleanup Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Advanced analysis with multiple cleanup strategies
            </p>
          </div>

          {/* Deep Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                <Badge variant="secondary">{deepStats.totalFiles}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deepStats.totalFiles}</div>
                <p className="text-xs text-muted-foreground">
                  {(deepStats.totalSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orphaned Files</CardTitle>
                <Badge variant="destructive">{deepStats.orphanedFiles.length}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deepStats.orphanedFiles.length}</div>
                <p className="text-xs text-muted-foreground">
                  {(deepStats.orphanedSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">File Types</CardTitle>
                <Badge variant="outline">{Object.keys(deepStats.fileTypes).length}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(deepStats.fileTypes).length}</div>
                <p className="text-xs text-muted-foreground">Different types</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Folders</CardTitle>
                <Badge variant="outline">{Object.keys(deepStats.userFolders).length}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(deepStats.userFolders).length}</div>
                <p className="text-xs text-muted-foreground">User directories</p>
              </CardContent>
            </Card>
          </div>

          {/* Deep Cleanup Action */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Deep Cleanup
              </CardTitle>
              <CardDescription>
                Advanced cleanup using multiple strategies: orphaned files, invalid users, old files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {deepStats.filesToDelete.length > 0 ? (
                <>
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={handleDeepCleanup}
                      disabled={isDeepCleaning}
                      variant="destructive"
                      size="lg"
                    >
                      {isDeepCleaning ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      {isDeepCleaning ? 'Deep Cleaning...' : `Deep Clean ${deepStats.filesToDelete.length} Files`}
                    </Button>
                    
                    <Badge variant="destructive">
                      {deepStats.filesToDelete.length} files will be deleted
                    </Badge>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Deep Cleanup:</strong> This will delete orphaned files, files from invalid users, and files older than 1 year.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <h4 className="font-medium mb-2">Files to be deleted:</h4>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {deepStats.fileDetails
                        .filter(file => deepStats.filesToDelete.includes(file.name))
                        .map((file, index) => (
                          <div key={index} className="text-sm text-muted-foreground font-mono flex justify-between">
                            <span>{file.name}</span>
                            <span className="text-xs">({(file.size / 1024 / 1024).toFixed(2)} MB, {file.type})</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">No files need deep cleanup</span>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Nuclear Cleanup Section */}
      {nuclearStats && (
        <>
          <div className="border-t pt-6">
            <h2 className="text-2xl font-bold tracking-tight mb-4">☢️ Nuclear Cleanup</h2>
            <p className="text-muted-foreground mb-6">
              <strong>WARNING:</strong> This will delete ALL files in the bucket!
            </p>
          </div>

          {/* Nuclear Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-800">Total Files</CardTitle>
                <Badge variant="destructive">{nuclearStats.totalFiles}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-800">{nuclearStats.totalFiles}</div>
                <p className="text-xs text-red-600">
                  {(nuclearStats.totalSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-800">File Types</CardTitle>
                <Badge variant="destructive">{Object.keys(nuclearStats.fileTypes).length}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-800">{Object.keys(nuclearStats.fileTypes).length}</div>
                <p className="text-xs text-red-600">Different types</p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-800">User Folders</CardTitle>
                <Badge variant="destructive">{Object.keys(nuclearStats.userFolders).length}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-800">{Object.keys(nuclearStats.userFolders).length}</div>
                <p className="text-xs text-red-600">User directories</p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-800">Total Size</CardTitle>
                <Badge variant="destructive">{(nuclearStats.totalSize / 1024 / 1024).toFixed(0)}MB</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-800">{(nuclearStats.totalSize / 1024 / 1024).toFixed(2)}</div>
                <p className="text-xs text-red-600">MB to be freed</p>
              </CardContent>
            </Card>
          </div>

          {/* Nuclear Cleanup Action */}
          <Card className="border-red-300 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Trash2 className="h-5 w-5" />
                ☢️ Nuclear Cleanup
              </CardTitle>
              <CardDescription className="text-red-600">
                <strong>WARNING:</strong> This will permanently delete ALL {nuclearStats.allFiles.length} files in the bucket!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {nuclearStats.allFiles.length > 0 ? (
                <>
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={handleNuclearCleanup}
                      disabled={isNuclearCleaning}
                      variant="destructive"
                      size="lg"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isNuclearCleaning ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      {isNuclearCleaning ? 'Nuclear Cleaning...' : `☢️ NUCLEAR DELETE ALL ${nuclearStats.allFiles.length} FILES`}
                    </Button>
                    
                    <Badge variant="destructive" className="bg-red-600">
                      {nuclearStats.allFiles.length} files will be deleted
                    </Badge>
                  </div>

                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>☢️ NUCLEAR WARNING:</strong> This action will permanently delete ALL files in the bucket. 
                      This action cannot be undone. Make sure you have backups if needed.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <h4 className="font-medium mb-2 text-red-800">All files to be deleted:</h4>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {nuclearStats.fileDetails.map((file, index) => (
                        <div key={index} className="text-sm text-red-600 font-mono flex justify-between">
                          <span>{file.name}</span>
                          <span className="text-xs">({(file.size / 1024 / 1024).toFixed(2)} MB, {file.type})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Bucket is already empty</span>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-sm">Orphaned Files</h4>
              <p className="text-xs text-muted-foreground">
                Audio files in storage that don't have corresponding active projects in the database
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Deleted Project Files</h4>
              <p className="text-xs text-muted-foreground">
                Audio files from projects that have been soft-deleted
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 