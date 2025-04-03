import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme as Theme
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = window.document.documentElement
    const applyTheme = (newTheme: Theme) => {
      // Disable transitions temporarily
      root.style.setProperty('transition', 'none')
      
      // Remove classes first
      root.classList.remove('light', 'dark')
      
      // Determine the effective theme
      const effectiveTheme = newTheme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : newTheme
      
      // Force a reflow to ensure transitions are disabled
      void root.offsetHeight // Trigger reflow without lint error

      // Add the new class immediately
      root.classList.add(effectiveTheme)
      
      // Save to localStorage after the theme is applied
      localStorage.setItem('theme', newTheme)

      // Re-enable transitions after a small delay
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          root.style.removeProperty('transition')
        })
      })
    }

    // Apply the theme immediately
    applyTheme(theme)

    // Listen for system theme changes if using system theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme('system')
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
} 