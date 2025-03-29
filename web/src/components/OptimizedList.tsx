import { useVirtualizer } from '@tanstack/react-virtual'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { listItem, performanceStyles } from '@/lib/animations'
import { useRef, useEffect, useCallback } from 'react'

interface OptimizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  itemHeight?: number
  overscan?: number
}

export const OptimizedList = <T extends unknown>({
  items,
  renderItem,
  className,
  itemHeight = 48,
  overscan = 5
}: OptimizedListProps<T>) => {
  const parentRef = useRef<HTMLDivElement>(null)
  const isMountedRef = useRef(true)
  const virtualItemsRef = useRef<{ [key: number]: boolean }>({})
  const animatingItemsRef = useRef<{ [key: number]: boolean }>({})

  // Track component mount state
  useEffect(() => {
    console.log('[Debug] OptimizedList mounted')
    isMountedRef.current = true
    return () => {
      console.log('[Debug] OptimizedList unmounting, cleaning up animations')
      isMountedRef.current = false
      // Clear any ongoing animations
      animatingItemsRef.current = {}
      virtualItemsRef.current = {}
    }
  }, [])

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan
  })

  // Track virtual items for cleanup
  useEffect(() => {
    if (!isMountedRef.current) return

    console.log('[Debug] Virtual items updated:', rowVirtualizer.getVirtualItems().length)
    const newVirtualItems: { [key: number]: boolean } = {}
    rowVirtualizer.getVirtualItems().forEach(item => {
      newVirtualItems[item.index] = true
    })
    virtualItemsRef.current = newVirtualItems
  }, [items])

  // Guard against unmounted animations
  const handleBeforeRemove = useCallback((index: number) => {
    console.log(`[Debug] Item ${index} preparing for removal`)
    if (!isMountedRef.current) {
      console.log(`[Debug] Skipping animation for item ${index} - component unmounted`)
      return false
    }
    if (!virtualItemsRef.current[index]) {
      console.log(`[Debug] Item ${index} already removed from virtual list`)
      return false
    }
    return true
  }, [])

  const handleAnimationStart = useCallback((index: number) => {
    if (!isMountedRef.current) return
    console.log(`[Debug] Animation starting for item ${index}`)
    animatingItemsRef.current[index] = true
  }, [])

  const handleAnimationComplete = useCallback((index: number) => {
    if (!isMountedRef.current) return
    console.log(`[Debug] Animation completed for item ${index}`)
    delete animatingItemsRef.current[index]
  }, [])

  return (
    <div
      ref={parentRef}
      className={cn(
        'h-full overflow-auto',
        performanceStyles.smoothScroll,
        className
      )}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        <AnimatePresence mode="popLayout" onExitComplete={() => {
          if (!isMountedRef.current) {
            console.log('[Debug] Cleaning up any remaining animations')
            animatingItemsRef.current = {}
          }
        }}>
          {isMountedRef.current && rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const shouldAnimate = handleBeforeRemove(virtualRow.index)
            
            return (
              <motion.div
                key={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  ...performanceStyles.hardwareAccelerated
                }}
                variants={listItem}
                initial="hidden"
                animate={shouldAnimate ? "visible" : "hidden"}
                exit="hidden"
                onBeforeLayoutMeasure={() => {
                  if (!isMountedRef.current) return
                  console.log(`[Debug] Measuring layout for item ${virtualRow.index}`)
                }}
                onAnimationStart={() => handleAnimationStart(virtualRow.index)}
                onAnimationComplete={() => handleAnimationComplete(virtualRow.index)}
                transition={{
                  duration: 0.2,
                  ease: 'easeInOut'
                }}
              >
                {renderItem(items[virtualRow.index], virtualRow.index)}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
} 