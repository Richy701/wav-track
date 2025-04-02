interface PlausibleWindow extends Window {
  plausible?: (
    eventName: string,
    options?: { props?: Record<string, string | number | boolean> }
  ) => void
}

declare const window: PlausibleWindow

export const trackEvent = (
  eventName: string,
  props?: Record<string, string | number | boolean>
) => {
  if (window.plausible) {
    window.plausible(eventName, { props })
  }
}

// Predefined events for consistent tracking
export const ANALYTICS_EVENTS = {
  FEEDBACK_OPENED: 'feedback_opened',
  GUEST_LOGIN: 'guest_login',
  PROJECT_CREATED: 'project_created',
  BEAT_CREATED: 'beat_created',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  SETTINGS_CHANGED: 'settings_changed',
  EXPORT_STARTED: 'export_started',
  PAGE_VIEW: 'page_view',
} as const
