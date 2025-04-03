/**
 * Utility function to clear all application data from localStorage
 * This can be used for testing or resetting the application
 */
export const clearAllData = () => {
  localStorage.removeItem('projects')
  localStorage.removeItem('samples')
  localStorage.removeItem('sessions')
  localStorage.removeItem('notes')
  localStorage.removeItem('beatActivities')

  console.log('All application data has been cleared from localStorage')

  // Force page reload to apply changes
  window.location.reload()
}
