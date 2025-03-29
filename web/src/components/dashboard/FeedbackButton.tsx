import { Button } from '@/components/ui/button'
import { MessageSquarePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics'

export function FeedbackButton() {
  const handleFeedbackClick = () => {
    trackEvent(ANALYTICS_EVENTS.FEEDBACK_OPENED)
    window.open('https://form.typeform.com/to/eKWODiHs', '_blank')
  }

  return (
    <Button
      onClick={handleFeedbackClick}
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'shadow-lg shadow-violet-500/20',
        'bg-violet-600 hover:bg-violet-700',
        'dark:bg-violet-600 dark:hover:bg-violet-700',
        'text-white gap-2 pl-4 pr-5 py-6',
        'transition-all duration-200 ease-in-out',
        'hover:shadow-xl hover:shadow-violet-500/30',
        'hover:-translate-y-0.5',
        'group'
      )}
    >
      <MessageSquarePlus className="w-5 h-5 transition-transform group-hover:scale-110" />
      <span className="font-medium">Give Feedback</span>
    </Button>
  )
}
