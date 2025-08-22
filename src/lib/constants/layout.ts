// Layout constants for consistent spacing and grid systems across the dashboard

export const LAYOUT_CONSTANTS = {
  // Standardized spacing values
  SPACING: {
    XS: 'gap-2',
    SM: 'gap-3', 
    MD: 'gap-4',
    LG: 'gap-6',
    XL: 'gap-8',
  },
  
  // Standardized padding values
  PADDING: {
    SM: 'p-4',
    MD: 'p-6', 
    LG: 'p-8',
  },

  // Standardized margin values
  MARGIN: {
    SM: 'mb-4',
    MD: 'mb-6',
    LG: 'mb-8',
  },

  // Responsive grid breakpoints
  GRID: {
    MOBILE_FIRST: { default: 1, md: 2, lg: 3 },
    TWO_COLUMN: { default: 1, md: 2 },
    THREE_COLUMN: { default: 1, md: 2, lg: 3 },
    FOUR_COLUMN: { default: 2, md: 2, lg: 4 },
    STATS_SIDEBAR: { default: 2, lg: 1 },
  },

  // Content hierarchy spacing
  HIERARCHY: {
    SECTION: 'space-y-6',
    COMPONENT: 'space-y-4', 
    ELEMENT: 'space-y-2',
  },

  // Border radius consistency
  RADIUS: {
    SM: 'rounded-lg',
    MD: 'rounded-xl',
    LG: 'rounded-2xl',
  },
} as const

// Dashboard layout configuration
export const DASHBOARD_LAYOUT = {
  MAIN_GRID: {
    cols: { default: 1, lg: 4 },
    gap: 'lg' as keyof typeof LAYOUT_CONSTANTS.SPACING,
  },
  CONTENT_GRID: {
    cols: { default: 1, lg: 3 },
    gap: 'lg' as keyof typeof LAYOUT_CONSTANTS.SPACING,
  },
  STATS_GRID: {
    cols: { default: 2, lg: 1 },
    gap: 'md' as keyof typeof LAYOUT_CONSTANTS.SPACING,
  },
} as const