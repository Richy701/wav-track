import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import Index from './pages/Index'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ProfileSettings from './pages/ProfileSettings'
import Callback from './pages/auth/Callback'
import ScrollDemo from './pages/ScrollDemo'
import { supabase } from './lib/supabase'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Index,
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
        to: '/',
      })
    }
  },
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: () => (
    <div className="container flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <h1 className="text-2xl font-bold">Registration Currently Disabled</h1>
        <p className="text-muted-foreground">
          New user registration is currently by invitation only. Please use Google authentication to sign in or contact the administrator for access.
        </p>
        <div className="flex flex-col gap-4">
          <a
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  ),
})

const callbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/callback',
  component: Callback,
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

const scrollDemoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scroll-demo',
  component: ScrollDemo,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  callbackRoute,
  protectedRoute.addChildren([profileRoute, profileSettingsRoute]),
  scrollDemoRoute,
])

export const router = createRouter({
  routeTree,
  basepath: '/wav-track',
  defaultPreload: 'intent',
})
