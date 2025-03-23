import { useEffect, useRef, useState, memo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

interface VirtualListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight: number
  overscan?: number
  className?: string
}

function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  overscan = 5,
  className = '',
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [parentHeight, setParentHeight] = useState(0)

  useEffect(() => {
    if (parentRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        setParentHeight(entries[0].contentRect.height)
      })

      resizeObserver.observe(parentRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [])

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  })

  return (
    <div
      ref={parentRef}
      className={className}
      style={{
        height: '100%',
        overflow: 'auto',
        position: 'relative',
        willChange: 'transform',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(VirtualList) as typeof VirtualList
