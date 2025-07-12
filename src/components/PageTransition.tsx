import { useRef, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PageTransitionProps {
  children: React.ReactNode
}

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
}

const PageTransitionInner = ({ children }: PageTransitionProps) => {
  const isMountedRef = useRef(true)
  const transitionStateRef = useRef<'idle' | 'entering' | 'exiting'>('idle')

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const handleBeforeAnimate = () => {
    if (!isMountedRef.current) return
    transitionStateRef.current = 'entering'
  }

  return (
    <AnimatePresence mode="wait">
      {isMountedRef.current && (
        <motion.div
          key="page-transition"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          className="min-h-screen w-full"
          onBeforeAnimate={handleBeforeAnimate}
          style={{
            willChange: 'transform, opacity',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default memo(PageTransitionInner)
