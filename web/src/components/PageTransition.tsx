import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode, useRef, useEffect } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
}

export default function PageTransition({ children }: PageTransitionProps) {
  const isMountedRef = useRef(true)
  const transitionStateRef = useRef<'entering' | 'exiting' | 'idle'>('idle')

  // Track component mount state
  useEffect(() => {
    console.log('[Debug] PageTransition mounted')
    isMountedRef.current = true
    return () => {
      console.log('[Debug] PageTransition unmounting')
      isMountedRef.current = false
    }
  }, [])

  const handleBeforeAnimate = () => {
    if (!isMountedRef.current) {
      console.log('[Debug] Skipping page transition - component unmounted')
      return
    }
  }

  return (
    <AnimatePresence mode="wait" onExitComplete={() => {
      console.log('[Debug] All exit animations completed')
      if (!isMountedRef.current) {
        console.log('[Debug] Component unmounted during exit animation')
      }
    }}>
      {isMountedRef.current && (
        <motion.div
          key="page-transition"
          initial="initial"
          animate={isMountedRef.current ? "animate" : "initial"}
          exit="exit"
          variants={pageVariants}
          className="min-h-screen w-full"
          onAnimationStart={() => {
            console.log('[Debug] Page transition animation starting')
            transitionStateRef.current = 'entering'
          }}
          onAnimationComplete={() => {
            if (transitionStateRef.current === 'entering') {
              console.log('[Debug] Page transition enter animation completed')
            } else if (transitionStateRef.current === 'exiting') {
              console.log('[Debug] Page transition exit animation completed')
            }
            transitionStateRef.current = 'idle'
          }}
          onBeforeLayoutMeasure={() => {
            console.log('[Debug] Measuring page layout before transition')
            handleBeforeAnimate()
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
