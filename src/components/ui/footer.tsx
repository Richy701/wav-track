import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { theme } from "@/styles/theme"

interface FooterProps {
  logo: React.ReactNode
  brandName: string
  socialLinks: Array<{
    icon: React.ReactNode
    href: string
    label: string
  }>
  mainLinks: Array<{
    href: string
    label: string
  }>
  legalLinks: Array<{
    href: string
    label: string
  }>
  copyright: {
    text: string
    license?: string
  }
}

export function Footer({
  logo,
  brandName,
  socialLinks,
  mainLinks,
  legalLinks,
  copyright,
}: FooterProps) {
  const isExternalLink = (href: string) => href.startsWith('http')

  return (
    <footer className={cn(
      "pb-4 pt-8 lg:pb-6 lg:pt-12",
      "bg-white/80 dark:bg-zinc-900/80",
      "backdrop-blur-xl",
      "border-t border-zinc-200/50 dark:border-zinc-800/50"
    )}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="md:flex md:items-start md:justify-between">
          <Link
            to="/"
            className="flex items-center gap-x-2"
            aria-label={brandName}
          >
            {logo}
          </Link>
        </div>
        <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 mt-4 pt-4 md:mt-3 md:pt-3 lg:grid lg:grid-cols-10">
          <nav className="lg:mt-0 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-2 lg:justify-end">
              {mainLinks.map((link, i) => (
                <li key={i} className="my-1 mx-2 shrink-0">
                  {isExternalLink(link.href) ? (
                    <a
                      href={link.href}
                      className={cn(
                        "text-sm",
                        theme.text.link,
                        "underline-offset-4 hover:underline"
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className={cn(
                        "text-sm",
                        theme.text.link,
                        "underline-offset-4 hover:underline"
                      )}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-4 lg:mt-0 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-3 lg:justify-end">
              {legalLinks.map((link, i) => (
                <li key={i} className="my-1 mx-3 shrink-0">
                  {isExternalLink(link.href) ? (
                    <a
                      href={link.href}
                      className={cn(
                        "text-sm",
                        theme.text.muted,
                        "underline-offset-4 hover:underline"
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className={cn(
                        "text-sm",
                        theme.text.muted,
                        "underline-offset-4 hover:underline"
                      )}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className={cn(
            "mt-4 text-sm leading-6",
            theme.text.muted,
            "whitespace-nowrap lg:mt-0 lg:row-[1/3] lg:col-[1/4]"
          )}>
            <div>{copyright.text}</div>
            {copyright.license && <div>{copyright.license}</div>}
          </div>
        </div>
        <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 mt-4 pt-4 md:mt-3 md:pt-3">
          <div className="flex justify-center">
            <ul className="flex list-none space-x-3">
              {socialLinks.map((link, i) => (
                <li key={i}>
                  <Button
                    variant="secondary"
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-full",
                      "bg-white/50 dark:bg-zinc-900/50",
                      "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                      "border border-zinc-200 dark:border-zinc-800",
                      "text-zinc-800 dark:text-zinc-200",
                      "transition-all duration-200",
                      "hover:scale-[1.02] active:scale-[0.98]"
                    )}
                    asChild
                  >
                    <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                      {link.icon}
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
} 