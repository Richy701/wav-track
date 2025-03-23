import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface StatusSelectProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function StatusSelect({ value, onChange, disabled }: StatusSelectProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="status">Status</Label>
      <div className="space-y-1.5">
        <Select value={value} onValueChange={onChange} name="status" disabled={disabled}>
          <SelectTrigger
            className="h-8 hover:bg-accent/50 transition-colors px-3 w-full bg-background dark:bg-background"
            id="status"
          >
            <SelectValue className="text-sm" />
          </SelectTrigger>
          <SelectContent className="bg-background dark:bg-background border shadow-lg min-w-[200px]">
            <SelectGroup>
              <SelectLabel className="text-xs text-muted-foreground px-3 py-1.5">
                Project Status
              </SelectLabel>
              <SelectItem
                value="idea"
                className="hover:bg-accent/50 cursor-pointer transition-colors px-3 py-1.5 text-sm data-[highlighted]:bg-accent/50"
              >
                <span className="text-red-600 dark:text-red-400">Idea</span>
              </SelectItem>
              <SelectItem
                value="in-progress"
                className="hover:bg-accent/50 cursor-pointer transition-colors px-3 py-1.5 text-sm data-[highlighted]:bg-accent/50"
              >
                <span className="text-orange-600 dark:text-orange-400">In Progress</span>
              </SelectItem>
              <SelectItem
                value="mixing"
                className="hover:bg-accent/50 cursor-pointer transition-colors px-3 py-1.5 text-sm data-[highlighted]:bg-accent/50"
              >
                <span className="text-yellow-600 dark:text-yellow-400">Mixing</span>
              </SelectItem>
              <SelectItem
                value="mastering"
                className="hover:bg-accent/50 cursor-pointer transition-colors px-3 py-1.5 text-sm data-[highlighted]:bg-accent/50"
              >
                <span className="text-blue-600 dark:text-blue-400">Mastering</span>
              </SelectItem>
              <SelectItem
                value="completed"
                className="hover:bg-accent/50 cursor-pointer transition-colors px-3 py-1.5 text-sm data-[highlighted]:bg-accent/50"
              >
                <span className="text-green-600 dark:text-green-400">Completed</span>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
