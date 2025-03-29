import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Gear,
  MusicNotes,
  ShareNetwork,
  InstagramLogo,
  TwitterLogo,
  YoutubeLogo,
  Envelope,
} from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'
import {
  FLStudioIcon,
  AbletonIcon,
  LogicProIcon,
  ProToolsIcon,
  StudioOneIcon,
  BitwigIcon,
  ReaperIcon,
} from '@/components/DawIcons'

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
      icon: <InstagramLogo weight="fill" className="h-4 w-4" />,
      href: profile?.instagram || '#',
      username: profile?.instagram_username || 'Add Instagram',
    },
    {
      name: 'Twitter',
      icon: <TwitterLogo weight="fill" className="h-4 w-4" />,
      href: profile?.social?.twitter || '#',
      username: profile?.social?.twitter_username || 'Add Twitter',
    },
    {
      name: 'YouTube',
      icon: <YoutubeLogo weight="fill" className="h-4 w-4" />,
      href: profile?.social?.youtube || '#',
      username: profile?.social?.youtube_username || 'Add YouTube',
    },
    {
      name: 'Email',
      icon: <Envelope weight="fill" className="h-4 w-4" />,
      href: `mailto:${profile?.email || ''}`,
      username: profile?.email || 'Add Email',
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
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="rounded-full p-2 bg-muted shrink-0">{link.icon}</div>
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
