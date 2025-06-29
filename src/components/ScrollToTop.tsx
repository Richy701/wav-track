import { useState, useEffect } from 'react'
import { ArrowUpIcon as ArrowUpSolid } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 100) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  // Set the scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility)
    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 right-4 z-50"
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className="rounded-full h-10 w-10 shadow-md"
            aria-label="Scroll to top"
          >
            <ArrowUpSolid className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 