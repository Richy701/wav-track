import { FileXls } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'

interface YearInReviewButtonProps {
  onClick: () => void
  className?: string
}

export function YearInReviewButton({ onClick, className }: YearInReviewButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const button = buttonRef.current
    if (!button) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      button.style.setProperty('--mouse-x', `${x}px`)
      button.style.setProperty('--mouse-y', `${y}px`)
    }

    button.addEventListener('mousemove', handleMouseMove)
    return () => button.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={cn(
        'h-[140px] w-full rounded-xl border',
        'bg-white/5 dark:bg-black/20 backdrop-blur-[2px] overflow-hidden text-balance',
        'bg-gradient-to-b from-rose-500/10 via-rose-500/5 to-transparent',
        'border-rose-500/10',
        'transition-all duration-500',
        'hover:-translate-y-1',
        'hover:from-rose-500/20 hover:via-rose-500/10 hover:to-transparent',
        'group-hover:shadow-[0_0_30px_-5px]',
        'group-hover:shadow-rose-500/30',
        'group relative',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'dark:focus:ring-offset-zinc-900',
        'focus:ring-violet-500/40 dark:focus:ring-violet-500/40',
        className
      )}
    >
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-3 space-y-2 sm:space-y-3">
        <div className="rounded-lg p-2 bg-white/10 dark:bg-black/20 ring-1 ring-black/5 dark:ring-white/5 transition-transform duration-500 group-hover:scale-110 text-rose-500">
          <FileXls className="h-5 w-5" weight="fill" />
        </div>
        <div className="space-y-1 max-w-[200px]">
          <h3 className="text-base font-semibold leading-tight tracking-tight text-rose-900 dark:text-rose-100">
            Year in Review
          </h3>
          <p className="text-xs leading-snug text-rose-700/70 dark:text-rose-300/70">
            Download yearly stats
          </p>
        </div>
      </div>
      <div
        className="absolute inset-0 z-0 bg-gradient-to-br from-transparent via-transparent to-transparent transition-opacity duration-500 opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background: `radial-gradient(
            600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            var(--glow-color, rgba(244, 63, 94, 0.05)),
            transparent 40%
          )`,
          '--glow-color': 'rgba(244, 63, 94, 0.05)',
        } as React.CSSProperties}
      />
    </button>
  )
} 