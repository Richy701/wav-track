"use client";

import { Link } from "react-router-dom";
import { DIcons } from "dicons";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { theme } from "@/styles/theme";

import Footer from "@/components/ui/footer";

const navigation = {
  categories: [
    {
      id: "wavtrack",
      name: "WavTrack",
      sections: [
        {
          id: "main",
          name: "Main",
          items: [
            { name: "Home", href: "/" },
            { name: "Dashboard", href: "/dashboard" },
            { name: "Sessions", href: "/sessions" },
            { name: "Achievements", href: "/achievements" },
            { name: "Profile", href: "/profile" },
            { name: "Settings", href: "/profile/settings" },
          ],
        },
        {
          id: "legal",
          name: "Legal",
          items: [
            { name: "Privacy Policy", href: "/privacy-policy" },
            { name: "Terms of Service", href: "/terms-of-service" },
          ],
        },
      ],
    },
  ],
};

const Underline = cn(
  "hover:-translate-y-1 border border-zinc-200/80 dark:border-zinc-800/50 rounded-xl p-2.5 transition-transform",
  "hover:border-zinc-300 dark:hover:border-zinc-700"
);

export function FooterDemo() {
  return (
    <footer className={cn(
      "mx-auto w-full px-2",
      "border-t border-purple-200/50 dark:border-purple-800/30",
      "bg-white/95 dark:bg-zinc-900/80",
      "backdrop-blur-[2px] dark:backdrop-blur-xl"
    )}>


      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="border-b border-purple-200/50 dark:border-purple-800/30"> </div>
        <div className="py-6">
          {navigation.categories.map((category) => (
            <div
              key={category.name}
              className="grid grid-cols-3 flex-row justify-between gap-6 leading-6 md:flex"
            >
              {category.sections.map((section) => (
                <div key={section.name}>
                  <ul
                    role="list"
                    aria-labelledby={`${category.id}-${section.id}-heading-mobile`}
                    className="flex flex-col space-y-2"
                  >
                    {section.items.map((item) => (
                      <li key={item.name} className="flow-root">
                        <Link
                          to={item.href}
                          className={cn(
                            "text-base md:text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors",
                            theme.text.link
                          )}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="border-b border-purple-200/50 dark:border-purple-800/30"> </div>
      </div>

      <div className="flex flex-wrap justify-center gap-y-4">
        <div className="flex flex-wrap items-center justify-center gap-6 gap-y-4 px-6">
          <a
            aria-label="Twitter"
            href="https://twitter.com/wavtrack"
            rel="noopener noreferrer"
            target="_blank"
            className={cn(
              "hover:-translate-y-1 border border-purple-200/50 dark:border-purple-800/30 rounded-xl p-2.5 transition-all duration-200",
              "hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-600 dark:hover:text-purple-400"
            )}
          >
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle' }}>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a
            aria-label="Instagram"
            href="https://instagram.com/wavtrack"
            rel="noopener noreferrer"
            target="_blank"
            className={cn(
              "hover:-translate-y-1 border border-purple-200/50 dark:border-purple-800/30 rounded-xl p-2.5 transition-all duration-200",
              "hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-600 dark:hover:text-purple-400"
            )}
          >
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle' }}>
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a
            aria-label="YouTube"
            href="https://youtube.com/wavtrack"
            rel="noopener noreferrer"
            target="_blank"
            className={cn(
              "hover:-translate-y-1 border border-purple-200/50 dark:border-purple-800/30 rounded-xl p-2.5 transition-all duration-200",
              "hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-600 dark:hover:text-purple-400"
            )}
          >
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle' }}>
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
          <a
            aria-label="Discord"
            href="https://discord.gg/wavtrack"
            rel="noopener noreferrer"
            target="_blank"
            className={cn(
              "hover:-translate-y-1 border border-purple-200/50 dark:border-purple-800/30 rounded-xl p-2.5 transition-all duration-200",
              "hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-600 dark:hover:text-purple-400"
            )}
          >
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle' }}>
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </a>
        </div>
        <Footer />
      </div>

      <div className="mx-auto mb-6 mt-6 flex flex-col justify-between text-center text-sm md:max-w-7xl">
        <div className="flex flex-row items-center justify-center gap-1 text-gray-600 dark:text-gray-400">
          <span>© 2025 WavTrack</span>
          <span>-</span>
          <span>All rights reserved</span>
        </div>
      </div>
    </footer>
  );
} 