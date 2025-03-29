import { Link } from 'react-router-dom'
import {
  MusicNote,
  Users as PhUsers,
  Headphones,
  Star,
  TwitterLogo,
  InstagramLogo,
  YoutubeLogo,
  Copyright,
} from '@phosphor-icons/react'
import { BeatsStar } from './icons/BeatsStar'

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
    <footer className="w-full border-t border-border/50 mt-24 bg-gradient-to-b from-muted/40 to-muted/20">
      <div className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-x-12">
            {/* Create */}
            <div className="text-center">
              <h4 className="text-sm font-medium mb-4 flex items-center justify-center gap-2">
                <MusicNote weight="fill" className="h-4 w-4 text-primary" />
                Create
              </h4>
              <nav className="flex flex-col space-y-3">
                <Link to="/beats" className="text-sm hover:text-primary transition-colors">
                  My Beats
                </Link>
                <Link to="/studio" className="text-sm hover:text-primary transition-colors">
                  Studio
                </Link>
                <Link to="/projects" className="text-sm hover:text-primary transition-colors">
                  Projects
                </Link>
              </nav>
            </div>

            {/* Community */}
            <div className="text-center">
              <h4 className="text-sm font-medium mb-4 flex items-center justify-center gap-2">
                <PhUsers weight="fill" className="h-4 w-4 text-primary" />
                Community
              </h4>
              <nav className="flex flex-col space-y-3">
                <Link to="/producers" className="text-sm hover:text-primary transition-colors">
                  Producers
                </Link>
                <Link to="/collaborate" className="text-sm hover:text-primary transition-colors">
                  Collaborate
                </Link>
                <Link to="/showcase" className="text-sm hover:text-primary transition-colors">
                  Showcase
                </Link>
              </nav>
            </div>

            {/* Resources */}
            <div className="text-center">
              <h4 className="text-sm font-medium mb-4 flex items-center justify-center gap-2">
                <Headphones weight="fill" className="h-4 w-4 text-primary" />
                Resources
              </h4>
              <nav className="flex flex-col space-y-3">
                <Link to="/learn" className="text-sm hover:text-primary transition-colors">
                  Learn
                </Link>
                <Link to="/tutorials" className="text-sm hover:text-primary transition-colors">
                  Tutorials
                </Link>
                <Link to="/support" className="text-sm hover:text-primary transition-colors">
                  Support
                </Link>
              </nav>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-8 md:mt-10 flex items-center justify-center gap-6">
            <a
              href="https://twitter.com/wavtrack"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors hover:scale-110 transform duration-200"
            >
              <TwitterLogo weight="fill" className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com/wavtrack"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors hover:scale-110 transform duration-200"
            >
              <InstagramLogo weight="fill" className="h-5 w-5" />
            </a>
            <a
              href="https://youtube.com/wavtrack"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors hover:scale-110 transform duration-200"
            >
              <YoutubeLogo weight="fill" className="h-5 w-5" />
            </a>
            <a
              href="https://discord.gg/wavtrack"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors hover:scale-110 transform duration-200"
            >
              <DiscordLogo />
            </a>
          </div>

          {/* Bottom Section */}
          <div className="mt-8 pt-8 border-t border-border/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Copyright className="h-4 w-4" />
                <span>2025 WavTrack. All rights reserved.</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
