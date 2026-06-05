'use client'

import * as Tooltip from '@radix-ui/react-tooltip'
import { Toaster } from 'sonner'

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip.Provider delayDuration={180}>
      {children}
      <Toaster
        position="bottom-center"
        richColors
        toastOptions={{
          classNames: {
            toast: 'sonner-toast',
            title: 'sonner-title',
            description: 'sonner-description',
          },
        }}
      />
    </Tooltip.Provider>
  )
}
