import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-primary/10 via-primary/[0.02] to-transparent blur-3xl" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tl from-primary/10 via-primary/[0.02] to-transparent blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-6 text-center">
        {/* Loading animation */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-primary/0 animate-pulse blur-md" />
          <div className="relative h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <p className="text-base sm:text-lg font-medium text-foreground/80">
            Loading...
          </p>
          <p className="text-sm text-muted-foreground">
            Please wait while we set things up
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 