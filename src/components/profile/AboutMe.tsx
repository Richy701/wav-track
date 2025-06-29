import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Gear,
  MusicNotes,
  ShareNetwork,
  Envelope,
} from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'
import XLogo from '@/components/XLogo'
import {
  FLStudioIcon,
  AbletonIcon,
  LogicProIcon,
  ProToolsIcon,
  StudioOneIcon,
  BitwigIcon,
  ReaperIcon,
} from '@/components/DawIcons'

const InstagramLogo = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const YoutubeLogo = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

const dawOptions = [
  { value: 'fl-studio', label: 'FL Studio', icon: <FLStudioIcon className="h-4 w-4" /> },
  { value: 'ableton', label: 'Ableton Live', icon: <AbletonIcon className="h-4 w-4" /> },
  { value: 'logic-pro', label: 'Logic Pro', icon: <LogicProIcon className="h-4 w-4" /> },
  { value: 'pro-tools', label: 'Pro Tools', icon: <ProToolsIcon className="h-4 w-4" /> },
  { value: 'studio-one', label: 'Studio One', icon: <StudioOneIcon className="h-4 w-4" /> },
  { value: 'bitwig', label: 'Bitwig', icon: <BitwigIcon className="h-4 w-4" /> },
  { value: 'reaper', label: 'Reaper', icon: <ReaperIcon className="h-4 w-4" /> },
]

export function AboutMe() {
  const { profile } = useAuth()

  const producerInfo = {
    equipment: [
      {
        name: 'DAW',
        value: profile?.daw || 'Add your DAW',
        icon: dawOptions.find(option => option.value === profile?.daw)?.icon,
      },
    ],
    genres: profile?.genres || [],
  }

  const socialLinks = [
    {
      name: 'Instagram',
      icon: <InstagramLogo />,
      href: profile?.social_links?.instagram || '#',
      username: profile?.social_links?.instagram_username || 'Add Instagram',
      className: 'text-[#E4405F] dark:text-[#E4405F] bg-[#E4405F]/5 dark:bg-[#E4405F]/10',
    },
    {
      name: 'X (Twitter)',
      icon: <XLogo className="h-4 w-4" />,
      href: profile?.social_links?.twitter || '#',
      username: profile?.social_links?.twitter_username || 'Add X',
      className: 'text-[#000000] dark:text-[#FFFFFF] bg-[#000000]/5 dark:bg-[#FFFFFF]/10',
    },
    {
      name: 'YouTube',
      icon: <YoutubeLogo />,
      href: profile?.social_links?.youtube || '#',
      username: profile?.social_links?.youtube_username || 'Add YouTube',
      className: 'text-[#FF0000] dark:text-[#FF0000] bg-[#FF0000]/5 dark:bg-[#FF0000]/10',
    },
    {
      name: 'Email',
      icon: <Envelope weight="fill" className="h-4 w-4" />,
      href: `mailto:${profile?.email || ''}`,
      username: profile?.email || 'Add Email',
      className: 'text-[#EA4335] dark:text-[#EA4335] bg-[#EA4335]/5 dark:bg-[#EA4335]/10',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">About Me</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-muted-foreground break-words">
            {profile?.bio ||
              'Add a bio to tell others about yourself and your music production journey.'}
          </p>
        </div>

        {/* Equipment Section */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Gear className="h-4 w-4 text-muted-foreground" />
            Equipment & Tools
          </h4>
          <div className="grid gap-2">
            {producerInfo.equipment.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Genres Section */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <MusicNotes className="h-4 w-4 text-muted-foreground" />
            Genres
          </h4>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(producerInfo.genres) ? producerInfo.genres : []).map((genre, index) => (
              <Badge key={index} variant="secondary">
                {genre}
              </Badge>
            ))}
            {producerInfo.genres.length === 0 && (
              <span className="text-sm text-muted-foreground">No genres added yet</span>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <ShareNetwork className="h-4 w-4 text-muted-foreground" />
            Connect & Share
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className={`rounded-full p-2 ${link.className} shrink-0`}>{link.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{link.name}</div>
                  <div className="text-sm text-muted-foreground truncate break-all">
                    {link.username}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
