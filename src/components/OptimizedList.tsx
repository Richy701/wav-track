import { useVirtualizer } from '@tanstack/react-virtual'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { listItem, performanceStyles } from '@/lib/animations'
import { useRef, useEffect, useCallback, memo, useMemo } from 'react'

interface OptimizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  itemHeight?: number
  overscan?: number
}

const OptimizedListInner = memo(<T extends unknown>({
  items,
  renderItem,
  className,
  itemHeight = 48,
  overscan = 3
}: OptimizedListProps<T>) => {
  const parentRef = useRef<HTMLDivElement>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => itemHeight, [itemHeight]),
    overscan,
  })

  const virtualItems = useMemo(() => rowVirtualizer.getVirtualItems(), [rowVirtualizer])
  const totalSize = useMemo(() => rowVirtualizer.getTotalSize(), [rowVirtualizer])

  return (
    <div
      ref={parentRef}
      className={cn(
        'h-full overflow-auto',
        performanceStyles.optimizedAnimations,
        className
      )}
    >
      <div
        style={{
          height: `${totalSize}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualItems.map((virtualRow) => (
          <motion.div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </motion.div>
        ))}
      </div>
    </div>
  )
})

OptimizedListInner.displayName = 'OptimizedListInner'

export const OptimizedList = memo(OptimizedListInner) as typeof OptimizedListInner 