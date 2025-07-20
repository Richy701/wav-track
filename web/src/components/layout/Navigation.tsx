import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  House,
  MusicNote,
  ChartLineUp,
  Gear,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: House },
  { href: '/projects', label: 'Projects', icon: MusicNote },
  { href: '/stats', label: 'Stats', icon: ChartLineUp },
  { href: '/settings', label: 'Settings', icon: Gear },
]

export default function Navigation() {
  const location = useLocation()

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <MusicNote className="h-6 w-6 text-primary" weight="fill" />
              <span className="text-xl font-semibold">WavTrack</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="group relative flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                      )}
                      weight={isActive ? 'fill' : 'regular'}
                    />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Remove the unused New Project button */}
          </div>
        </div>
      </div>
    </header>
  )
} 