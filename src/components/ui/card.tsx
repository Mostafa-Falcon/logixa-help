import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const cardVariants = cva('', {
  variants: {
    variant: {
      surface: 'surface-card',
      block: 'block-container',
      section: 'section-card',
      soft: 'surface-soft',
    },
    padding: {
      none: '',
      sm: 'p-4',
      md: 'p-5 md:p-6',
      lg: 'p-6 md:p-7',
    },
  },
  defaultVariants: {
    variant: 'surface',
    padding: 'none',
  },
})

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ className, variant, padding, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant, padding }), className)} {...props} />
}
