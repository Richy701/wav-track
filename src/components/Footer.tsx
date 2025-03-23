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
