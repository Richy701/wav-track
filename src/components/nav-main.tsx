import { Link, useLocation } from 'react-router-dom'
import { LucideIcon } from 'lucide-react'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const location = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sm font-medium text-violet-600/70 dark:text-violet-400/70 mb-3">Navigation</SidebarGroupLabel>
      <SidebarMenu className="px-2 space-y-2">
        {items.map((item) => {
          const isActive = location.pathname === item.url
          return (
            <SidebarMenuItem key={item.title} className="overflow-hidden">
              <div className="px-2">
                <SidebarMenuButton 
                  asChild
                  isActive={isActive}
                  className={`w-[calc(100%-8px)] transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-700 dark:text-violet-300 shadow-sm border border-violet-200/30 dark:border-violet-700/30' 
                      : 'hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-purple-500/10'
                  }`}
                >
                  <Link to={item.url} className="flex items-center gap-4">
                    {item.icon && (
                      <div className={`p-2 rounded-xl ${
                        isActive 
                          ? 'bg-violet-500/20 text-violet-600 dark:text-violet-400' 
                          : 'bg-violet-500/10 text-violet-500 dark:text-violet-400'
                      }`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                    )}
                    <span className="font-medium text-base">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </div>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}