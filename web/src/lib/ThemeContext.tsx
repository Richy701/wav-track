import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'dark' | 'light' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize with user's saved theme or system preference
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system'
    // Check if theme is stored in localStorage
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
      return savedTheme
    }
    // If no theme is stored, use system preference
    return 'system'
  })

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  useEffect(() => {
    // Save the theme preference
    localStorage.setItem('theme', theme)

    const html = document.documentElement
    const body = document.body

    // Enable transitions
    html.classList.add('transition-colors', 'duration-200')
    body.classList.add('transition-colors', 'duration-200')

    // Remove all theme classes first
    html.classList.remove('dark', 'light')
    body.classList.remove('dark', 'light')

    // Determine the actual theme to apply
    const actualTheme = theme === 'system' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : theme

    // Add the current theme class
    html.classList.add(actualTheme)
    body.classList.add(actualTheme)

    // Update meta theme-color and CSS variables
    if (actualTheme === 'dark') {
      html.style.setProperty('--bg', 'hsl(240 10% 3.9%)')
      html.style.setProperty('--text', 'hsl(0 0% 98%)')
      html.style.setProperty('color-scheme', 'dark')
      document.body.classList.add('dark')
      document.body.style.backgroundColor = 'hsl(240 10% 3.9%)'
      document.body.style.color = 'hsl(0 0% 98%)'
      html.style.backgroundColor = 'hsl(240 10% 3.9%)'
      html.style.color = 'hsl(0 0% 98%)'
    } else {
      html.style.setProperty('--bg', 'hsl(0 0% 100%)')
      html.style.setProperty('--text', 'hsl(240 10% 3.9%)')
      html.style.setProperty('color-scheme', 'light')
      document.body.classList.remove('dark')
      document.body.style.backgroundColor = 'hsl(0 0% 100%)'
      document.body.style.color = 'hsl(240 10% 3.9%)'
      html.style.backgroundColor = 'hsl(0 0% 100%)'
      html.style.color = 'hsl(240 10% 3.9%)'
    }

    // Force a reflow to ensure the transition is applied
    html.offsetHeight
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const html = document.documentElement
        const body = document.body

        // Remove all theme classes first
        html.classList.remove('dark', 'light')
        body.classList.remove('dark', 'light')

        // Add the appropriate theme class
        const newTheme = e.matches ? 'dark' : 'light'
        html.classList.add(newTheme)
        body.classList.add(newTheme)

        // Update styles
        if (newTheme === 'dark') {
          html.style.setProperty('--bg', 'hsl(240 10% 3.9%)')
          html.style.setProperty('--text', 'hsl(0 0% 98%)')
          html.style.setProperty('color-scheme', 'dark')
          body.style.backgroundColor = 'hsl(240 10% 3.9%)'
          body.style.color = 'hsl(0 0% 98%)'
          html.style.backgroundColor = 'hsl(240 10% 3.9%)'
          html.style.color = 'hsl(0 0% 98%)'
        } else {
          html.style.setProperty('--bg', 'hsl(0 0% 100%)')
          html.style.setProperty('--text', 'hsl(240 10% 3.9%)')
          html.style.setProperty('color-scheme', 'light')
          body.style.backgroundColor = 'hsl(0 0% 100%)'
          body.style.color = 'hsl(240 10% 3.9%)'
          html.style.backgroundColor = 'hsl(0 0% 100%)'
          html.style.color = 'hsl(240 10% 3.9%)'
        }

        // Force a reflow to ensure the transition is applied
        html.offsetHeight
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
