import { Link } from 'react-router-dom'
import {
  TwitterLogo,
  InstagramLogo,
  YoutubeLogo,
  Copyright,
} from '@phosphor-icons/react'
import { FeedbackButton } from '@/components/dashboard/FeedbackButton'
import { ScrollToTop } from '@/components/ScrollToTop'
import { motion } from 'framer-motion'

const DiscordLogo = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

const Footer = () => {
  return (
    <>
      <footer className="w-full border-t border-border/50 mt-24 bg-gradient-to-b from-muted/40 to-muted/20">
        <div className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            {/* Social Links */}
            <div className="flex items-center justify-center gap-6">
              <motion.a
                href="https://twitter.com/wavtrack"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors hover:scale-110 transform duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Follow WavTrack on Twitter"
              >
                <TwitterLogo weight="fill" className="h-5 w-5" />
                <span className="sr-only">Follow WavTrack on Twitter</span>
              </motion.a>
              <motion.a
                href="https://instagram.com/wavtrack"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors hover:scale-110 transform duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Follow WavTrack on Instagram"
              >
                <InstagramLogo weight="fill" className="h-5 w-5" />
                <span className="sr-only">Follow WavTrack on Instagram</span>
              </motion.a>
              <motion.a
                href="https://youtube.com/wavtrack"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors hover:scale-110 transform duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Subscribe to WavTrack on YouTube"
              >
                <YoutubeLogo weight="fill" className="h-5 w-5" />
                <span className="sr-only">Subscribe to WavTrack on YouTube</span>
              </motion.a>
              <motion.a
                href="https://discord.gg/wavtrack"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors hover:scale-110 transform duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Join WavTrack Discord community"
              >
                <DiscordLogo />
                <span className="sr-only">Join WavTrack Discord community</span>
              </motion.a>
            </div>

            {/* Feedback Button */}
            <div className="mt-8 flex justify-center">
              <FeedbackButton />
            </div>

            {/* Copyright */}
            <div className="mt-8 pt-8 border-t border-border/30">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Copyright className="h-4 w-4" />
                <span>2025 WavTrack. All rights reserved.</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </>
  )
}

export default Footer
