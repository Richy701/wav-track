import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Download } from 'lucide-react'
import { toast } from 'sonner'
import html2canvas from 'html2canvas'

interface ShareableCardProps {
  title: string
  stats: {
    label: string
    value: string | number
  }[]
  gradientColors: {
    from: string
    via?: string
    to: string
  }
  darkMode?: boolean
}

export function ShareableCard({
  title,
  stats,
  gradientColors,
  darkMode = true
}: ShareableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!cardRef.current) return

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: darkMode ? '#09090b' : '#ffffff',
        scale: 2
      })
      
      const image = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = image
      link.download = `wavtrack-${title.toLowerCase().replace(/\s+/g, '-')}.png`
      link.click()
      
      toast.success('Card downloaded successfully!')
    } catch (error) {
      console.error('Error generating image:', error)
      toast.error('Failed to generate shareable image')
    }
  }

  const handleShare = async () => {
    if (!cardRef.current) return

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: darkMode ? '#09090b' : '#ffffff',
        scale: 2
      })
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Failed to generate image')
        }

        try {
          const file = new File([blob], 'wavtrack-stats.png', { type: 'image/png' })
          await navigator.share({
            files: [file],
            title: 'WavTrack Stats',
            text: 'Check out my music production stats!'
          })
          toast.success('Shared successfully!')
        } catch (error) {
          // Fallback for browsers that don't support native sharing
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `wavtrack-${title.toLowerCase().replace(/\s+/g, '-')}.png`
          link.click()
          URL.revokeObjectURL(url)
          toast.success('Card downloaded successfully!')
        }
      }, 'image/png')
    } catch (error) {
      console.error('Error sharing:', error)
      toast.error('Failed to share')
    }
  }

  return (
    <div className="space-y-4">
      <div
        ref={cardRef}
        className={`relative overflow-hidden rounded-2xl border ${
          darkMode ? 'bg-zinc-900/90 text-zinc-50 border-zinc-800/50' : 'bg-white/90 text-zinc-900 border-zinc-200/50'
        } backdrop-blur-xl`}
        style={{ width: '600px', height: '315px' }}
      >
        {/* Background Gradient */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at top right, ${gradientColors.from} 0%, ${
              gradientColors.via ? `${gradientColors.via} 50%,` : ''
            } ${gradientColors.to} 100%)`
          }}
        />

        {/* Glass Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/5 backdrop-blur-sm" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-6">{title}</h2>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="space-y-1">
                  <p className={`text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Watermark */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1.5">
              <p className="text-base font-semibold tracking-tight text-zinc-400">
                WavTrack
              </p>
              <div className={`h-1 w-1 rounded-full animate-pulse ${
                darkMode ? 'bg-primary' : 'bg-zinc-900'
              }`} />
            </div>
            <p className={`text-sm font-medium ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleShare} className="flex-1">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
        <Button onClick={handleDownload} variant="outline" className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  )
} 