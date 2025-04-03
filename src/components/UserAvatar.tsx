import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, Settings, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@/components/ui/spinner'
import { useImageCache } from '@/hooks/useImageCache'

const UserAvatar = () => {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const { cachedImage, isLoading, error } = useImageCache(profile?.avatar_url)

  const getInitials = () => {
    if (!profile?.name) return 'U'
    return profile.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full" aria-label="User menu">
          <Avatar className="h-9 w-9">
            {isLoading && !error && (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <Spinner className="h-4 w-4" />
              </div>
            )}
            {!isLoading && !error && cachedImage && (
              <AvatarImage
                src={cachedImage}
                alt={profile?.name || 'User avatar'}
              />
            )}
            {(error || !cachedImage) && (
              <AvatarFallback className="bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/profile/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout?.()}
          className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserAvatar
