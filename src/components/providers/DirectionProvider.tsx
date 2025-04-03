import React from 'react'
import { DirectionProvider as RadixDirectionProvider } from '@radix-ui/react-direction'

export function DirectionProvider({ children }: { children: React.ReactNode }) {
  return (
    <RadixDirectionProvider dir="ltr">
      {children}
    </RadixDirectionProvider>
  )
} 