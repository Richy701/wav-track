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
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                    WavTrack
                  </span>
                  <span className="text-xs text-muted-foreground">Audio Production Suite</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-hidden">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator className="mb-2" />
        <SidebarMenu className="px-2">
          {/* Theme Switcher */}
          <SidebarMenuItem className="overflow-hidden">
            <div className="px-2">
              <SidebarMenuButton
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-[calc(100%-8px)]"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </SidebarMenuButton>
            </div>
          </SidebarMenuItem>
          
          {/* Settings */}
          <SidebarMenuItem className="overflow-hidden">
            <div className="px-2">
              <SidebarMenuButton asChild className="w-[calc(100%-8px)]">
                <Link to="/settings">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </div>
          </SidebarMenuItem>

          {/* Profile Dropdown */}
          <SidebarMenuItem className="overflow-hidden">
            <div className="px-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-[calc(100%-8px)]">
                    <User className="h-4 w-4" />
                    <span className="truncate">{user?.email || 'Profile'}</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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
