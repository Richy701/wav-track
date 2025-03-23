import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  insertAllTestData,
  insertTestData,
  insertTestBeatActivities,
  insertTestSessions,
} from '@/lib/testData'
import { inspectProjectsTable, checkExistingData } from '@/lib/debugSchema'
import {
  AlertTriangle,
  Bug,
  Database,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  Wrench,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getRecentErrors, clearErrorLog, setupGlobalErrorHandlers } from '@/lib/errorLogger'

export default function TestDataGenerator() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentTask, setCurrentTask] = useState<string | null>(null)
  const [errors, setErrors] = useState<
    Array<{
      timestamp: number
      type: string
      message: string
      details?: any
    }>
  >([])
  const { toast } = useToast()

  // Set up error handlers and fetch errors periodically
  useEffect(() => {
    setupGlobalErrorHandlers()

    // Set up a timer to periodically check for new errors
    const timer = setInterval(() => {
      setErrors(getRecentErrors())
    }, 3000)

    // Immediately get any existing errors
    setErrors(getRecentErrors())

    return () => {
      clearInterval(timer)
    }
  }, [])

  const handleClearErrors = () => {
    clearErrorLog()
    setErrors([])
    toast({
      title: 'Error log cleared',
      description: 'The error log has been reset.',
      duration: 3000,
    })
  }

  const handleGenerateAll = async () => {
    try {
      setIsLoading(true)
      setCurrentTask('Generating all test data...')
      await insertAllTestData()
      toast({
        title: 'Success!',
        description: 'All test data has been generated successfully.',
        duration: 5000,
      })
    } catch (error) {
      console.error('Error generating test data:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate test data. See console for details.',
        variant: 'destructive',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
      setCurrentTask(null)
    }
  }

  const handleGenerateProjects = async () => {
    try {
      setIsLoading(true)
      setCurrentTask('Generating project data...')
      await insertTestData()
      toast({
        title: 'Success!',
        description: 'Project test data has been generated successfully.',
        duration: 3000,
      })
    } catch (error) {
      console.error('Error generating project data:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate project data. See console for details.',
        variant: 'destructive',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
      setCurrentTask(null)
    }
  }

  const handleGenerateBeatActivities = async () => {
    try {
      setIsLoading(true)
      setCurrentTask('Generating beat activity data...')
      await insertTestBeatActivities()
      toast({
        title: 'Success!',
        description: 'Beat activity test data has been generated successfully.',
        duration: 3000,
      })
    } catch (error) {
      console.error('Error generating beat activity data:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate beat activity data. See console for details.',
        variant: 'destructive',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
      setCurrentTask(null)
    }
  }

  const handleGenerateSessions = async () => {
    try {
      setIsLoading(true)
      setCurrentTask('Generating session data...')
      await insertTestSessions()
      toast({
        title: 'Success!',
        description: 'Session test data has been generated successfully.',
        duration: 3000,
      })
    } catch (error) {
      console.error('Error generating session data:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate session data. See console for details.',
        variant: 'destructive',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
      setCurrentTask(null)
    }
  }

  const handleInspectSchema = async () => {
    setIsLoading(true)
    setCurrentTask('Inspecting database schema...')

    try {
      // First check if we can get a sample project
      await inspectProjectsTable()

      toast({
        title: 'Schema inspection complete',
        description: 'Check your browser console for results',
      })
    } catch (error) {
      // Our error logger will automatically capture this
      console.error('Failed to inspect schema:', error)

      toast({
        title: 'Error inspecting schema',
        description: 'Check the Errors section below for details',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setCurrentTask(null)
    }
  }

  const handleCheckData = async () => {
    setIsLoading(true)
    setCurrentTask('Checking existing data...')

    try {
      await checkExistingData()

      toast({
        title: 'Data check complete',
        description: 'Check your browser console for results',
      })
    } catch (error) {
      // Our error logger will automatically capture this
      console.error('Failed to check data:', error)

      toast({
        title: 'Error checking data',
        description: 'Check the Errors section below for details',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setCurrentTask(null)
    }
  }

  const handleViewBrowserConsole = () => {
    // Log debug info to console
    console.group('Wav-Track Debug Information')
    console.log('Environment:', import.meta.env.MODE)
    console.log('Base URL:', import.meta.env.BASE_URL)
    console.log('Development mode:', import.meta.env.DEV)
    console.log('Recent errors:', getRecentErrors())
    console.groupEnd()

    toast({
      title: 'Debug info logged',
      description: 'Check your browser console (F12) for detailed information.',
      duration: 3000,
    })
  }

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-medium mb-4">Test Data Generator</h3>

      <Tabs defaultValue="generate">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="generate" className="flex-1">
            Generate Data
          </TabsTrigger>
          <TabsTrigger value="debug" className="flex-1">
            Debug Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <div className="space-y-2">
            <Button onClick={handleGenerateAll} disabled={isLoading} className="w-full">
              {isLoading && currentTask === 'Generating all test data...' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate All Test Data'
              )}
            </Button>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <Button
                onClick={handleGenerateProjects}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading && currentTask === 'Generating project data...' ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Projects...
                  </>
                ) : (
                  'Projects Only'
                )}
              </Button>

              <Button
                onClick={handleGenerateBeatActivities}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading && currentTask === 'Generating beat activity data...' ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Activities...
                  </>
                ) : (
                  'Beat Activities'
                )}
              </Button>

              <Button
                onClick={handleGenerateSessions}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading && currentTask === 'Generating session data...' ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Sessions...
                  </>
                ) : (
                  'Sessions Only'
                )}
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="mt-4 text-xs text-muted-foreground">
              <p>{currentTask}</p>
              <p>Please wait, this may take a moment...</p>
            </div>
          )}

          <div className="mt-4 text-xs text-muted-foreground">
            <p>This will generate realistic test data for your music production app:</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>15 music projects with various statuses and metadata</li>
              <li>30-50 beat activities across different dates</li>
              <li>15-25 production sessions with realistic durations</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="debug">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Button
                  onClick={handleInspectSchema}
                  disabled={isLoading}
                  className="w-full"
                  variant="secondary"
                >
                  {isLoading && currentTask === 'Inspecting database schema...' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inspecting...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Inspect Schema
                    </>
                  )}
                </Button>
              </div>

              <div>
                <Button
                  onClick={handleCheckData}
                  disabled={isLoading}
                  className="w-full"
                  variant="secondary"
                >
                  {isLoading && currentTask === 'Checking existing data...' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Bug className="mr-2 h-4 w-4" />
                      Check Data
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleViewBrowserConsole}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Wrench className="mr-2 h-3.5 w-3.5" />
                Log Debug Info
              </Button>

              <Button onClick={handleClearErrors} variant="outline" size="sm" className="w-full">
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Clear Error Log
              </Button>
            </div>

            {isLoading && (
              <div className="text-xs text-muted-foreground">
                <p>{currentTask}</p>
                <p>Check the browser console (F12) for detailed output.</p>
              </div>
            )}

            {/* Error Display */}
            <div className="mt-4">
              <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Recent Errors {errors.length > 0 && `(${errors.length})`}
              </h4>

              {errors.length === 0 ? (
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                  No errors recorded yet. Errors will appear here automatically when they occur.
                </div>
              ) : (
                <div className="max-h-[200px] overflow-y-auto border rounded-md text-xs">
                  {errors.map((error, index) => (
                    <div key={index} className="p-2 border-b last:border-0 hover:bg-muted/50">
                      <div className="flex justify-between">
                        <span className="font-semibold">{error.type}</span>
                        <span className="text-muted-foreground">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-1 text-red-500">{error.message}</p>
                      {error.details && (
                        <pre className="mt-1 text-[10px] text-muted-foreground overflow-x-auto">
                          {JSON.stringify(error.details, null, 2).substring(0, 150)}
                          {JSON.stringify(error.details, null, 2).length > 150 ? '...' : ''}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-muted p-3 rounded-md text-xs">
              <p className="font-semibold mb-1">Troubleshooting Steps:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Use "Inspect Schema" to verify table structure</li>
                <li>Check browser console (F12) for detailed error messages</li>
                <li>Ensure you have the right permissions in Supabase</li>
                <li>Try generating just one type of data first</li>
              </ol>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
