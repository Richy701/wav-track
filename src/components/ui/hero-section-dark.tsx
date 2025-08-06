import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@phosphor-icons/react"
import { addToWaitlist } from "@/lib/waitlist"
import { toast } from "sonner"
import { CheckCircle } from "@phosphor-icons/react"

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: {
    regular: string
    gradient: string
  }
  description?: string
  ctaText?: string
  ctaHref?: string
  gridOptions?: {
    angle?: number
    cellSize?: number
    opacity?: number
    lightLineColor?: string
    darkLineColor?: string
  }
  onWaitlistSubmit?: () => void
}

const RetroGrid = ({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lightLineColor = "gray",
  darkLineColor = "gray",
}) => {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--light-line": lightLineColor,
    "--dark-line": darkLineColor,
  } as React.CSSProperties

  return (
    <div
      className={cn(
        "pointer-events-none absolute size-full overflow-hidden [perspective:200px]",
        `opacity-[var(--opacity)]`,
      )}
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="[background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent to-90% dark:from-black" />
    </div>
  )
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      title = "Build products for everyone",
      subtitle = {
        regular: "Designing your projects faster with ",
        gradient: "the largest figma UI kit.",
      },
      description = "Sed ut perspiciatis unde omnis iste natus voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae.",
      ctaText = "Browse courses",
      ctaHref = "#",
      gridOptions,
      onWaitlistSubmit,
      ...props
    },
    ref,
  ) => {
    const [email, setEmail] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const emailInputRef = React.useRef<HTMLInputElement>(null)

    const handleWaitlistSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsLoading(true)

      try {
        const { data, error } = await addToWaitlist(email)

        if (error) {
          // Handle specific error cases
          if (error.code === 'DUPLICATE_EMAIL' || error.status === 409) {
            toast.error("Already on the waitlist!", {
              description: "This email is already registered. We'll keep you posted!",
              className: "bg-white text-black dark:bg-zinc-900 dark:text-white border border-purple-500 shadow-lg rounded-xl px-4 py-3",
            })
          } else {
            toast.error("Something went wrong", {
              description: "Please try again later.",
              className: "bg-white text-black dark:bg-zinc-900 dark:text-white border border-red-500 shadow-lg rounded-xl px-4 py-3",
            })
          }
          return // Exit early on error
        }

        // Success case
        toast.success("You're on the waitlist!", {
          description: "We'll keep you posted as things roll out.",
          icon: <CheckCircle className="text-purple-500" />,
          className: "bg-white text-black dark:bg-zinc-900 dark:text-white border border-purple-500 shadow-lg rounded-xl px-4 py-3",
          duration: 4000,
        })

        setTimeout(() => {
          setEmail("")
        }, 3000)

        if (onWaitlistSubmit) {
          onWaitlistSubmit()
        }
      } catch (error: any) {
        console.error('Unexpected error in waitlist submission:', error)
        toast.error("Something went wrong", {
          description: "Please try again later.",
          className: "bg-white text-black dark:bg-zinc-900 dark:text-white border border-red-500 shadow-lg rounded-xl px-4 py-3",
        })
      } finally {
        setIsLoading(false)
      }
    }

    return (
      <div className={cn("relative", className)} ref={ref} {...props}>
        <div className="absolute top-0 z-[0] h-screen w-screen bg-white dark:bg-purple-950/10 bg-none dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <section className="relative max-w-full mx-auto z-1">
          <RetroGrid {...gridOptions} />
          <div className="max-w-screen-xl z-10 mx-auto px-4 py-28 gap-12 md:px-8">
            <div className="space-y-5 max-w-3xl leading-0 lg:leading-5 mx-auto text-center">
              <h1 className="text-sm text-zinc-800 dark:text-gray-400 group font-geist mx-auto px-5 py-2 bg-gradient-to-tr from-zinc-300/30 via-gray-400/30 to-transparent dark:from-zinc-300/5 dark:via-gray-400/5 border-[2px] border-black/10 dark:border-white/5 rounded-3xl w-fit">
                {title}
                <ChevronRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 duration-300" />
              </h1>
              <h2 className="text-4xl tracking-tighter font-geist bg-clip-text text-transparent mx-auto md:text-6xl bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.85)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]">
                {subtitle.regular}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600 dark:from-purple-300 dark:to-orange-200">
                  {subtitle.gradient}
                </span>
              </h2>
              <p className="max-w-2xl mx-auto text-zinc-800 dark:text-gray-300">
                {description}
              </p>
              <div className="flex justify-center mt-8">
                <div className="relative w-full max-w-md">
                  <form onSubmit={handleWaitlistSubmit} className="flex w-full overflow-hidden rounded-full border border-purple-500/20">
                    <Input
                      ref={emailInputRef}
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-12 px-6 bg-zinc-900 border-0 text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-full"
                      required
                    />
                    <Button 
                      type="submit" 
                      className="h-12 px-8 bg-white hover:bg-gray-100 text-black font-medium rounded-r-full transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Spinner className="h-4 w-4" />
                          <span>Joining...</span>
                        </div>
                      ) : (
                        "Join Waitlist"
                      )}
                    </Button>
                  </form>
                </div>
              </div>
              <div className="mt-6 text-sm text-muted-foreground">
                Join the growing community of producers on the waitlist
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  },
)
HeroSection.displayName = "HeroSection"

export { HeroSection } 