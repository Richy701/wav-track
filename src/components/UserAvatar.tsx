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
import { UserIcon as UserSolid, Cog6ToothIcon as CogSolid, ArrowRightOnRectangleIcon as ArrowRightSolid } from '@heroicons/react/24/solid'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@/components/ui/spinner'
import { useImageCache } from '@/hooks/useImageCache'

const UserAvatar = () => {
  const { user, profile, logout, isLoggingOut } = useAuth()
  const navigate = useNavigate()
  const { cachedImage, isLoading, error } = useImageCache(profile?.avatar_url)

  const getInitials = () => {
    // Try to use name first
    if (profile?.name) {
      return profile.name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }
    
    // Fall back to email if no name
    if (profile?.email) {
      return profile.email[0].toUpperCase()
    }
    
    // Fall back to user email if profile email is not available
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    
    // Default fallback
    return 'U'
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-9 w-9 rounded-full hover:bg-accent" 
          aria-label="User menu"
          onClick={() => console.log('Avatar clicked')}
        >
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
      <DropdownMenuContent 
        className="w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg" 
        align="end" 
        forceMount
        onOpenAutoFocus={(e) => {
          console.log('Dropdown opened')
          e.preventDefault()
        }}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.name || profile?.email || user?.email || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile?.email || user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => navigate('/profile')}
          className="hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <UserSolid className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => navigate('/profile/settings')}
          className="hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <CogSolid className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            if (logout && !isLoggingOut) {
              await logout();
            }
          }}
          disabled={isLoggingOut}
          className="text-red-600 hover:bg-red-100 focus:text-red-600 dark:text-red-400 dark:hover:bg-red-950/20 dark:focus:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowRightSolid className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserAvatar
