import { Link } from 'react-router-dom';
import { 
  MusicNote, 
  Users as PhUsers, 
  Headphones, 
  Star,
  GithubLogo,
  TwitterLogo, 
  InstagramLogo, 
  YoutubeLogo 
} from '@phosphor-icons/react';
import { BeatsStar } from './icons/BeatsStar';

const Footer = () => {
  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border border-border/20">
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-x-12 gap-y-8">
            {/* Create */}
            <div className="text-center">
              <h4 className="text-sm font-medium mb-4 flex items-center justify-center gap-2 text-foreground/90">
                <MusicNote weight="fill" className="h-4 w-4 text-primary" />
                Create
              </h4>
              <nav className="flex flex-col space-y-3">
                <Link to="/beats" className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors">
                  My Beats
                </Link>
                <Link to="/studio" className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors">
                  Studio
                </Link>
                <Link to="/projects" className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors">
                  Projects
                </Link>
                <Link to="/samples" className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors">
                  Samples
                </Link>
              </nav>
            </div>

            {/* Community */}
            <div className="text-center">
              <h4 className="text-sm font-medium mb-4 flex items-center justify-center gap-2 text-foreground/90">
                <PhUsers weight="fill" className="h-4 w-4 text-primary" />
                Community
              </h4>
              <nav className="flex flex-col space-y-3">
                <Link to="/producers" className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors">
                  Producers
                </Link>
                <Link to="/collaborate" className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors">
                  Collaborate
                </Link>
                <Link to="/showcase" className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors">
                  Showcase
                </Link>
                <Link to="/forum" className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors">
                  Forum
                </Link>
              </nav>
            </div>

            {/* Resources */}
            <div className="text-center">
              <h4 className="text-sm font-medium mb-4 flex items-center justify-center gap-2 text-foreground/90">
                <Headphones weight="fill" className="h-4 w-4 text-primary" />
                Resources
              </h4>
              <nav className="flex flex-col space-y-3">
                <Link to="/learn" className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors">
                  Learn
                </Link>
                <Link to="/tutorials" className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors">
                  Tutorials
                </Link>
                <Link to="/support" className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors">
                  Support
                </Link>
                <Link to="/blog" className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors">
                  Blog
                </Link>
              </nav>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-10 flex items-center justify-center gap-6">
            <a 
              href="https://github.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              <GithubLogo weight="fill" className="h-5 w-5" />
            </a>
            <a 
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer" 
              className="text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              <TwitterLogo weight="fill" className="h-5 w-5" />
            </a>
            <a 
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer" 
              className="text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              <InstagramLogo weight="fill" className="h-5 w-5" />
            </a>
            <a 
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer" 
              className="text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              <YoutubeLogo weight="fill" className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 