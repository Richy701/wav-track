import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize with user's saved theme or system preference
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    // Check if theme is stored in localStorage
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme
    }
    // If no theme is stored, use system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  useEffect(() => {
    // Save the theme preference
    localStorage.setItem('theme', theme)

    // Add a small delay to allow for transition
    const html = document.documentElement

    // Enable transitions
    html.classList.add('transition-colors', 'duration-200')

    // Remove all theme classes first
    html.classList.remove('dark', 'light')

    // Add the current theme class
    html.classList.add(theme)

    // Update meta theme-color and CSS variables
    if (theme === 'dark') {
      html.style.setProperty('--theme-background', 'hsl(240 10% 3.9%)')
      html.style.setProperty('color-scheme', 'dark')
    } else {
      html.style.setProperty('--theme-background', 'hsl(0 0% 100%)')
      html.style.setProperty('color-scheme', 'light')
    }
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
