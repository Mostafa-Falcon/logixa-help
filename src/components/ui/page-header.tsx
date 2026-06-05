import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  icon,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  icon?: ReactNode
  className?: string
}) {
  return (
    <section className={cn('surface-card hero-panel px-5 py-6 md:px-7', className)}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <div className="flex items-start gap-4">
            {icon && <div className="node-icon">{icon}</div>}
            <div>
              <h1 className="page-title text-3xl md:text-4xl">{title}</h1>
              {description && <p className="mt-3 max-w-3xl page-desc">{description}</p>}
            </div>
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  )
}
