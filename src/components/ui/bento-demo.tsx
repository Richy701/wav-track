import { 
  ClockIcon,
  SparklesIcon,
  UserGroupIcon,
  TrophyIcon,
  MusicalNoteIcon
} from "@heroicons/react/24/solid";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { ResponsiveImage } from "@/components/ui/responsive-image";

const features = [
  {
    Icon: ClockIcon,
    name: "Production Timer",
    description: "Track your beat-making sessions and improve productivity with our smart timer.",
    href: "/features#timer",
    cta: "Start Tracking",
    background: (
      <ResponsiveImage
        src="/assets/images/features/beat-creation.webp"
        alt="Beat Creation"
        className="absolute -right-20 -top-20 opacity-30 mix-blend-luminosity contrast-125 saturate-150"
        sizes="(max-width: 768px) 100vw, 50vw"
        quality={90}
        widths={[400, 800]}
      />
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    iconClassName: "bg-gradient-to-br from-[#8257E5] to-[#B490FF] [&>*]:fill-white",
  },
  {
    Icon: SparklesIcon,
    name: "AI Coach",
    description: "Get personalized feedback and suggestions to improve your music production skills.",
    href: "/features#ai-coach",
    cta: "Meet Your Coach",
    background: (
      <ResponsiveImage
        src="/assets/images/features/audio-analysis.webp"
        alt="AI Coaching"
        className="absolute -right-20 -top-20 opacity-30 mix-blend-luminosity contrast-125 saturate-150"
        sizes="(max-width: 768px) 100vw, 50vw"
        quality={90}
        widths={[400, 800]}
      />
    ),
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2",
    iconClassName: "bg-gradient-to-br from-[#8257E5] to-[#B490FF] [&>*]:fill-white",
  },
  {
    Icon: UserGroupIcon,
    name: "Community",
    description: "Connect with other producers, share your progress, and get inspired by the community.",
    href: "/features#community",
    cta: "Join Community",
    background: (
      <ResponsiveImage
        src="/assets/images/features/collaboration.webp"
        alt="Community"
        className="absolute -right-20 -top-20 opacity-30 mix-blend-luminosity contrast-125 saturate-150"
        sizes="(max-width: 768px) 100vw, 50vw"
        quality={90}
        widths={[400, 800]}
      />
    ),
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-3",
    iconClassName: "bg-gradient-to-br from-[#8257E5] to-[#B490FF] [&>*]:fill-white",
  },
  {
    Icon: TrophyIcon,
    name: "Achievements",
    description: "Earn badges and track your progress as you create more music.",
    href: "/features#achievements",
    cta: "View Achievements",
    background: (
      <ResponsiveImage
        src="/assets/images/features/collaboration.webp"
        alt="Collaboration"
        className="absolute -right-20 -top-20 opacity-30 mix-blend-luminosity contrast-125 saturate-150"
        sizes="(max-width: 768px) 100vw, 50vw"
        quality={90}
        widths={[400, 800]}
      />
    ),
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-3",
    iconClassName: "bg-gradient-to-br from-[#8257E5] to-[#B490FF] [&>*]:fill-white",
  },
  {
    Icon: MusicalNoteIcon,
    name: "Audio Analysis",
    description: "Advanced waveform visualization and audio analysis tools to help you understand your tracks better.",
    href: "/features#audio-analysis",
    cta: "Explore Analysis",
    background: (
      <ResponsiveImage
        src="/assets/images/features/audio-analysis.webp"
        alt="Audio Analysis"
        className="absolute -right-20 -top-20 opacity-30 mix-blend-luminosity contrast-125 saturate-150"
        sizes="(max-width: 768px) 100vw, 50vw"
        quality={90}
        widths={[400, 800]}
      />
    ),
    className: "lg:col-span-3 lg:row-start-3 lg:row-end-4",
    iconClassName: "bg-gradient-to-br from-[#8257E5] to-[#B490FF] [&>*]:fill-white",
  },
];

function BentoDemo() {
  return (
    <section className="relative py-20">
      {/* Background grid pattern */}
      <div className="absolute inset-0 max-md:hidden -z-10 h-[500px] w-full bg-transparent bg-[linear-gradient(to_right,#8257E5_1px,transparent_1px),linear-gradient(to_bottom,#8257E5_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-[0.03] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      
      {/* Purple gradient background */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-purple-500/[0.03] via-transparent to-transparent"></div>
      
      <div className="container relative">
        <div className="text-center mb-12">
          <p className="lg:text-lg my-2 text-sm font-light uppercase tracking-widest text-muted-foreground/60">
            Everything You Need
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-balance bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/80 dark:from-foreground dark:to-foreground/60">
            Level Up Your <span className="bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent">Production</span>
          </h2>
        </div>
        
        {/* Radial gradient for depth */}
        <div className="absolute inset-0 -z-10 bg-radial-gradient from-purple-500/5 via-transparent to-transparent"></div>
        
        <BentoGrid className="lg:grid-rows-3">
          {features.map((feature) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}

export { BentoDemo }; 