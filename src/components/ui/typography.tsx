import { cn } from '@/lib/utils'
import { VariantProps, cva } from 'class-variance-authority'
import React from 'react'

const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'text-fluid-2xl font-display font-bold tracking-tight mb-4 text-zinc-900 dark:text-white',
      h2: 'text-fluid-xl font-display font-semibold tracking-tight mb-3 text-zinc-900 dark:text-white',
      h3: 'text-fluid-lg font-display font-medium tracking-tight mb-2 text-zinc-900 dark:text-white',
      h4: 'text-fluid-base font-display font-medium tracking-tight mb-2 text-zinc-900 dark:text-white',
      p: 'text-fluid-base leading-relaxed mb-4 text-zinc-800 dark:text-zinc-200',
      lead: 'text-fluid-lg text-zinc-600 dark:text-zinc-300',
      large: 'text-lg font-semibold text-zinc-900 dark:text-white',
      small: 'text-sm font-medium leading-none text-zinc-700 dark:text-zinc-300',
      muted: 'text-sm text-zinc-600 dark:text-zinc-400',
      gradient:
        'bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 dark:from-white dark:via-zinc-300 dark:to-white bg-clip-text text-transparent',
    },
    weight: {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    wrap: {
      balance: 'text-balance',
      pretty: 'text-pretty',
      normal: '',
    },
  },
  defaultVariants: {
    variant: 'p',
    weight: 'normal',
    align: 'left',
    wrap: 'normal',
  },
})

type ValidElements = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'

interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: ValidElements
}

export function Typography({
  className,
  variant,
  weight,
  align,
  wrap,
  as: Tag = 'p',
  ...props
}: TypographyProps) {
  return (
    <Tag
      className={cn(typographyVariants({ variant, weight, align, wrap, className }))}
      {...props}
    />
  )
}

// Usage examples:
// <Typography variant="h1">Heading 1</Typography>
// <Typography variant="lead" as="p" align="center">Lead text centered</Typography>
// <Typography variant="gradient" as="span" weight="bold">Gradient text</Typography>
// <Typography variant="p" wrap="pretty">Long paragraph with proper wrapping</Typography>
