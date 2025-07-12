import { StarBorder } from "@/components/ui/star-border"
import { Sparkles } from "lucide-react"

export function StarBorderDemo() {
  return (
    <div className="space-y-8">
      <StarBorder className="bg-gradient-to-r from-[#8257E5] to-[#B490FF] text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Start Creating
        </div>
      </StarBorder>
    </div>
  )
} 