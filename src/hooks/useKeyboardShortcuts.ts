import { useEffect, useCallback } from 'react'

export interface KeyboardShortcuts {
  // Timer controls
  toggleTimer?: () => void
  resetTimer?: () => void
  switchToFocus?: () => void
  switchToBreak?: () => void
  
  // Goal management
  addGoal?: () => void
  
  // General
  openSettings?: () => void
  closeModal?: () => void
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts, enabled: boolean = true) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return
    
    // Don't trigger shortcuts when user is typing in an input
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as Element)?.contentEditable === 'true'
    ) {
      // Only allow Escape to work in input fields
      if (event.key === 'Escape' && shortcuts.closeModal) {
        event.preventDefault()
        shortcuts.closeModal()
      }
      return
    }
    
    // Prevent shortcuts when modifier keys are pressed (except for specific combinations)
    if (event.altKey || event.metaKey || event.ctrlKey) {
      return
    }
    
    switch (event.key.toLowerCase()) {
      case ' ': // Spacebar
      case 'space':
        if (shortcuts.toggleTimer) {
          event.preventDefault()
          shortcuts.toggleTimer()
        }
        break
        
      case 'r':
        if (shortcuts.resetTimer) {
          event.preventDefault()
          shortcuts.resetTimer()
        }
        break
        
      case '1':
        if (shortcuts.switchToFocus) {
          event.preventDefault()
          shortcuts.switchToFocus()
        }
        break
        
      case '2':
        if (shortcuts.switchToBreak) {
          event.preventDefault()
          shortcuts.switchToBreak()
        }
        break
        
      case 'n':
        if (shortcuts.addGoal) {
          event.preventDefault()
          shortcuts.addGoal()
        }
        break
        
      case 's':
        if (shortcuts.openSettings) {
          event.preventDefault()
          shortcuts.openSettings()
        }
        break
        
      case 'escape':
        if (shortcuts.closeModal) {
          event.preventDefault()
          shortcuts.closeModal()
        }
        break
    }
  }, [shortcuts, enabled])
  
  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown)
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [handleKeyDown, enabled])
}

// Hook for showing keyboard shortcuts help
export const useKeyboardShortcutsHelp = () => {
  const shortcuts = [
    { key: 'Space', description: 'Start/Pause timer' },
    { key: 'R', description: 'Reset timer' },
    { key: '1', description: 'Switch to Focus mode' },
    { key: '2', description: 'Switch to Break mode' },
    { key: 'N', description: 'Add new goal' },
    { key: 'S', description: 'Open settings' },
    { key: 'Escape', description: 'Close modal/form' }
  ]
  
  return shortcuts
}