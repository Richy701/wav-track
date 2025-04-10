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
      variant="outline"
      className={cn(
        'text-muted-foreground hover:text-primary',
        'border-border/50 hover:border-primary/50',
        'bg-transparent hover:bg-primary/5',
        'transition-all duration-200',
        'gap-2'
      )}
    >
      <MessageSquarePlus className="h-4 w-4" />
      <span>Give Feedback</span>
    </Button>
  )
}
