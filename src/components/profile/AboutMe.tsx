import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Gear,
  MusicNotes,
  ShareNetwork,
  Envelope,
  User,
  MusicNote,
  Link,
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
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

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
    <Card className="bg-white dark:bg-background border border-zinc-300 dark:border-input shadow-2xl rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">About Me</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bio Section */}
        <div className="relative border-b border-zinc-200 dark:border-white/10 pb-6">
          <div className="absolute -left-6 top-0 bottom-6 w-[2px] bg-gradient-to-b from-white/5 via-white/10 to-transparent" />
          <h4 className="font-medium mb-4 flex items-center gap-2 text-foreground/90">
            <User className="h-4 w-4 text-muted-foreground" />
            Bio
          </h4>
          <p className="text-muted-foreground/80 break-words text-base font-normal leading-relaxed tracking-wide">
            {profile?.bio ||
              'Add a bio to tell others about yourself and your music production journey.'}
          </p>
        </div>

        {/* Equipment Section */}
        <div className="relative border-b border-zinc-200 dark:border-white/10 pb-6">
          <div className="absolute -left-6 top-0 bottom-6 w-[2px] bg-gradient-to-b from-white/5 via-white/10 to-transparent" />
          <h4 className="font-medium mb-4 flex items-center gap-2 text-foreground/90">
            <Gear className="h-4 w-4 text-muted-foreground" />
            Equipment & Tools
          </h4>
          <div className="grid gap-3">
            {producerInfo.equipment.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-muted/10 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-muted/20 transition-all duration-300 hover:shadow-lg hover:shadow-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background/50 backdrop-blur-sm group-hover:bg-background/70 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-sm text-muted-foreground/80 truncate max-w-[150px] group-hover:text-foreground/90 transition-colors">
                  {item.value}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Genres Section */}
        <div className="relative border-b border-zinc-200 dark:border-white/10 pb-6">
          <div className="absolute -left-6 top-0 bottom-6 w-[2px] bg-gradient-to-b from-white/5 via-white/10 to-transparent" />
          <h4 className="font-medium mb-4 flex items-center gap-2 text-foreground/90">
            <MusicNote className="h-4 w-4 text-muted-foreground" />
            Genres
          </h4>
          <div className="flex flex-wrap gap-2">
            {producerInfo.genres.length > 0 ? (
              producerInfo.genres.map((genre, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Badge
                    variant="secondary"
                    className="bg-muted/10 hover:bg-muted/20 text-foreground/80 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-sm hover:shadow-white/5"
                  >
                    {genre}
                  </Badge>
                </motion.div>
              ))
            ) : (
              <span className="text-sm text-muted-foreground/80">Add your favorite genres</span>
            )}
          </div>
        </div>

        {/* Social Links Section */}
        <div className="relative">
          <div className="absolute -left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-white/5 via-white/10 to-transparent" />
          <h4 className="font-medium mb-4 flex items-center gap-2 text-foreground/90">
            <Link className="h-4 w-4 text-muted-foreground" />
            Social Links
          </h4>
          <div className="grid gap-3">
            {socialLinks.map((link, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-muted/10 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-muted/20 transition-all duration-300 hover:shadow-lg hover:shadow-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background/50 backdrop-blur-sm group-hover:bg-background/70 transition-colors">
                    {link.icon}
                  </div>
                  <span className="text-sm font-medium">{link.name}</span>
                </div>
                {link.href ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary/80 hover:text-primary truncate max-w-[150px] transition-colors"
                  >
                    {link.username || link.href}
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground/80 group-hover:text-foreground/90 transition-colors">Not connected</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
