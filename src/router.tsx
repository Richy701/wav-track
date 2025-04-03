import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ProfileSettings from './pages/ProfileSettings'
import Callback from './pages/auth/Callback'
import { supabase } from './lib/supabase'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
})

const callbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/callback',
  component: Callback,
  beforeLoad: async () => {
    // Allow access to callback route even if not authenticated
    return null
  },
})

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: () => <Outlet />,
})

const profileRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/profile',
  component: Profile,
})

const profileSettingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/profile/settings',
  component: ProfileSettings,
})

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/dashboard',
  component: LandingPage,
})

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  registerRoute,
  callbackRoute,
  protectedRoute.addChildren([dashboardRoute, profileRoute, profileSettingsRoute]),
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    auth: undefined,
  },
})
