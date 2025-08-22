// Unified Color System for WavTrack Dashboard
// This centralizes all color definitions to ensure consistency across the app

export const COLORS = {
  // Primary Brand Colors (Violet/Purple theme established in sidebar)
  primary: {
    50: 'rgb(245 243 255)',    // lightest
    100: 'rgb(237 233 254)',
    200: 'rgb(221 214 254)',
    300: 'rgb(196 181 253)',
    400: 'rgb(167 139 250)',
    500: 'rgb(139 92 246)',    // primary violet
    600: 'rgb(124 58 237)',    // primary purple
    700: 'rgb(109 40 217)',
    800: 'rgb(91 33 182)',
    900: 'rgb(76 29 149)',     // darkest
  },

  // Status Colors (Semantic meaning)
  status: {
    success: {
      light: 'rgb(34 197 94)',     // green-500
      dark: 'rgb(74 222 128)',     // green-400
      bg: 'rgb(34 197 94 / 0.1)',
    },
    warning: {
      light: 'rgb(245 158 11)',    // amber-500  
      dark: 'rgb(251 191 36)',     // amber-400
      bg: 'rgb(245 158 11 / 0.1)',
    },
    danger: {
      light: 'rgb(239 68 68)',     // red-500
      dark: 'rgb(248 113 113)',    // red-400
      bg: 'rgb(239 68 68 / 0.1)',
    },
    info: {
      light: 'rgb(59 130 246)',    // blue-500
      dark: 'rgb(96 165 250)',     // blue-400
      bg: 'rgb(59 130 246 / 0.1)',
    },
  },

  // Project Workflow Colors (Consistent with status progression)
  workflow: {
    idea: {
      light: 'rgb(139 92 246)',    // violet-500 (primary)
      dark: 'rgb(167 139 250)',    // violet-400
      bg: 'rgb(139 92 246 / 0.1)',
    },
    inProgress: {
      light: 'rgb(245 158 11)',    // amber-500 (warning)
      dark: 'rgb(251 191 36)',     // amber-400
      bg: 'rgb(245 158 11 / 0.1)',
    },
    mixing: {
      light: 'rgb(124 58 237)',    // purple-600 (darker primary)
      dark: 'rgb(147 51 234)',     // purple-500
      bg: 'rgb(124 58 237 / 0.1)',
    },
    mastering: {
      light: 'rgb(109 40 217)',    // purple-700 (final stage primary)
      dark: 'rgb(124 58 237)',     // purple-600
      bg: 'rgb(109 40 217 / 0.1)',
    },
    completed: {
      light: 'rgb(34 197 94)',     // green-500 (success)
      dark: 'rgb(74 222 128)',     // green-400
      bg: 'rgb(34 197 94 / 0.1)',
    },
  },

  // Session/Activity Colors
  session: {
    active: {
      light: 'rgb(249 115 22)',    // orange-500
      dark: 'rgb(251 146 60)',     // orange-400
      bg: 'rgb(249 115 22 / 0.1)',
    },
    completed: {
      light: 'rgb(34 197 94)',     // green-500 (success)
      dark: 'rgb(74 222 128)',     // green-400
      bg: 'rgb(34 197 94 / 0.1)',
    },
  },

  // UI Neutrals (Gray scale)
  neutral: {
    50: 'rgb(250 250 250)',
    100: 'rgb(245 245 245)',
    200: 'rgb(229 229 229)',
    300: 'rgb(212 212 212)',
    400: 'rgb(163 163 163)',
    500: 'rgb(115 115 115)',
    600: 'rgb(82 82 82)',
    700: 'rgb(64 64 64)',
    800: 'rgb(38 38 38)',
    900: 'rgb(23 23 23)',
  },
} as const

// CSS Variables mapping for Tailwind compatibility
export const CSS_VARIABLES = {
  '--color-primary': COLORS.primary[500],
  '--color-primary-foreground': 'rgb(255 255 255)',
  '--color-success': COLORS.status.success.light,
  '--color-warning': COLORS.status.warning.light,
  '--color-danger': COLORS.status.danger.light,
  '--color-info': COLORS.status.info.light,
} as const

// Helper functions for consistent color application
export const getStatusColor = (status: 'idea' | 'in-progress' | 'mixing' | 'mastering' | 'completed', isDark = false) => {
  const statusMap = {
    'idea': COLORS.workflow.idea,
    'in-progress': COLORS.workflow.inProgress,
    'mixing': COLORS.workflow.mixing,
    'mastering': COLORS.workflow.mastering,
    'completed': COLORS.workflow.completed,
  }
  
  const colors = statusMap[status]
  return isDark ? colors.dark : colors.light
}

export const getStatusClasses = (status: 'idea' | 'in-progress' | 'mixing' | 'mastering' | 'completed') => {
  const classMap = {
    'idea': 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
    'in-progress': 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    'mixing': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'mastering': 'bg-purple-200 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    'completed': 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  }
  
  return classMap[status]
}