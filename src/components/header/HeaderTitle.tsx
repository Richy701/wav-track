import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft as PhArrowLeft } from '@phosphor-icons/react'

export default function HeaderTitle() {
  const location = useLocation()
  const navigate = useNavigate()
  const showBackButton = location.pathname !== '/'

  return (
    <div className="flex items-center gap-4">
      {showBackButton && (
        <Button
          variant="ghost"
          size="icon"
          className="group relative overflow-hidden bg-black/80 hover:bg-black/60 text-white rounded-full w-8 h-8 p-0 transition-all duration-300 ease-out hover:scale-110 hover:shadow-lg hover:shadow-black/25"
          onClick={() => navigate('/')}
        >
          <PhArrowLeft className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-[-2px]" />
          <span className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      )}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent">
        WavTrack
      </h1>
    </div>
  )
}
