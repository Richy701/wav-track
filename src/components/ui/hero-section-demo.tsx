import { HeroSection } from "@/components/ui/hero-section-dark"

function HeroSectionDemo() {
  const handleWaitlistSubmit = () => {
    // Show confetti effect if needed
  }

  return (
    <HeroSection
      title="Welcome to WavTrack"
      subtitle={{
        regular: "Transform your music production with ",
        gradient: "powerful beat tracking tools",
      }}
      description="Take your music production to the next level with our comprehensive suite of beat tracking and analysis tools. Perfect for producers, musicians, and audio enthusiasts."
      onWaitlistSubmit={handleWaitlistSubmit}
      gridOptions={{
        angle: 65,
        opacity: 0,
        cellSize: 50,
        lightLineColor: "#4a4a4a",
        darkLineColor: "#2a2a2a",
      }}
    />
  )
}

export { HeroSectionDemo } 