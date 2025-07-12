import { Hexagon, Github, Twitter } from "lucide-react"
import { Footer } from "@/components/ui/footer"

function Demo() {
  return (
    <div className="w-full">
      <Footer
        logo={<Hexagon className="h-10 w-10" />}
        brandName="WavTrack"
        socialLinks={[
          {
            icon: <Twitter className="h-5 w-5" />,
            href: "https://twitter.com/wavtrack",
            label: "Twitter",
          },
          {
            icon: <Github className="h-5 w-5" />,
            href: "https://github.com/wavtrack",
            label: "GitHub",
          },
        ]}
        mainLinks={[
          { href: "/", label: "Home" },
          { href: "/dashboard", label: "Dashboard" },
          { href: "/sessions", label: "Sessions" },
          { href: "/achievements", label: "Achievements" },
          { href: "/profile", label: "Profile" },
          { href: "/settings", label: "Settings" },
        ]}
        legalLinks={[
          { href: "/privacy", label: "Privacy Policy" },
          { href: "/terms", label: "Terms of Service" },
        ]}
        copyright={{
          text: "© 2024 WavTrack",
          license: "All rights reserved",
        }}
      />
    </div>
  )
}

export { Demo } 