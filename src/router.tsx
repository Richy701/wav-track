import { createRouter, createRoute, createRootRoute, Outlet, redirect } from "@tanstack/react-router"
import { Index } from "./pages/index"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { Profile } from "./pages/Profile"
import { ProfileSettings } from "./pages/ProfileSettings"
import { Callback } from "./pages/auth/Callback"
import { ScrollDemo } from "./pages/ScrollDemo"
import { supabase } from "./lib/supabase"

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Index,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      throw redirect({
        to: "/",
      })
    }
  },
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: Register,
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      throw redirect({
        to: "/",
      })
    }
  },
})

const callbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/callback",
  component: Callback,
})

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw redirect({
        to: "/login",
      })
    }
  },
})

const profileRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/profile",
  component: Profile,
})

const profileSettingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/profile/settings",
  component: ProfileSettings,
})

const scrollDemoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/scroll-demo",
  component: ScrollDemo,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  callbackRoute,
  protectedRoute.addChildren([
    profileRoute,
    profileSettingsRoute,
  ]),
  scrollDemoRoute,
])

export const router = createRouter({
  routeTree,
  basepath: "/wav-track",
  defaultPreload: "intent"
})