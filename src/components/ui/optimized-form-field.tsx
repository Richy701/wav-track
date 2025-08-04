// Optimized form field components to prevent cascade re-renders
import React, { memo, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from '@phosphor-icons/react'
import { useDebouncedCallback } from 'use-debounce'

interface OptimizedInputFieldProps {
  id: string
  name: string
  label: string
  value: string
  onChange: (name: string, value: string) => void
  placeholder?: string
  type?: string
  className?: string
  debounceMs?: number
}

export const OptimizedInputField = memo(function OptimizedInputField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
  debounceMs = 300
}: OptimizedInputFieldProps) {
  // Debounced change handler to prevent excessive re-renders
  const debouncedOnChange = useDebouncedCallback((name: string, value: string) => {
    onChange(name, value)
  }, debounceMs)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedOnChange(name, e.target.value)
  }, [debouncedOnChange, name])

  return (
    <div className="space-y-2 w-full">
      <Label htmlFor={id} className="text-sm font-medium text-foreground/90">
        {label}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={className || "w-full bg-white/10 dark:bg-white/5 backdrop-blur-xl text-sm rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-colors focus:ring-2 ring-primary/20"}
      />
    </div>
  )
}, (prevProps, nextProps) => {
  // Only re-render if essential props change
  return (
    prevProps.id === nextProps.id &&
    prevProps.value === nextProps.value &&
    prevProps.label === nextProps.label &&
    prevProps.placeholder === nextProps.placeholder
  )
})

interface OptimizedTextAreaFieldProps {
  id: string
  name: string
  label: string
  value: string
  onChange: (name: string, value: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
}

export const OptimizedTextAreaField = memo(function OptimizedTextAreaField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  className,
  debounceMs = 500
}: OptimizedTextAreaFieldProps) {
  const debouncedOnChange = useDebouncedCallback((name: string, value: string) => {
    onChange(name, value)
  }, debounceMs)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    debouncedOnChange(name, e.target.value)
  }, [debouncedOnChange, name])

  return (
    <div className="space-y-2 w-full md:col-span-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground/90">
        {label}
      </Label>
      <textarea
        id={id}
        name={name}
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={className || "w-full min-h-[100px] p-3 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-xl text-sm hover:bg-white/20 dark:hover:bg-white/10 transition-colors resize-y focus:ring-2 ring-primary/20"}
      />
    </div>
  )
})

interface OptimizedGenreFieldProps {
  genres: string[]
  availableGenres: string[]
  onGenreAdd: (genre: string) => void
  onGenreRemove: (genre: string) => void
}

export const OptimizedGenreField = memo(function OptimizedGenreField({
  genres,
  availableGenres,
  onGenreAdd,
  onGenreRemove
}: OptimizedGenreFieldProps) {
  const handleGenreSelect = useCallback((value: string) => {
    if (!genres.includes(value)) {
      onGenreAdd(value)
    }
  }, [genres, onGenreAdd])

  const handleGenreRemove = useCallback((genre: string) => {
    onGenreRemove(genre)
  }, [onGenreRemove])

  return (
    <div className="space-y-2 w-full">
      <Label className="text-sm font-medium text-foreground/90">Genres</Label>
      <div className="relative w-full min-h-[42px]">
        <Select onValueChange={handleGenreSelect}>
          <SelectTrigger className="w-full h-10 bg-white/10 dark:bg-white/5 backdrop-blur-xl text-foreground transition-colors hover:bg-white/20 dark:hover:bg-white/10">
            <SelectValue placeholder="Select a genre" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20 dark:border-white/10">
            {availableGenres.map(genre => (
              <SelectItem 
                key={genre} 
                value={genre}
                className="hover:bg-foreground/5"
              >
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {genres.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {genres.map(genre => (
            <Badge
              key={genre}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10"
            >
              {genre}
              <button
                type="button"
                className="ml-1 hover:text-destructive"
                onClick={() => handleGenreRemove(genre)}
                aria-label={`Remove ${genre} genre`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  // Compare arrays properly
  return (
    prevProps.genres.length === nextProps.genres.length &&
    prevProps.genres.every((genre, index) => genre === nextProps.genres[index])
  )
})