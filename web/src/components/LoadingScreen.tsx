import React from 'react'

interface LoadingScreenProps {
  message?: string
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Tracking your progress...' }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-primary/10 via-primary/[0.02] to-transparent blur-3xl" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tl from-primary/10 via-primary/[0.02] to-transparent blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-6 text-center">
        <div className="mb-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent">
            WavTrack
          </h1>
        </div>

        {/* Loading animation */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-primary/0 animate-pulse blur-md" />
          <div className="relative h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <p className="text-base sm:text-lg font-medium text-foreground/80">{message}</p>
          <p className="text-sm text-muted-foreground">Your beat production journey starts here</p>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
