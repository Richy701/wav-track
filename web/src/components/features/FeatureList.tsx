import { Music2, BarChart3, Trophy } from 'lucide-react'

const features = [
  {
    title: 'Create Beats',
    description: 'Create and arrange beats with our intuitive interface',
    icon: Music2,
  },
  {
    title: 'Track Progress',
    description: 'Monitor your productivity and growth with detailed analytics',
    icon: BarChart3,
  },
  {
    title: 'Earn Achievements',
    description: 'Level up your producer game by unlocking rewards',
    icon: Trophy,
  },
]

export function FeatureList() {
  return (
    <div className="space-y-6 mt-8">
      {features.map((feature, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <feature.icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {feature.title}
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
