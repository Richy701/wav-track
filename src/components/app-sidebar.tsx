import * as React from "react"
import { Link } from "react-router-dom"
import {
  Home,
  Music,
  BarChart3,
  Trophy,
  Target,
  Settings,
  User,
  Moon,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/AuthContext"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

// WavTrack navigation data - simplified
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Sessions",
      url: "/sessions",
      icon: Music,
    },
    {
      title: "Achievements",
      url: "/achievements", 
      icon: Trophy,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()

  return (
    <Sidebar {...props}>
      <SidebarHeader className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-b-3xl mx-2 mt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <Link to="/dashboard" className="flex items-center gap-3 p-6">
                <div className="flex flex-col gap-1 leading-none">
                  <span className="text-xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 bg-clip-text text-transparent">
                    WavTrack
                  </span>
                  <span className="text-sm text-muted-foreground/80">Audio Production Suite</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-hidden px-2 py-4">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="bg-gradient-to-t from-violet-50/50 to-transparent dark:from-violet-950/10 dark:to-transparent rounded-t-2xl mx-2 mb-2 py-1">
        <div className="h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent dark:via-violet-800 mb-1" />
        <SidebarMenu className="px-2 space-y-1">
          {/* Theme Switcher */}
          <SidebarMenuItem className="overflow-hidden">
            <div className="px-2">
              <SidebarMenuButton
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-[calc(100%-8px)] h-9 bg-gradient-to-r from-violet-500/10 to-purple-500/10 hover:from-violet-500/20 hover:to-purple-500/20 border border-violet-200/20 dark:border-violet-800/20"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-violet-600" />}
                <span className="text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </SidebarMenuButton>
            </div>
          </SidebarMenuItem>
          
          {/* Settings */}
          <SidebarMenuItem className="overflow-hidden">
            <div className="px-2">
              <SidebarMenuButton asChild className="w-[calc(100%-8px)] h-9 hover:bg-violet-500/10">
                <Link to="/settings">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Settings</span>
                </Link>
              </SidebarMenuButton>
            </div>
          </SidebarMenuItem>

          {/* Profile Dropdown */}
          <SidebarMenuItem className="overflow-hidden">
            <div className="px-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-[calc(100%-8px)] h-9 bg-gradient-to-r from-purple-500/10 to-violet-500/10 hover:from-purple-500/20 hover:to-violet-500/20 border border-purple-200/20 dark:border-purple-800/20">
                    <User className="h-4 w-4" />
                    <span className="truncate text-sm">{user?.email || 'Profile'}</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-violet-200/20 dark:border-violet-800/20">
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
