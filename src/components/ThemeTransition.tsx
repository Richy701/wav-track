import { useEffect } from 'react'
import { useTheme } from '@/lib/ThemeContext'

export default function ThemeTransition() {
  const { theme } = useTheme()

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-transition', 'none')
    document.documentElement.classList.add('theme-transition-ready')

    const timeout = setTimeout(() => {
      document.documentElement.style.removeProperty('--theme-transition')
    }, 0)

    return () => {
      clearTimeout(timeout)
      document.documentElement.classList.remove('theme-transition-ready')
    }
  }, [theme])

  return null
}
