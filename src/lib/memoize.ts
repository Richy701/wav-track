import { memo } from 'react'
import { isEqual } from 'lodash-es'

type PropsComparator<P> = (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean

/**
 * Creates a memoized version of a component with smart prop comparison
 * @param Component The component to memoize
 * @param propsToCompare Optional array of prop names to compare (if not provided, all props will be compared)
 * @returns Memoized component
 */
export function memoWithProps<P extends object>(
  Component: React.ComponentType<P>,
  propsToCompare?: (keyof P)[]
): React.MemoExoticComponent<React.ComponentType<P>> {
  const compareProps: PropsComparator<P> = (prevProps, nextProps) => {
    if (propsToCompare) {
      return propsToCompare.every(prop => isEqual(prevProps[prop], nextProps[prop]))
    }
    return isEqual(prevProps, nextProps)
  }

  return memo(Component, compareProps)
}

/**
 * Creates a memoized version of a component with custom prop comparison
 * @param Component The component to memoize
 * @param comparator Custom function to compare props
 * @returns Memoized component
 */
export function memoWithComparator<P extends object>(
  Component: React.ComponentType<P>,
  comparator: PropsComparator<P>
): React.MemoExoticComponent<React.ComponentType<P>> {
  return memo(Component, comparator)
}

/**
 * Creates a memoized version of a component that only updates when specified props change
 * @param Component The component to memoize
 * @param propKeys Array of prop keys that should trigger updates
 * @returns Memoized component
 */
export function memoOnlyProps<P extends object>(
  Component: React.ComponentType<P>,
  propKeys: (keyof P)[]
): React.MemoExoticComponent<React.ComponentType<P>> {
  const compareProps: PropsComparator<P> = (prevProps, nextProps) => {
    return propKeys.every(key => prevProps[key] === nextProps[key])
  }

  return memo(Component, compareProps)
} 