import { GlowCard } from "@/components/ui/spotlight-card";

export function SpotlightCardDemo() {
  return (
    <div className="w-full min-h-[400px] flex flex-row items-center justify-center gap-10 custom-cursor">
      <GlowCard glowColor="blue" className="bg-card">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Blue Glow</h3>
          <p className="text-sm text-muted-foreground">Move your cursor around to see the effect</p>
        </div>
      </GlowCard>
      
      <GlowCard glowColor="purple" className="bg-card">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Purple Glow</h3>
          <p className="text-sm text-muted-foreground">Interactive spotlight effect</p>
        </div>
      </GlowCard>
      
      <GlowCard glowColor="green" className="bg-card">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Green Glow</h3>
          <p className="text-sm text-muted-foreground">Customizable colors and sizes</p>
        </div>
      </GlowCard>
    </div>
  );
} 